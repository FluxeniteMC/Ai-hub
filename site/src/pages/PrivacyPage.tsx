import {
  BarChart3,
  CloudCog,
  Cookie,
  Database,
  Eye,
  FileText,
  Fingerprint,
  Globe,
  Info,
  Lock,
  MessageCircleQuestion,
  Scale,
  Server,
  ShieldCheck,
  Trash2,
  TriangleAlert,
  UserX,
} from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';

import { LegalLayout, LegalSection } from '../components/legal/LegalLayout';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { COMPARE_STORAGE_KEY } from '../hooks/useCompareSelection';
import { THEME_STORAGE_KEY } from '../hooks/useTheme';
import { catalog } from '../lib/catalog';

const REPO_URL = catalog.source.repository;
const ISSUES_URL = `${REPO_URL}/issues`;

const SECTIONS = [
  { id: 'scope', title: 'Scope and who we are' },
  { id: 'no-collection', title: 'What we do not collect' },
  { id: 'automated', title: 'Information collected automatically' },
  { id: 'local', title: 'Data stored on your device' },
  { id: 'cookies', title: 'Cookies and analytics' },
  { id: 'third-parties', title: 'Third-party services' },
  { id: 'sharing', title: 'How we share data' },
  { id: 'retention', title: 'Retention' },
  { id: 'security', title: 'Security' },
  { id: 'children', title: "Children's privacy" },
  { id: 'gdpr', title: 'GDPR and UK GDPR' },
  { id: 'ccpa', title: 'California and US state rights' },
  { id: 'transfers', title: 'International transfers' },
  { id: 'changes', title: 'Changes to this policy' },
  { id: 'contact', title: 'Contact' },
] as const;

/** Link to another route inside the hash router. */
function SiteLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <a className="legal-ref" href={`#${to}`}>
      {children}
    </a>
  );
}

const RELATED = [
  {
    icon: Scale,
    title: 'Terms of Service',
    body: 'The terms that apply to using this site.',
    to: '/terms',
  },
  {
    icon: MessageCircleQuestion,
    title: 'Frequently Asked Questions',
    body: 'How the catalog is built and how to report an error.',
    to: '/faq',
  },
  {
    icon: FileText,
    title: 'Documentation',
    body: 'The build pipeline and the data rules it enforces.',
    to: '/docs',
  },
  {
    icon: CloudCog,
    title: 'Repository',
    body: 'The authoritative source for every listing.',
    to: REPO_URL,
  },
];

export function PrivacyPage() {
  useDocumentMeta(
    'Privacy Policy',
    'Fluxenite AI Hub collects no personal data. No accounts, no analytics, no advertising, no tracking cookies. This policy explains exactly what is stored and where.',
  );

  const [cleared, setCleared] = useState<string[]>([]);

  /**
   * Clears one localStorage key on the visitor's own device. Nothing is sent —
   * this exists so the policy's claim is verifiable rather than a promise.
   */
  const resetStorage = (key: string) => {
    try {
      window.localStorage.removeItem(key);
      setCleared((done) => (done.includes(key) ? done : [...done, key]));
    } catch {
      // Storage can be blocked by browser settings; nothing to clear then.
    }
  };

  const isCleared = (key: string) => cleared.includes(key);

  return (
    <LegalLayout
      eyebrow="Legal"
      eyebrowIcon={<ShieldCheck size={13} aria-hidden="true" />}
      title="Privacy Policy"
      summary={
        <>
          <p>
            The short version: <strong>we do not collect, store or share any personal data.</strong>{' '}
            There are no accounts, no analytics, no advertising and no tracking.
          </p>
          <p>
            Fluxenite AI Hub is a static website served from GitHub Pages. It has no backend, no
            database and no server-side application to log anything about you. The only data involved
            anywhere in this project is the public AI catalog you can see on the page, which belongs
            to the repository contributors who wrote it.
          </p>
        </>
      }
      effectiveDate="16 October 2026"
      lastReviewed="16 October 2026"
      facts={[
        { label: 'Version', value: '1.0' },
        { label: 'Analytics', value: 'None' },
        { label: 'Cookies', value: 'None' },
        { label: 'Accounts', value: 'None' },
        { label: 'Data sold', value: 'Never' },
      ]}
      sections={SECTIONS}
      tocNote={
        <>
          Found something that looks like it contradicts this policy?{' '}
          <a href={ISSUES_URL} target="_blank" rel="noopener noreferrer">
            Please report it
          </a>
          .
        </>
      }
    >
      <LegalSection id="scope" index={0} title="Scope and who we are">
        <p>
          This policy covers the public website published at{' '}
          <code>{catalog.source.pagesUrl}</code> and the code that builds it. It does not cover third
          party sites you visit after following a link from here — those have their own policies,
          described in{' '}
          <a href={`${catalog.source.pagesUrl}/#/terms/third-party`} className="legal-ref">
            §6 of the Terms of Service
          </a>
          .
        </p>
        <p>
          The site is maintained as an open-source project. The &ldquo;we&rdquo; in this policy means
          the project&rsquo;s maintainers and contributors acting in that capacity. Contact details are
          in <a href={`${catalog.source.pagesUrl}/#/privacy/contact`} className="legal-ref">§15</a>.
        </p>
        <p>
          <strong>
            This policy describes what the software actually does, not what it is permitted to do.
          </strong>{' '}
          The code is public, so every claim here can be verified by reading it.
        </p>
      </LegalSection>

      <LegalSection id="no-collection" index={1} title="What we do not collect">
        <p>We do not ask for, receive or store any of the following, anywhere in this project:</p>
        <dl className="legal-definitions">
          <div className="legal-definitions__row">
            <dt>
              <UserX size={13} aria-hidden="true" /> Identity
            </dt>
            <dd>
              No names, email addresses, phone numbers, usernames, or accounts of any kind. The site
              has no sign-up and no login.
            </dd>
          </div>
          <div className="legal-definitions__row">
            <dt>
              <BarChart3 size={13} aria-hidden="true" /> Usage analytics
            </dt>
            <dd>
              No analytics service is embedded. We do not run page-view tracking, session recording,
              heatmaps, A/B tests, or funnel instrumentation.
            </dd>
          </div>
          <div className="legal-definitions__row">
            <dt>
              <Cookie size={13} aria-hidden="true" /> Advertising data
            </dt>
            <dd>
              No advertising, remarketing pixels, or data brokers. There is nothing to sell because
              there is nothing collected.
            </dd>
          </div>
          <div className="legal-definitions__row">
            <dt>
              <Fingerprint size={13} aria-hidden="true" /> Device fingerprinting
            </dt>
            <dd>
              No canvas, audio or font fingerprinting, and no attempt to identify you across sites.
            </dd>
          </div>
          <div className="legal-definitions__row">
            <dt>
              <Globe size={13} aria-hidden="true" /> Precise location
            </dt>
            <dd>
              No geolocation APIs are called and no location data is requested or inferred for
              tracking.
            </dd>
          </div>
        </dl>
        <p>
          We also do not build or enrich profiles. Because nothing is collected, there is no profile
          to create even in principle.
        </p>
      </LegalSection>

      <LegalSection id="automated" index={2} title="Information collected automatically">
        <p>
          <strong>
            Any server logs you can see are produced by GitHub, not by this project.
          </strong>{' '}
          The site is hosted on GitHub Pages, so GitHub&rsquo;s infrastructure handles the request
          before any code of ours runs.
        </p>
        <p>
          Like any web server, GitHub may record standard technical request data such as IP address,
          user agent, requested URL, referrer, and timestamp, in order to serve the file, prevent
          abuse, and diagnose faults. That processing is governed by the{' '}
          <a
            href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub Privacy Statement
          </a>{' '}
          and is not controlled or configured by this project.
        </p>
        <p>
          We do not have access to that infrastructure, do not add anything to it, and do not use it
          for profiling or marketing. If you want to know exactly what GitHub records, read{' '}
          <a
            href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement#information-githubs-collects-and-when"
            target="_blank"
            rel="noopener noreferrer"
          >
            their documentation
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection id="local" index={3} title="Data stored on your device">
        <p>
          A small number of settings are saved in your browser&rsquo;s <code>localStorage</code>. These
          never leave your device, are never transmitted to us, and are not readable by us. Clearing
          your browser data removes them permanently.
        </p>
        <dl className="legal-definitions">
          <div className="legal-definitions__row">
            <dt>
              <Eye size={13} aria-hidden="true" /> Theme preference
            </dt>
            <dd>
              Stores whether you chose light or dark, as <code>{THEME_STORAGE_KEY}</code>. Used only to avoid
              re-flashing the wrong theme on your next visit.{' '}
              <button
                type="button"
                className="legal-inline-button"
                onClick={() => resetStorage(THEME_STORAGE_KEY)}
                disabled={isCleared(THEME_STORAGE_KEY)}
              >
                {isCleared(THEME_STORAGE_KEY) ? 'Cleared' : 'Clear this value'}
              </button>
            </dd>
          </div>
          <div className="legal-definitions__row">
            <dt>
              <BarChart3 size={13} aria-hidden="true" /> Comparison selection
            </dt>
            <dd>
              Stores the listings you picked for side-by-side comparison, so the selection survives a
              refresh, under <code>{COMPARE_STORAGE_KEY}</code>.{' '}
              <button
                type="button"
                className="legal-inline-button"
                onClick={() => resetStorage(COMPARE_STORAGE_KEY)}
                disabled={isCleared(COMPARE_STORAGE_KEY)}
              >
                {isCleared(COMPARE_STORAGE_KEY) ? 'Cleared' : 'Clear this value'}
              </button>
            </dd>
          </div>
        </dl>
        <p>
          <strong>None of this identifies you.</strong> It is not tied to an account, IP address or
          device identifier, and it is never sent anywhere. Because the site is fully static, your
          browser never even contacts a server of ours while you use it — after the page files load,
          search, filtering and comparison all run entirely on your device.
        </p>
      </LegalSection>

      <LegalSection id="cookies" index={4} title="Cookies and analytics">
        <p>
          <strong>This site sets no cookies.</strong> Not one, for any purpose. The two stored values
          described above use <code>localStorage</code>, which is a different mechanism that is never
          transmitted with requests.
        </p>
        <p>
          No third-party scripts load. That includes analytics, tag managers, chat widgets, fonts
          served from other origins, embedded videos, social buttons and social login widgets. Because
          no external code runs on the page, no external party can observe your visit.
        </p>
        <div className="callout legal-note">
          <Info size={16} className="callout__icon" aria-hidden="true" />
          <div>
            <p className="callout__title">No cross-site tracking is technically possible</p>
            <p>
              Any site without third-party requests cannot share your visit with anyone else. This is
              a property of the architecture, not a policy promise — there is no code on these pages
              that could phone home.
            </p>
          </div>
        </div>
      </LegalSection>

      <LegalSection id="third-parties" index={5} title="Third-party services">
        <p>
          When you follow a link to a provider, a model vendor, or GitHub, you leave this site and
          enter a service governed by that provider&rsquo;s own privacy policy. Those services are
          independent of this project.
        </p>
        <ul className="legal-list">
          <li>
            <strong>Listing links.</strong> Each entry links to the provider&rsquo;s official page.
            That site&rsquos privacy practices are entirely its own.
          </li>
          <li>
            <strong>GitHub.</strong> The repository, issue tracker, actions and Pages hosting are
            operated by GitHub, under the{' '}
            <a
              href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub Privacy Statement
            </a>
            .
          </li>
          <li>
            <strong>Fonts.</strong> Typography is served from your own device or system fonts. No
            font is fetched from Google or any other third-party host, so no IP address or referrer is
            disclosed to them.
          </li>
        </ul>
        <p>
          If you send data to an AI provider you found here, that provider decides how it is stored
          and used. We never receive it and have no ability to see it.
        </p>
      </LegalSection>

      <LegalSection id="sharing" index={6} title="How we share data">
        <p>
          <strong>We do not share personal data, because we never collect any.</strong> There is no
          data broker relationship, no advertising partner, no data sharing arrangement and no sale.
        </p>
        <p>
          Two categories of information do exist in this project, and neither is personal data:
        </p>
        <ul className="legal-list">
          <li>
            <strong>The public catalog.</strong> AI providers and their publicly documented details,
            contributed openly to a public repository under its own licence. Available to anyone at
            any time, including without visiting this site.
          </li>
          <li>
            <strong>Repository contribution records.</strong> GitHub records who contributed what, in
            order to attribute and credit contributions. This is GitHub&rsquo;s data under GitHub&rsquo;s
            policy, and is public by design.
          </li>
        </ul>
        <p>
          We do not disclose personal information to third parties, because we hold none. We have
          never received a government or law-enforcement request for user data, and we could not
          comply with one even if we did, since there is nothing to hand over.
        </p>
      </LegalSection>

      <LegalSection id="retention" index={7} title="Retention">
        <p>
          Because we hold no personal data, <strong>there is no retention schedule.</strong> Nothing
          accumulates on our side to delete, expire or archive.
        </p>
        <ul className="legal-list">
          <li>
            <strong>Our side:</strong> nothing about you is retained, ever.
          </li>
          <li>
            <strong>Your device:</strong> the two <code>localStorage</code> values stay until you clear
            them — through your browser settings, or the reset controls in{' '}
            <a href={`${catalog.source.pagesUrl}/#/privacy/local`} className="legal-ref">§4</a>.
          </li>
          <li>
            <strong>GitHub:</strong> repository history and contributions persist for as long as the
            project does, under GitHub&rsquo;s policy.
          </li>
          <li>
            <strong>Server logs:</strong> retained by GitHub for the period its documentation
            specifies.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="security" index={8} title="Security">
        <p>
          Security here is a consequence of how little happens: <strong>there is no server-side
          attack surface for your data because there is no server-side application at all.</strong>{' '}
          The site is pre-built static files.
        </p>
        <p>Design choices that follow from this:</p>
        <ul className="legal-list">
          <li>
            <Lock size={13} aria-hidden="true" /> No backend, no database, no user accounts to
            compromise, and no credentials or API keys in the browser.
          </li>
          <li>
            <Server size={13} aria-hidden="true" /> No runtime calls to the GitHub API — the catalog
            is generated at build time and bundled into the page, so nothing queries a data source
            while you browse.
          </li>
          <li>
            Content is rendered without injecting raw HTML, which removes a common cross-site
            scripting vector.
          </li>
          <li>
            The build fails rather than shipping if catalog validation fails, so a malformed release
            cannot reach visitors.
          </li>
        </ul>
        <p>
          The catalog is still <strong>served over HTTPS</strong> by GitHub Pages. Note that no
          transport protection can make a third-party site you navigate to trustworthy — that is why
          we point you to official vendor documentation rather than reproducing it.
        </p>
      </LegalSection>

      <LegalSection id="children" index={9} title="Children's privacy">
        <p>
          This site is a general-audience technical reference and is <strong>not directed at
          children</strong>. Because it collects no personal data from anyone, it collects none from
          children either.
        </p>
        <p>
          If you are under the age at which you can lawfully consent to data processing in your
          jurisdiction, you do not need to provide any information to use this site — and none is
          ever requested. If you believe a child has submitted personal information through the issue
          tracker or a pull request, contact us via{' '}
          <a href={`${catalog.source.pagesUrl}/#/privacy/contact`} className="legal-ref">§15</a> and it
          will be handled through GitHub&rsquo;s processes.
        </p>
      </LegalSection>

      <LegalSection id="gdpr" index={10} title="GDPR and UK GDPR">
        <p>
          This section describes the position under the EU and UK General Data Protection
          Regulations, to the extent they apply to you. It is written for transparency, not as legal
          advice.
        </p>
        <dl className="legal-definitions">
          <div className="legal-definitions__row">
            <dt>
              <Database size={13} aria-hidden="true" /> Do we process your data?
            </dt>
            <dd>
              <strong>No.</strong> We act as neither a data controller nor a processor for personal
              data about site visitors, because we do not collect any.
            </dd>
          </div>
          <div className="legal-definitions__row">
            <dt>
              <Cookie size={13} aria-hidden="true" /> Consent and cookies
            </dt>
            <dd>
              No consent is required or requested, because there is no processing that would need it.
              No cookies are set, so there is nothing to reject.
            </dd>
          </div>
          <div className="legal-definitions__row">
            <dt>
              <Eye size={13} aria-hidden="true" /> Your rights
            </dt>
            <dd>
              The rights in Articles 15–22 — access, rectification, erasure, restriction,
              portability and objection — presuppose personal data we hold. Since we hold none, there
              is nothing to retrieve, correct or erase.
            </dd>
          </div>
          <div className="legal-definitions__row">
            <dt>
              <Trash2 size={13} aria-hidden="true" /> Your browser storage
            </dt>
            <dd>
              Values in <code>localStorage</code> are under your control, not ours. You can clear or
              inspect them at any time in your browser settings, or use the reset controls in{' '}
              <a href={`${catalog.source.pagesUrl}/#/privacy/local`} className="legal-ref">§4</a>. We
              cannot read them and have no copy.
            </dd>
          </div>
          <div className="legal-definitions__row">
            <dt>
              <CloudCog size={13} aria-hidden="true" /> Hosting and processors
            </dt>
            <dd>
              Our pages are hosted by GitHub. If you require analysis of GitHub&rsquo;s processing as a
              processor or sub-processor, it is governed by the{' '}
              <a
                href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub Privacy Statement
              </a>{' '}
              and the{' '}
              <a
                href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement#european-economic-area-gdpr"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub GDPR addendum
              </a>
              .
            </dd>
          </div>
        </dl>
        <p>
          <strong>Supervisory authority.</strong> If you believe data about you has been processed
          unlawfully, you may complain to your local supervisory authority. In practice the correct
          first step for anything concerning this site is the public issue tracker, so the answer
          benefits other visitors too.
        </p>
      </LegalSection>

      <LegalSection id="ccpa" index={11} title="California and US state rights">
        <p>
          The CCPA/CPRA and similar state laws give consumers rights over personal information a
          business collects. <strong>This project is not a business that collects personal
          information</strong>, and the CCPA&rsquo;s own definition excludes publicly available data
          and data processed only to complete a service you requested.
        </p>
        <dl className="legal-definitions">
          <div className="legal-definitions__row">
            <dt>Sell or share</dt>
            <dd>
              We do not sell, rent, trade or share personal information as those terms are defined
              by the CCPA. There is no data to sell.
            </dd>
          </div>
          <div className="legal-definitions__row">
            <dt>Your rights</dt>
            <dd>
              Rights to know, delete, correct, opt out of sale, limit use of sensitive information, and
              appeal — none are exercisable against this project, because no personal information is
              collected.
            </dd>
          </div>
          <div className="legal-definitions__row">
            <dt>Do not sell or share</dt>
            <dd>
              There is no sale or sharing to opt out of, so no banner or link for that purpose is
              displayed. Adding one would be misleading.
            </dd>
          </div>
        </dl>
        <p>
          Data contributed by maintainers and contributors to the public repository — names, email
          addresses in commit metadata, and the like — is publicly available information under GitHub,
          collected by GitHub under its own policy, and is excluded from these statutes by definition.
        </p>
      </LegalSection>

      <LegalSection id="transfers" index={12} title="International transfers">
        <p>
          The pages you read are static files served to your browser wherever you are. <strong>We do
          not transfer personal data across borders, because we never hold any to transfer.</strong>
        </p>
        <ul className="legal-list">
          <li>No personal data is stored in any jurisdiction, so no transfer mechanism is required.</li>
          <li>
            Static assets are delivered by GitHub&rsquo;s global content-delivery network, which may
            serve you a cached copy from a nearby location. That is a network delivery of code and
            catalog content — not a transfer of personal data.
          </li>
          <li>
            Public repository data is hosted by GitHub, whose own transfer terms are described in
            their{' '}
            <a
              href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement"
              target="_blank"
              rel="noopener noreferrer"
            >
              privacy statement
            </a>
            .
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="changes" index={13} title="Changes to this policy">
        <p>
          Because the site is generated from a public repository, changes to this policy are reviewed,
          published and built like any other change to the project.
        </p>
        <ul className="legal-list">
          <li>
            The revision date at the top of this page is authoritative, and the full history is
            visible in the repository&rsquo;s commit log.
          </li>
          <li>
            Sections that did not change may keep their original date. A new revision date does not
            imply every section changed.
          </li>
          <li>
            If a future change ever introduced data collection, this policy would be updated before
            that change shipped, and would describe what is collected and why.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="contact" index={14} title="Contact">
        <p>
          This project has no support desk, no email address and no contact form — there is nothing
          behind this site to receive them. <strong>Public issue trackers are the only channel</strong>,
          and they suit this project better anyway: an answer posted there helps the next person with
          the same question.
        </p>
        <dl className="legal-definitions">
          <div className="legal-definitions__row">
            <dt>Privacy question</dt>
            <dd>
              <a href={ISSUES_URL} target="_blank" rel="noopener noreferrer">
                Open an issue
              </a>{' '}
              on the repository. Include the page URL and what you observed.
            </dd>
          </div>
          <div className="legal-definitions__row">
            <dt>Something looks wrong</dt>
            <dd>
              Please report it. If you believe this policy is inaccurate, that is itself a privacy
              concern and should be raised promptly.
            </dd>
          </div>
          <div className="legal-definitions__row">
            <dt>Correction to the catalog</dt>
            <dd>
              Edit <code>README.md</code> via a{' '}
              <a
                href={`${REPO_URL}/blob/main/CONTRIBUTING.md`}
                target="_blank"
                rel="noopener noreferrer"
              >
                pull request
              </a>
              . The repository is the authoritative source, so a fix belongs there rather than in a
              discussion.
            </dd>
          </div>
        </dl>
        <p>
          <strong>
            <TriangleAlert size={13} aria-hidden="true" /> This policy is a plain-language statement
            by an open-source project.
          </strong>{' '}
          It is not legal advice and has not been reviewed by a lawyer. It is written to be accurate
          about how this specific software behaves; if you need advice about your own obligations,
          consult a qualified professional.
        </p>
      </LegalSection>

      <nav className="panel panel--padded legal-note" aria-label="Related documents">
        <p className="legal-toc__label">Related documents</p>
        <ul className="link-grid" style={{ marginTop: 'var(--space-4)' }}>
          {RELATED.map(({ icon: Icon, title, body, to }) => (
            <li key={title}>
              <a
                className="panel panel--padded link-card"
                href={to.startsWith('http') ? to : `#${to}`}
                {...(to.startsWith('http')
                  ? { target: '_blank', rel: 'noopener noreferrer' }
                  : {})}
              >
                <Icon size={18} aria-hidden="true" />
                <span>
                  <strong>{title}</strong>
                  <span className="link-card__meta">{body}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
        <p className="doc-muted" style={{ marginTop: 'var(--space-4)' }}>
          <SiteLink to="/faq">
            <MessageCircleQuestion size={12} aria-hidden="true" /> Still have questions?
          </SiteLink>{' '}
          The FAQ covers how the catalog is generated and how to report an error.
        </p>
      </nav>
    </LegalLayout>
  );
}

