import { ExternalLink, FileCode2, Github, HelpCircle, Scale, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

import { BrandLogo } from '../ui/BrandLogo';
import { catalog } from '../../lib/catalog';
import { formatIsoDate } from '../../lib/format';

const REPO_URL = catalog.source.repository;

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div className="site-footer__grid">
          <div>
            <div className="site-footer__brand">
              <BrandLogo size={26} />
              <span className="site-footer__brand-name">Fluxenite AI Hub</span>
            </div>
            <p className="site-footer__disclaimer">
              A static, read-only view of the community-maintained AI directory. Every listing is
              generated from <code>README.md</code> at build time — nothing is fetched at runtime,
              and no data is inferred or invented.
            </p>
          </div>

          <div>
            <p className="site-footer__heading">Explore</p>
            <ul className="site-footer__list">
              <li>
                <Link className="site-footer__link" to="/explore">
                  All listings
                </Link>
              </li>
              <li>
                <Link className="site-footer__link" to="/compare">
                  Compare listings
                </Link>
              </li>
              <li>
                <Link className="site-footer__link" to="/updates">
                  Repository updates
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="site-footer__heading">Support</p>
            <ul className="site-footer__list">
              <li>
                <Link className="site-footer__link" to="/faq">
                  <HelpCircle size={12} aria-hidden="true" /> Frequently asked questions
                </Link>
              </li>
              <li>
                <Link className="site-footer__link" to="/docs">
                  <FileCode2 size={12} aria-hidden="true" /> Documentation
                </Link>
              </li>
              <li>
                <Link className="site-footer__link" to="/docs#provenance">
                  <Scale size={12} aria-hidden="true" /> Data provenance
                </Link>
              </li>
              <li>
                <a
                  className="site-footer__link"
                  href={`${REPO_URL}/issues`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github size={12} aria-hidden="true" /> Report an issue
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="site-footer__heading">Legal</p>
            <ul className="site-footer__list">
              <li>
                <Link className="site-footer__link" to="/terms">
                  <Scale size={12} aria-hidden="true" /> Terms of Service
                </Link>
              </li>
              <li>
                <Link className="site-footer__link" to="/privacy">
                  <ShieldCheck size={12} aria-hidden="true" /> Privacy Policy
                </Link>
              </li>
              <li>
                <p className="site-footer__note">
                  No accounts. No analytics. No cookies. No tracking.
                </p>
              </li>
            </ul>
          </div>
        </div>

        <div className="site-footer__links">
          <p className="site-footer__heading">Repository</p>
          <ul className="site-footer__list">
            <li>
              <a className="site-footer__link" href={REPO_URL} target="_blank" rel="noopener noreferrer">
                GitHub <ExternalLink size={11} aria-hidden="true" />
              </a>
            </li>
            <li>
              <a
                className="site-footer__link"
                href={`${REPO_URL}/blob/main/README.md`}
                target="_blank"
                rel="noopener noreferrer"
              >
                README.md
              </a>
            </li>
            <li>
              <a
                className="site-footer__link"
                href={`${REPO_URL}/tree/main/data`}
                target="_blank"
                rel="noopener noreferrer"
              >
                data/
              </a>
            </li>
          </ul>
        </div>

        <div className="site-footer__bottom">
          <span>
            Catalog built {formatIsoDate(catalog.generatedAt)} from README commit{' '}
            <code>{catalog.source.fingerprint}</code>
          </span>
          <span>Pricing changes constantly — always verify on official vendor pages.</span>
        </div>
      </div>
    </footer>
  );
}