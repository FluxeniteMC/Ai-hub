"""Tests for the GitHub Actions workflows.

A workflow's inline `script:` block is JavaScript embedded in a YAML block
scalar. Getting its indentation wrong is invisible in review and breaks the
workflow at parse time, so every block is both YAML-parsed and syntax-checked
here.

These tests also pin the two behaviours that were actually wrong:

* a workflow that installs `@google/generative-ai` while running a script that
  imports `@google/genai` dies at require() time;
* a scheduled job that calls `issues.create` unconditionally produces one
  duplicate issue per run.
"""

import json
import os
import re
import shutil
import subprocess
import tempfile
import unittest

try:
    import yaml
except ImportError:  # pragma: no cover - environment without PyYAML
    yaml = None

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WORKFLOW_DIR = os.path.join(ROOT, ".github", "workflows")
SCRIPT_DIR = os.path.join(ROOT, "scripts")


def workflow_paths():
    if not os.path.isdir(WORKFLOW_DIR):
        return []
    return sorted(
        os.path.join(WORKFLOW_DIR, name)
        for name in os.listdir(WORKFLOW_DIR)
        if name.endswith((".yml", ".yaml"))
    )


def load(path):
    with open(path, encoding="utf-8") as handle:
        return yaml.safe_load(handle)


def steps(document):
    for job in (document.get("jobs") or {}).values():
        for step in job.get("steps") or []:
            yield step


@unittest.skipIf(yaml is None, "PyYAML is not installed")
class WorkflowTests(unittest.TestCase):
    def test_every_workflow_is_valid_yaml(self):
        paths = workflow_paths()
        self.assertTrue(paths, "expected at least one workflow")
        for path in paths:
            with self.subTest(workflow=os.path.basename(path)):
                # Raises yaml.YAMLError on malformed input.
                document = load(path)
                self.assertIsInstance(document, dict)
                self.assertIn("jobs", document, f"{path} declares no jobs")

    def test_every_inline_script_is_valid_javascript(self):
        node = shutil.which("node") or shutil.which("node.exe")
        if not node:
            self.skipTest("node is not on PATH")

        checked = 0
        for path in workflow_paths():
            document = load(path)
            for step in steps(document):
                script = (step.get("with") or {}).get("script")
                if not script:
                    continue
                with self.subTest(workflow=os.path.basename(path), step=step.get("name")):
                    with tempfile.NamedTemporaryFile(
                        "w", suffix=".cjs", delete=False, encoding="utf-8"
                    ) as handle:
                        # github-script runs the body as an async CommonJS module.
                        handle.write("const github = { rest: { issues: {} } };\n")
                        handle.write("const core = { info() {} };\n")
                        handle.write("const context = { repo: { owner: 'o', repo: 'r' } };\n")
                        handle.write("async function run() {\n")
                        handle.write(script)
                        handle.write("\n}\nmodule.exports = run;\n")
                        name = handle.name
                    try:
                        result = subprocess.run(
                            [node, "--check", name],
                            capture_output=True,
                            text=True,
                        )
                        self.assertEqual(
                            result.returncode,
                            0,
                            f"{os.path.basename(path)} / {step.get('name')}: "
                            f"{result.stderr.strip()}",
                        )
                        checked += 1
                    finally:
                        os.unlink(name)
        self.assertGreater(checked, 0, "no inline scripts were checked")

    def test_scheduled_jobs_do_not_create_duplicate_issues(self):
        """A repeating job must reuse one tracker instead of opening a new issue."""
        for path in workflow_paths():
            name = os.path.basename(path)
            document = load(path)
            for job_name, job in (document.get("jobs") or {}).items():
                # Only jobs that actually repeat on a schedule or on a recurring event.
                schedules = (
                    job.get("on", {}).get("schedule")
                    if isinstance(job.get("on"), dict)
                    else None
                )
                repeats = bool(schedules) or path.endswith(("weekly-report.yml", "validate.yml"))
                if not repeats:
                    continue

                for step in steps(document):
                    script = (step.get("with") or {}).get("script") or ""
                    if "issues.create({" not in script:
                        continue
                    with self.subTest(workflow=name, step=step.get("name")):
                        self.assertIn(
                            "issues.listForRepo",
                            script,
                            f"{name} / {job_name} creates an issue without looking for an "
                            f"existing one, so it duplicates on every run",
                        )

    def test_workflow_sdk_installs_match_the_scripts_they_run(self):
        with open(os.path.join(ROOT, "package.json"), encoding="utf-8") as handle:
            package = json.load(handle)
        self.assertIn(
            "@google/genai",
            package.get("dependencies", {}),
            "a bare `npm install` in CI must provide the SDK the scripts import",
        )

        for path in workflow_paths():
            with open(path, encoding="utf-8") as handle:
                text = handle.read()

            installed = set(re.findall(r"npm (?:ci|install)\s+(@google/[\w-]+)", text))
            required = set(re.findall(r"""require\(\s*["'](@google/[\w-]+)["']\s*\)""", text))

            # Packages required by the scripts this workflow runs count too.
            for script in re.findall(r"node (scripts/[\w.-]+\.js)", text):
                script_path = os.path.join(ROOT, script)
                if not os.path.exists(script_path):
                    continue
                with open(script_path, encoding="utf-8") as handle:
                    required.update(
                        re.findall(r"""require\(\s*["'](@google/[\w-]+)["']\s*\)""", handle.read())
                    )

            for package_name in installed:
                with self.subTest(workflow=os.path.basename(path), package=package_name):
                    self.assertIn(
                        package_name,
                        required,
                        f"{os.path.basename(path)} installs {package_name} but nothing it runs "
                        f"imports that package",
                    )

    def test_validate_workflow_installs_the_sdk_its_script_imports(self):
        path = os.path.join(WORKFLOW_DIR, "validate.yml")
        if not os.path.exists(path):
            self.skipTest("validate.yml not present")
        with open(path, encoding="utf-8") as handle:
            text = handle.read()

        # Ignore comment lines; the step documents the old package name on purpose.
        code = "\n".join(l for l in text.splitlines() if not re.match(r"^\s*#", l))

        self.assertIn("node scripts/gemini-analyzer.js", code)
        self.assertIn("npm install @google/genai", code)
        self.assertNotIn(
            "@google/generative-ai",
            code,
            "validate.yml must not install the deprecated SDK",
        )

    def test_dead_links_are_reported_and_blocked_links_are_not(self):
        """Only 404/410 are dead; rate limits must not file false-positive issues."""
        with open(os.path.join(SCRIPT_DIR, "validate-links.js"), encoding="utf-8") as handle:
            source = handle.read()
        self.assertIn("dead_links:", source)
        self.assertIn("blocked_links:", source)
        self.assertIn("dead_links_count=", source)

        path = os.path.join(WORKFLOW_DIR, "validate.yml")
        if not os.path.exists(path):
            self.skipTest("validate.yml not present")
        document = load(path)
        scripts = " ".join((s.get("with") or {}).get("script") or "" for s in steps(document))
        self.assertIn("dead_links", scripts)
        self.assertIn("blocked_links", scripts)


if __name__ == "__main__":
    unittest.main()