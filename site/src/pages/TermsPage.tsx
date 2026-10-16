import { FileText, MessageCircleQuestion, Scale, ShieldCheck, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';

import { LegalLayout, LegalSection } from '../components/legal/LegalLayout';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { catalog } from '../lib/catalog';

const REPO_URL = catalog.source.repository;
const ISSUES_URL = `${REPO_URL}/issues`;

/** Anchors declared once so the table of contents and the sections agree. */
const SECTIONS = [
  { id: 'acceptance', title: 'Acceptance of these terms' },
  { id: 'what-it-is', title: 'What the service is' },
  { id: 'community-data', title: 'The catalog is community-maintained' },
  { id: 'no-warranty', title: 'No warranty of accuracy' },
  { id: 'pricing', title: 'Pricing and availability change' },
  { id: 'third-party', title: 'Third parties and vendor contracts' },
  { id: 'no-affiliation', title: 'No affiliation or endorsement' },
  { id: 'acceptable-use', title: 'Acceptable use' },
  { id: 'contributions', title: 'Your contributions' },
  { id: 'licence', title: 'Licence and trademarks' },
  { id: 'disclaimer', title: 'Disclaimer of warranties' },
  { id: 'liability', title: 'Limitation of liability' },
  { id: 'indemnity', title: 'Indemnity' },
  { id: 'changes', title: 'Changes to these terms' },
  { id: 'disputes', title: 'Governing law and disputes' },
  { id: 'general', title: 'Severability and general terms' },
] as const;

/** Cross-reference link to another section of this same page. */
function SectionRef({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a className="legal-ref" href={`${catalog.source.pagesUrl}/#${href}`}>
      {children}
    </a>
  );
}

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
    icon: ShieldCheck,
    title: 'Privacy Policy',
    body: 'What this site does and does not collect.',
    to: '/privacy',
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
    icon: Scale,
    title: 'Repository',
    body: 'The authoritative source for every listing.',
    to: REPO_URL,
  },
];

export function TermsPage() {
  useDocumentMeta(
    'Terms of Service',
    'The terms that apply to using Fluxenite AI Hub — a free, community-maintained AI directory with no accounts, no payments and no tracking.',
  );

  return (
    <LegalLayout
      eyebrow="Legal"
      eyebrowIcon={<Scale size={13} aria-hidden="true" />}
      title="Terms of Service"
      summary={
        <>
          <p>
            These terms cover your use of <strong>Fluxenite AI Hub</strong>, the free public directory
            published at <code>{catalog.source.pagesUrl}</code>. The site is a static, read-only view
            of a community-maintained repository: no accounts, no payments, no advertising, and no
            personal data.
          </p>
          <p>
            Because you are reading information rather than transacting with us, these terms are
            deliberately plain. The most important point is in{' '}
            <SectionRef href="terms/no-warranty">§4</SectionRef>: we list what other vendors built
            and sold at the moment the catalog was generated, and we cannot promise it is still
            correct.
          </p>
        </>
      }
      effectiveDate="16 October 2026"
      lastReviewed="16 October 2026"
      facts={[
        { label: 'Version', value: '1.0' },
        { label: 'Applies to', value: 'fluxenitemc.github.io/Ai-hub' },
        { label: 'Contact', value: 'GitHub issues' },
      ]}
      sections={SECTIONS}
      tocNote={
        <>
          Questions about these terms? Open an issue on the{' '}
          <a href={ISSUES_URL} target="_blank" rel="noopener noreferrer">
            repository
          </a>
          .
        </>
      }
    >
      <LegalSection id="acceptance" index={0} title="Acceptance of these terms">
        <p>
          By loading or using this site you agree to these terms. If you do not agree with them, stop
          using the site.
        </p>
        <p>
          These terms apply to every visitor. There is no account to create and nothing to sign, so
          most obligations you would find in a typical software licence simply do not arise here.
        </p>
        <p>
          If you are using the site on behalf of an organisation, you confirm you have authority to
          accept these terms on its behalf.
        </p>
      </LegalSection>

      <LegalSection id="what-it-is" index={1} title="What the service is">
        <p>
          Fluxenite AI Hub is a <strong>directory and reference tool</strong>. It presents AI APIs,
          models, vector databases and developer tools catalogued in the{' '}
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
            FluxeniteMC/Ai-hub
          </a>{' '}
          repository so they can be searched, filtered and compared side by side.
        </p>
        <p>What the site does:</p>
        <ul className="legal-list">
          <li>
            Reads the repository <code>README.md</code> at build time and converts its tables into a
            searchable catalog.
          </li>
          <li>Generates documentation and weekly summary reports from repository history.</li>
          <li>
            Publishes that content as static files on GitHub Pages — built ahead of time, served
            without a database.
          </li>
        </ul>
        <p>What the site does not do:</p>
        <ul className="legal-list">
          <li>It does not sell, resell, broker or intermediate any model, API or service.</li>
          <li>It does not accept payments, hold funds, or handle any billing.</li>
          <li>
            It does not grant access to any model. To use a listed provider you must go directly to
            that provider and accept its own terms.
          </li>
          <li>It does not license any vendor&rsquo;s intellectual property to you.</li>
        </ul>
        <p>
          Features may be added, changed or removed, and the site may be discontinued at any time.
        </p>
      </LegalSection>

      <LegalSection id="community-data" index={2} title="The catalog is community-maintained">
        <p>
          The listings come from a public repository edited by contributors and maintained by the
          project&rsquo;s own automation. <strong>We do not author, verify or endorse the underlying
          claims.</strong> A listing appearing here means a row was found in a repository table —
          nothing more.
        </p>
        <p>
          Generation applies strict rules so nothing is fabricated. Fields the repository does not
          state are left blank and shown as <em>Not stated</em>. Token pricing is parsed only when the
          source states a matching input/output pair. Anything the build cannot attribute is dropped
          rather than filled in.
        </p>
        <p>
          Those rules stop the site inventing data. They cannot guarantee a contributor transcribed a
          vendor&rsquo;s documentation correctly. To fix an error,{' '}
          <a
            href={`${REPO_URL}/blob/main/CONTRIBUTING.md`}
            target="_blank"
            rel="noopener noreferrer"
          >
            open a pull request
          </a>{' '}
          against the repository — the only place a fix has any effect.
        </p>
      </LegalSection>

      <LegalSection id="no-warranty" index={3} title="No warranty of accuracy">
        <p>
          The catalog is informational. We take reasonable care in producing it, but{' '}
          <strong>
            we make no warranty that any listing is accurate, complete, current or fit for your
            purpose
          </strong>
          , and we disclaim warranties to the fullest extent the law allows.
        </p>
        <p>
          AI services change fast. A model may be retired, a price may rise, a free tier may vanish,
          or a company may shut down between the moment the catalog was built and the moment you read
          it. Every page shows the build date and the repository commit it came from so you can judge
          how current it is.
        </p>
        <p>
          <strong>
            Confirm details on the provider&rsquo;s own documentation before you commit money, sign a
            contract, or build something you depend on.
          </strong>{' '}
          The official-source link on each listing exists for exactly that reason.
        </p>
      </LegalSection>

      <LegalSection id="pricing" index={4} title="Pricing and availability change">
        <p>
          Prices, rate limits, context windows and free-tier allowances are owned and controlled by
          each vendor. Figures here are a snapshot recorded in the repository, reproduced for
          comparison convenience.
        </p>
        <ul className="legal-list">
          <li>
            A listed price is <strong>not an offer</strong> and binds neither the vendor nor us.
          </li>
          <li>
            Currency, billing period, taxes, enterprise discounts, regional limits and usage tiers
            are outside our knowledge and may not be reflected.
          </li>
          <li>
            Where a listing shows no price, the repository did not state one. That does not mean the
            service is free.
          </li>
        </ul>
        <p>
          Any commercial decision made in reliance on this site is made at your own risk. Verify
          directly with the vendor before you commit.
        </p>
      </LegalSection>

      <LegalSection id="third-party" index={5} title="Third parties and vendor contracts">
        <p>
          Every listing describes a product operated by an independent company. If you sign up for,
          pay, or otherwise deal with one of them, your contract is with{' '}
          <strong>them, not with us</strong>.
        </p>
        <p>Third-party links are provided for convenience and &ldquo;as is&rdquo;:</p>
        <ul className="legal-list">
          <li>
            We do not control third-party sites and are not responsible for their content,
            availability, security or privacy practices.
          </li>
          <li>A link is not an endorsement, recommendation or certification.</li>
          <li>
            Vendor terms, acceptable-use policies and data-processing agreements govern your use of
            their services. Read them.
          </li>
          <li>
            If you send data to a provider listed here, that provider — not this site — decides how
            it is processed, retained and used.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="no-affiliation" index={6} title="No affiliation or endorsement">
        <p>
          <strong>Fluxenite AI Hub is an independent, open-source reference project.</strong> It is not
          affiliated with, sponsored by, endorsed by or operated in partnership with any AI vendor,
          model provider, or any company whose products appear in the catalog.
        </p>
        <p>
          Inclusion reflects the fact that a service was catalogued. It is not a judgement about
          quality and does not imply the provider reviewed or approved this site. Omitting a provider
          does not imply a negative assessment either.
        </p>
        <p>
          All product names, logos and trade marks belong to their respective owners and are
          referenced for identification only.
        </p>
      </LegalSection>

      <LegalSection id="acceptable-use" index={7} title="Acceptable use">
        <p>The site is offered as-is to everyone. By using it you agree not to:</p>
        <ol className="legal-subclauses">
          <li className="legal-subclause">
            <span>
              <strong>Scrape or bulk-harvest at scale.</strong> The catalog is served from static
              files for human reading; automated extraction that degrades availability for others is
              not permitted. Clone the{' '}
              <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
                repository
              </a>{' '}
              instead — it is authoritative and freely available.
            </span>
          </li>
          <li className="legal-subclause">
            <span>
              <strong>Misrepresent the catalog.</strong> Do not republish listings in a way that
              implies we verified, endorsed or guaranteed the information.
            </span>
          </li>
          <li className="legal-subclause">
            <span>
              <strong>Interfere with operation.</strong> Do not disrupt the site, probe it for
              vulnerabilities without permission, bypass rate limits, or use it to distribute
              malware.
            </span>
          </li>
          <li className="legal-subclause">
            <span>
              <strong>Act unlawfully.</strong> Do not use the site in breach of any applicable law or
              to distribute unlawful content.
            </span>
          </li>
        </ol>
        <p>
          We may block access or report abuse where these terms are breached, without notice and
          without liability.
        </p>
      </LegalSection>

      <LegalSection id="contributions" index={8} title="Your contributions">
        <p>
          The catalog is maintained in a public repository. If you open a pull request, issue or
          comment, you grant the project a perpetual, worldwide, non-exclusive, royalty-free licence
          to use, reproduce and publish your contribution as part of the repository, this website and
          related reports.
        </p>
        <p>Contributions must:</p>
        <ul className="legal-list">
          <li>
            <strong>Be verifiable.</strong> Every listing needs a working link to the
            provider&rsquo;s own documentation, pricing page or announcement. Unverifiable entries are
            removed automatically.
          </li>
          <li>
            <strong>Not speculate.</strong> Do not invent, guess, extrapolate or &ldquo;reasonably
            assume&rdquo; prices, model names, capabilities or availability.
          </li>
          <li>
            Respect third-party rights and include no confidential or personal information.
          </li>
        </ul>
        <p>
          Contributions are provided without warranty and may be edited, moved or declined. Each
          repository contribution is also governed by that repository&rsquo;s own licence.
        </p>
      </LegalSection>

      <LegalSection id="licence" index={9} title="Licence and trademarks">
        <p>
          This site&rsquo;s source code and design are published in the public repository and are
          covered by the licence stated there. Unless that repository says otherwise, you may read,
          run and self-host a copy for personal or internal use.
        </p>
        <p>
          That licence covers <strong>our code only</strong>. It grants no rights in any catalogued
          product, name, logo or description, which remain the property of their respective owners.
          Do not use third-party marks in a way that suggests sponsorship or endorsement.
        </p>
      </LegalSection>

      <LegalSection id="disclaimer" index={10} title="Disclaimer of warranties">
        <p>
          To the fullest extent permitted by applicable law, the site is provided{' '}
          <strong>&ldquo;as is&rdquo; and &ldquo;as available&rdquo;</strong>, without warranties of
          any kind, whether express, implied or statutory. This includes, without limitation:
        </p>
        <ul className="legal-list">
          <li>
            Any implied warranty of merchantability, fitness for a particular purpose, or quality.
          </li>
          <li>Any warranty that the site will be available, uninterrupted, secure or error-free.</li>
          <li>
            Any warranty that catalog content is accurate, current, complete, or free of error,
            omission or harmful content.
          </li>
          <li>Any warranty that the site will meet your specific requirements.</li>
        </ul>
        <p>
          Some jurisdictions do not allow certain exclusions. Where a warranty cannot be excluded, our
          liability is limited to the minimum that law permits.
        </p>
      </LegalSection>

      <LegalSection id="liability" index={11} title="Limitation of liability">
        <p>
          <strong>
            We are not liable for indirect, incidental, special, consequential, exemplary or punitive
            damages
          </strong>{' '}
          — including lost profits, lost revenue, lost data, lost goodwill, business interruption, or
          lost anticipated savings — however caused and under any theory of liability, even if we were
          advised such damages were possible.
        </p>
        <p>
          We are not liable for loss arising from your reliance on catalog content, including a
          vendor changing a price, removing a free tier, discontinuing a model, or failing to deliver a
          service you chose based on what this site showed you.
        </p>
        <p>
          To the maximum extent the law allows, our total aggregate liability arising out of or
          related to your use of the site is limited to{' '}
          <strong>the greater of zero and the amount you paid to use the site</strong>. The site is
          free, so that amount is ordinarily zero.
        </p>
        <p>
          Nothing here excludes or limits liability for death or personal injury caused by
          negligence, fraud or fraudulent misrepresentation, or any other liability that cannot
          lawfully be excluded.
        </p>
      </LegalSection>

      <LegalSection id="indemnity" index={12} title="Indemnity">
        <p>
          <strong>
            You agree to indemnify and hold harmless the project maintainers and contributors against
            any claim, demand, loss, damage or expense (including reasonable legal fees) arising from
            your misuse of this site, your breach of these terms, or your violation of any law or
            third-party right.
          </strong>
        </p>
        <p>This applies whether or not you were advised of the possibility of such losses.</p>
      </LegalSection>

      <LegalSection id="changes" index={13} title="Changes to these terms">
        <p>
          We may revise these terms at any time. Because the site is generated from the repository,
          changes are published as part of the project&rsquo;s normal update cycle.
        </p>
        <ul className="legal-list">
          <li>
            The revision date at the top of this page is authoritative. There is no separate change
            log and no notification mechanism.
          </li>
          <li>
            Continuing to use the site after a revision takes effect means you accept the revised
            terms.
          </li>
          <li>
            Sections that did not change may keep their original date. A new revision date does not
            imply every section changed.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="disputes" index={14} title="Governing law and disputes">
        <p>
          These terms are a plain-language statement published by an open-source community project.{' '}
          <strong>They are not legal advice and have not been reviewed by a lawyer.</strong> If you
          need advice on how they apply to your situation, consult a qualified professional.
        </p>
        <p>
          <strong>Step one:</strong> most disagreements are resolved fastest in the{' '}
          <a href={ISSUES_URL} target="_blank" rel="noopener noreferrer">
            public issue tracker
          </a>
          . Raise it there so the answer benefits everyone.
        </p>
        <p>
          <strong>Step two:</strong> for matters the tracker cannot resolve, these terms are governed
          by the laws of the jurisdiction in which the project maintainer is established, and the
          courts of that jurisdiction have exclusive jurisdiction — without prejudice to mandatory
          consumer protections that may apply where you live.
        </p>
        <p>
          <strong>Nothing here creates a relationship designed for commercial dispute.</strong> If a
          formal position is required, take legal advice before relying on this section.
        </p>
      </LegalSection>

      <LegalSection id="general" index={15} title="Severability and general terms">
        <dl className="legal-definitions">
          <div className="legal-definitions__row">
            <dt>Severability</dt>
            <dd>
              If any provision is held unenforceable, the remainder of these terms stays in force.
            </dd>
          </div>
          <div className="legal-definitions__row">
            <dt>No waiver</dt>
            <dd>
              Failing to enforce a provision on one occasion is not a waiver of it on any future
              occasion.
            </dd>
          </div>
          <div className="legal-definitions__row">
            <dt>Assignment</dt>
            <dd>
              We may update these terms by publishing a revision. You may not assign your rights
              under them.
            </dd>
          </div>
          <div className="legal-definitions__row">
            <dt>Third-party rights</dt>
            <dd>
              A person who is not a party to these terms has no right to enforce them, though
              providers named in the catalog retain their own rights.
            </dd>
          </div>
          <div className="legal-definitions__row">
            <dt>Entire agreement</dt>
            <dd>
              These terms, the repository licence and the accuracy rules published in{' '}
              <code>instruction.md</code> form the whole agreement regarding use of this site.
            </dd>
          </div>
          <div className="legal-definitions__row">
            <dt>Language</dt>
            <dd>
              These terms are written in English. If a translation conflicts with this version, the
              English text governs.
            </dd>
          </div>
        </dl>
      </LegalSection>

      <nav className="panel panel--padded legal-note" aria-label="Related documents">
        <p className="legal-toc__label">
          <TriangleAlert size={12} aria-hidden="true" /> Related documents
        </p>
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
          <SiteLink to="/privacy">
            <FileText size={12} aria-hidden="true" /> Read the privacy policy
          </SiteLink>{' '}
          if you are unsure what this site stores — the short answer is: nothing about you.
        </p>
      </nav>
    </LegalLayout>
  );
}