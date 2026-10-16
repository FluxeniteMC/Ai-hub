import {
  BadgeHelp,
  BookOpen,
  Bot,
  CloudCog,
  Code2,
  GitCompare,
  Layers,
  LifeBuoy,
  MessageCircleQuestion,
  Scale,
  Search,
  ShieldCheck,
  Tag,
  Zap,
} from 'lucide-react';
import { isValidElement, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { Accordion, FaqResultCount } from '../components/legal/Accordion';
import type { FaqItem } from '../components/legal/Accordion';
import { SearchInput } from '../components/ui/SearchInput';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { catalog } from '../lib/catalog';

const REPO_URL = catalog.source.repository;
const ISSUES_URL = `${REPO_URL}/issues`;

interface FaqGroup {
  id: string;
  title: string;
  icon: typeof Search;
  description: string;
  items: FaqItem[];
}

const GROUPS: FaqGroup[] = [
  {
    id: 'basics',
    title: 'Getting started',
    icon: BadgeHelp,
    description: 'What this site is, and what it is not.',
    items: [
      {
        question: 'What is Fluxenite AI Hub?',
        answer: (
          <>
            <p>
              A free, searchable directory of AI APIs, models, vector databases and developer tools.
              It is a static, read-only view of the{' '}
              <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
                community-maintained repository
              </a>{' '}
              — the website is generated from <code>README.md</code> rather than edited by hand.
            </p>
            <p>
              You can search it, filter by category and provider, open any listing for full detail,
              and compare up to four side by side. It is free and has no sign-up.
            </p>
          </>
        ),
      },
      {
        question: 'Do I need an account?',
        answer: (
          <p>
            No. There are no accounts, no logins and no email addresses on this site. It is a set of
            pre-built pages — there is no server handling your requests.
          </p>
        ),
      },
      {
        question: 'Does it cost anything? Is there advertising?',
        answer: (
          <p>
            No to both. The site is free, has no advertising, no sponsors and no affiliate links. The
            listings link to each vendor&rsquo;s own official page, and we earn nothing if you sign up
            with them.
          </p>
        ),
      },
      {
        question: 'Can I use the AI models listed here?',
        answer: (
          <>
            <p>
              The site lists models and providers; it does not provide access to them. To use one you
              need to go directly to that provider, create an account with them, and accept their
              terms and pricing. Listing something here is not an offer to supply it.
            </p>
          </>
        ),
      },
      {
        question: 'How many listings are there?',
        answer: (
          <p>
            Currently <strong>{catalog.stats.entryCount} unique listings</strong> parsed from{' '}
            {catalog.stats.tableCount} tables in the README, merged from{' '}
            {catalog.stats.occurrenceCount} rows after removing{' '}
            {catalog.stats.duplicateCount} duplicates. The exact count is shown in the catalog
            statistics and changes as the repository is updated.
          </p>
        ),
      },
    ],
  },
  {
    id: 'data',
    title: 'Data accuracy and provenance',
    icon: ShieldCheck,
    description:
      'Where every value comes from, and why some fields say “Not stated”.',
    items: [
      {
        question: 'Where does the data come from?',
        answer: (
          <>
            <p>
              The repository <code>README.md</code> is the single source of truth. During the build the
              parser walks its markdown tables and converts each row into a listing. The site stores a{' '}
              <a href="#/docs#provenance" className="legal-ref">
                content fingerprint
              </a>{' '}
              of that content so you can tell whether what you are reading is current.
            </p>
            <p>
              Each listing also links back to the exact README line it came from, so you can check the
              original.
            </p>
          </>
        ),
      },
      {
        question: 'Does it verify the claims?',
        answer: (
          <>
            <p>
              <strong>No — and this matters.</strong> The site reproduces what the repository says. It
              does not independently confirm that a model exists, that a price is right, or that a
              provider is still operating.
            </p>
            <p>
              What the build does guarantee is that it will not <em>invent</em> anything: a field the
              README does not state is left blank and shown as <em>Not stated</em> rather than
              guessed. That is a promise about how the data was produced, not about whether the source
              is right.
            </p>
          </>
        ),
      },
      {
        question: 'Why does a field say “Not stated”?',
        answer: (
          <>
            <p>
              Because the README does not state it. Rather than guess, the parser leaves it empty and
              the site shows <em>Not stated</em>. This applies to pricing, context windows, modalities
              and anything else that is genuinely absent.
            </p>
            <p>
              It also means the provider may not publish that detail at all — the absence is in the
              source, not an oversight in the site.
            </p>
          </>
        ),
      },
      {
        question: 'A price looks wrong. Why isn’t it corrected automatically?',
        answer: (
          <>
            <p>
              Deliberately. Automatically &ldquo;fixing&rdquo; prices would mean the site generating
              figures that no source states — the exact problem this project is built to avoid. A wrong
              price means the README is wrong, and the fix belongs there.
            </p>
            <p>
              Send a pull request correcting the row with a link to the vendor&rsquo;s current pricing
              page. It will be live after the next build.
            </p>
          </>
        ),
      },
      {
        question: 'Why are some prices shown as text rather than numbers?',
        answer: (
          <p>
            Token pricing is only parsed as a number when the README states a clear input/output pair,
            such as <code>$6.00/$30.00 per 1M</code>. Anything ambiguous — a monthly subscription, a
            flat rate, a single figure with no counterpart — is kept exactly as written rather than
            misread as a per-token rate.
          </p>
        ),
      },
      {
        question: 'I saw a duplicate listing. Is that a bug?',
        answer: (
          <p>
            Duplicates usually mean a service appears in more than one category table, which is
            intentional. The site merges them into one entry with multiple sources, so search results
            stay honest and identifiers stay stable.
          </p>
        ),
      },
      {
        question: 'How recent is the data?',
        answer: (
          <p>
            The catalog was generated on{' '}
            {catalog.generatedAt.slice(0, 10)} from README commit{' '}
            <code>{catalog.source.fingerprint}</code>. The Updates page tracks recent repository
            activity, and the catalog is rebuilt automatically whenever the README changes.
          </p>
        ),
      },
    ],
  },
  {
    id: 'search',
    title: 'Searching and filtering',
    icon: Search,
    description: 'Finding what you need quickly.',
    items: [
      {
        question: 'How does search work?',
        answer: (
          <>
            <p>
              Search matches against listing names, providers, categories and descriptions as you
              type, and filters the grid instantly. It runs entirely in your browser — no query is
              sent anywhere.
            </p>
            <p>Search terms are combined with the active filters, so narrowing one narrows the rest.</p>
          </>
        ),
      },
      {
        question: 'How do filters combine?',
        answer: (
          <p>
            Multiple filters are combined with AND — a result must satisfy every active filter. Active
            filters are shown as removable chips, and there is a clear-all control when you want to
            start over.
          </p>
        ),
      },
      {
        question: 'Can I sort the results?',
        answer: (
          <p>
            Yes. Use the sort control to order results by relevance, name, or most recently added.
          </p>
        ),
      },
      {
        question: 'What happens when a search returns nothing?',
        answer: (
          <p>
            You get an empty state explaining that nothing matched, with a control to clear your
            filters. Usually the cause is a filter that is too narrow — for example a specific provider
            combined with an unrelated category.
          </p>
        ),
      },
      {
        question: 'Is the search keyboard accessible?',
        answer: (
          <p>
            Yes. Tab moves through the controls, Enter opens a listing, and every filter is a real
            button. There is a skip link at the top of every page for jumping straight to the content.
          </p>
        ),
      },
    ],
  },
  {
    id: 'compare',
    title: 'Comparing listings',
    icon: GitCompare,
    description: 'Putting options side by side.',
    items: [
      {
        question: 'How do I compare two things?',
        answer: (
          <>
            <p>
              On any listing card, use the select control in the top-right corner to add it to a
              comparison. A tray appears at the bottom of the page showing your current selection.
            </p>
            <p>
              Up to four can be compared at once. Open the comparison from the tray to see them in a
              side-by-side table.
            </p>
          </>
        ),
      },
      {
        question: 'Does my comparison selection persist?',
        answer: (
          <p>
            Yes — it is stored in your browser&rsquo;s local storage, so a page refresh or a return
            visit keeps your selection. It never leaves your device, and you can clear it from the
            privacy policy page.
          </p>
        ),
      },
      {
        question: 'What does the comparison table do with missing data?',
        answer: (
          <p>
            It shows <em>Not stated</em> rather than an empty cell, so it is always obvious that a
            value is unavailable rather than simply blank.
          </p>
        ),
      },
    ],
  },
  {
    id: 'updates',
    title: 'Updates and automation',
    icon: Bot,
    description: 'How the catalog stays current.',
    items: [
      {
        question: 'How often does the site update?',
        answer: (
          <p>
            Whenever the repository README changes. A scheduled automation runs daily, and the site is
            also rebuilt automatically when relevant files are pushed.
          </p>
        ),
      },
      {
        question: 'What is the weekly report?',
        answer: (
          <p>
            A generated summary of what changed in the repository over the past week — new listings,
            corrections, and anything else notable. It is published on the Updates page and is
            regenerated on a schedule.
          </p>
        ),
      },
      {
        question: 'Will it add AI models automatically?',
        answer: (
          <>
            <p>
              <strong>No.</strong> Automation may refresh the existing catalog, but it is not permitted
              to introduce a model, API or provider that is not already in the repository with a
              verifiable source.
            </p>
            <p>
              Any automated change that introduces a new listing is rejected before it can ship. This
              rule exists because AI tools are prone to inventing plausible-sounding model names and
              prices, which is exactly what this site is built to prevent.
            </p>
          </>
        ),
      },
      {
        question: 'Why does a field sometimes stay empty?',
        answer: (
          <p>
            If automation cannot find a verifiable source for a value, it leaves the field empty
            instead of filling in something plausible. An empty field is a correct outcome, not a bug.
          </p>
        ),
      },
    ],
  },
  {
    id: 'technical',
    title: 'Technical and deployment',
    icon: Code2,
    description: 'How the site is built and served.',
    items: [
      {
        question: 'What technology does it use?',
        answer: (
          <p>
            React with TypeScript, built with Vite, and deployed to GitHub Pages as static files.
            There is no backend and no server-side application — everything you see was generated
            before you arrived.
          </p>
        ),
      },
      {
        question: 'Does it call any API while I browse?',
        answer: (
          <p>
            <strong>No.</strong> The catalog is parsed at build time and bundled into the page, so
            the browser never contacts GitHub or any other data source while you use the site. It
            works offline once loaded.
          </p>
        ),
      },
      {
        question: 'Why do the URLs use #?',
        answer: (
          <p>
            GitHub Pages serves plain static files with no server-side routing, so the site uses hash
            routing (<code>#/explore</code>). This is what lets a deep link like a specific listing
            work on refresh without a 404 or any server configuration.
          </p>
        ),
      },
      {
        question: 'Does it track me?',
        answer: (
          <p>
            No. No analytics, no cookies, no third-party scripts and no tracking of any kind. The full
            details are in the{' '}
            <a href="#/privacy" className="legal-ref">
              privacy policy
            </a>
            .
          </p>
        ),
      },
      {
        question: 'Does it work on mobile and with a keyboard?',
        answer: (
          <p>
            Yes. The layout adapts from narrow phones to wide desktops, and the whole site is
            operable by keyboard with visible focus indicators and accessible labels on every control.
          </p>
        ),
      },
      {
        question: 'Can I run my own copy?',
        answer: (
          <p>
            Yes — the site is open source. Clone the repository, then in the{' '}
            <code>site</code> directory run <code>npm install</code> and <code>npm run dev</code> to
            start a local development server.
          </p>
        ),
      },
    ],
  },
  {
    id: 'contributing',
    title: 'Contributing and reporting',
    icon: Layers,
    description: 'Adding a listing, fixing an error, reporting a problem.',
    items: [
      {
        question: 'How do I add a listing?',
        answer: (
          <>
            <p>
              Edit <code>README.md</code> in the repository and open a pull request. Each listing needs
              a name, the category table it belongs in, and a link to the provider&rsquo;s official
              documentation.
            </p>
            <p>
              Please follow the repository&rsquo;s{' '}
              <a
                href={`${REPO_URL}/blob/main/CONTRIBUTING.md`}
                target="_blank"
                rel="noopener noreferrer"
              >
                contributing guide
              </a>
              . Once merged, the site rebuilds automatically and your listing appears.
            </p>
          </>
        ),
      },
      {
        question: 'Will my addition be reviewed?',
        answer: (
          <p>
            It goes through a validation check during the build. A listing without a working source
            link, or with a malformed identifier, fails the build rather than shipping a broken
            catalog. Pull requests are also reviewed by maintainers before merge.
          </p>
        ),
      },
      {
        question: 'What if I made a mistake?',
        answer: (
          <p>
            Open a pull request correcting it. Since the repository is the source of truth, a fix
            applied only in discussion would have no effect on the site.
          </p>
        ),
      },
      {
        question: 'Something on the site looks broken. Where do I report it?',
        answer: (
          <p>
            Open an{' '}
            <a href={ISSUES_URL} target="_blank" rel="noopener noreferrer">
              issue on the repository
            </a>
            . Include the page URL and what you expected to see — it makes the problem much faster to
            fix.
          </p>
        ),
      },
      {
        question: 'Can I suggest a feature?',
        answer: (
          <p>
            Yes — open an issue describing the problem it would solve rather than the solution you have
            in mind. That usually leads to a better outcome.
          </p>
        ),
      },
      {
        question: 'Who runs this project?',
        answer: (
          <p>
            It is an independent, open-source community project. It is not affiliated with, sponsored
            by, or endorsed by any of the AI vendors listed here — inclusion in the catalog is not an
            endorsement. See{' '}
            <a href="#/terms" className="legal-ref">
              the terms of service
            </a>{' '}
            for the full position.
          </p>
        ),
      },
    ],
  },
  {
    id: 'legal',
    title: 'Terms and privacy',
    icon: Scale,
    description: 'The legal side, in plain language.',
    items: [
      {
        question: 'What data does the site collect about me?',
        answer: (
          <p>
            None. There are no accounts, no analytics, no cookies and no tracking. The only two values
            stored are your theme preference and your comparison selection, both in your own
            browser&rsquo;s local storage, and neither ever leaves your device.
          </p>
        ),
      },
      {
        question: 'Does the site sell my data?',
        answer: (
          <p>
            There is no data to sell. We have never collected personal information, so there is
            nothing to share, trade or disclose.
          </p>
        ),
      },
      {
        question: 'Are the prices and details guaranteed accurate?',
        answer: (
          <>
            <p>
              <strong>No.</strong> The catalog is informational and is provided &ldquo;as is&rdquo;,
              without warranty of accuracy. Prices and availability change constantly and are owned by
              each vendor.
            </p>
            <p>
              Always confirm on the provider&rsquo;s own official documentation before committing money
              or building something you depend on.
            </p>
          </>
        ),
      },
      {
        question: 'Are the listed companies affiliated with this site?',
        answer: (
          <p>
            No. This is an independent project. A listing means a service was catalogued — it is not
            an endorsement, recommendation or certification, and no provider has approved or reviewed
            this site.
          </p>
        ),
      },
      {
        question: 'I want to use the data commercially.',
        answer: (
          <p>
            The catalog content comes from the public repository under its own licence — check the
            repository for the current terms. The site&rsquo;s own code is separately licensed, and
            third-party trademarks remain the property of their owners. The{' '}
            <a href="#/terms" className="legal-ref">
              terms of service
            </a>{' '}
            set this out in full.
          </p>
        ),
      },
    ],
  },
];

/** Recursively flattens an answer's text so search can match inside it. */
function answerText(item: FaqItem): string {
  const walk = (node: ReactNode): string => {
    if (node === null || node === undefined || typeof node === 'boolean') return '';
    if (typeof node === 'string' || typeof node === 'number') return String(node);
    if (Array.isArray(node)) return node.map(walk).join(' ');

    // React elements expose their children on `props`; anything else is ignored.
    if (isValidElement(node)) {
      const { children } = node.props as { children?: ReactNode };
      return walk(children);
    }

    return '';
  };

  return `${item.question} ${walk(item.answer)}`.toLowerCase();
}

export function FaqPage() {
  useDocumentMeta(
    'Frequently Asked Questions',
    'Answers about how the AI Hub catalog is generated, how to search and compare listings, how to add or correct an entry, and what the site does with your data.',
  );

  const [query, setQuery] = useState('');

  const total = GROUPS.reduce((sum, group) => sum + group.items.length, 0);

  const visibleGroups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return GROUPS;

    // Every whitespace-separated term must match somewhere in the group, so
    // "pricing openai" narrows rather than widening the result set.
    const terms = needle.split(/\s+/).filter(Boolean);

    return GROUPS.map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        const haystack = answerText(item);
        return terms.every((term) => haystack.includes(term));
      }),
    })).filter((group) => group.items.length > 0);
  }, [query]);

  const shown = visibleGroups.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <div className="container">
      <header className="page-header">
        <div>
          <p className="eyebrow">
            <LifeBuoy size={13} aria-hidden="true" />
            Support
          </p>
          <h1 className="page-header__title">Frequently asked questions</h1>
          <p className="page-header__subtitle">
            {total} answers covering what this site is, where the data comes from, how to search and
            compare, and how to add or correct a listing.
          </p>
        </div>
      </header>

      <div className="faq-search">
        <SearchInput
          value={query}
          onChange={setQuery}
          label="Search the FAQ"
          placeholder="Try “pricing”, “privacy” or “add a listing”"
        />
        <p className="faq-search__hint">
          <Zap size={12} aria-hidden="true" />
          Searching matches question <em>and</em> answer text. Multiple words narrow the results.
        </p>
      </div>

      <FaqResultCount total={total} shown={shown} query={query} />

      {visibleGroups.length === 0 ? (
        <div className="panel panel--padded state">
          <span className="state__icon">
            <Search size={20} aria-hidden="true" />
          </span>
          <h2 className="state__title">No matching questions</h2>
          <p className="state__description">
            Nothing matched that search. Try a broader word, or ask directly in the{' '}
            <a href={ISSUES_URL} target="_blank" rel="noopener noreferrer">
              issue tracker
            </a>{' '}
            — adding your question there helps the next person with it too.
          </p>
          <div className="state__actions">
            <button type="button" className="button button--primary" onClick={() => setQuery('')}>
              Clear search
            </button>
            <a className="button" href={ISSUES_URL} target="_blank" rel="noopener noreferrer">
              <CloudCog size={15} aria-hidden="true" />
              Ask on GitHub
            </a>
          </div>
        </div>
      ) : (
        <div className="faq-groups">
          {visibleGroups.map((group) => (
            <section key={group.id} className="faq-group" aria-labelledby={`faq-${group.id}`}>
              <div className="faq-group__header">
                <h2 className="faq-group__title" id={`faq-${group.id}`}>
                  <group.icon size={18} aria-hidden="true" />
                  {group.title}
                  <span className="faq-group__count">
                    {group.items.length} {group.items.length === 1 ? 'question' : 'questions'}
                  </span>
                </h2>
                <p className="faq-group__description">{group.description}</p>
              </div>

              <Accordion groupId={group.id} items={group.items} />
            </section>
          ))}
        </div>
      )}

      <aside className="panel panel--padded legal-note" aria-label="More help">
        <h2 className="faq-group__title">
          <MessageCircleQuestion size={18} aria-hidden="true" />
          Still stuck?
        </h2>
        <p className="section__description" style={{ marginTop: 'var(--space-3)' }}>
          There is no support desk — this is a community project, and the fastest way to get an answer
          is to ask in the open so the next person benefits too.
        </p>
        <ul className="link-grid" style={{ marginTop: 'var(--space-5)' }}>
          <li>
            <a
              className="panel panel--padded link-card"
              href={ISSUES_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <LifeBuoy size={18} aria-hidden="true" />
              <span>
                <strong>Open an issue</strong>
                <span className="link-card__meta">Ask a question or report a problem</span>
              </span>
            </a>
          </li>
          <li>
            <a className="panel panel--padded link-card" href="#/docs">
              <BookOpen size={18} aria-hidden="true" />
              <span>
                <strong>Documentation</strong>
                <span className="link-card__meta">How the build pipeline works</span>
              </span>
            </a>
          </li>
          <li>
            <a className="panel panel--padded link-card" href="#/terms">
              <Scale size={18} aria-hidden="true" />
              <span>
                <strong>Terms of Service</strong>
                <span className="link-card__meta">The legal position in full</span>
              </span>
            </a>
          </li>
          <li>
            <a className="panel panel--padded link-card" href="#/explore">
              <Tag size={18} aria-hidden="true" />
              <span>
                <strong>Browse the catalog</strong>
                <span className="link-card__meta">{catalog.stats.entryCount} listings to search</span>
              </span>
            </a>
          </li>
        </ul>
        <p className="doc-muted" style={{ marginTop: 'var(--space-5)' }}>
          <Zap size={12} aria-hidden="true" /> Tip: searching the catalog itself is the fastest way to
          find a specific provider — try the{' '}
          <a href="#/explore" className="legal-ref">
            Explore page
          </a>
          .
        </p>
      </aside>
    </div>
  );
}