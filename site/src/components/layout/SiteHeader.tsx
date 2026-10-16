import { Github, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

import { BrandLogo } from '../ui/BrandLogo';
import { ThemeToggle } from '../ui/ThemeToggle';
import { cx } from '../../lib/format';

const NAV_ITEMS = [
  { to: '/', label: 'Home', end: true },
  { to: '/explore', label: 'Explore' },
  { to: '/compare', label: 'Compare' },
  { to: '/docs', label: 'Docs' },
  { to: '/updates', label: 'Updates' },
] as const;

const REPO_URL = 'https://github.com/FluxeniteMC/Ai-hub';

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  // Close the mobile drawer whenever the route changes.
  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link className="brand" to="/">
          <span className="brand__mark" aria-hidden="true">
            <BrandLogo size={22} />
          </span>
          <span className="brand__text">
            <span className="brand__title">Fluxenite AI Hub</span>
            <span className="brand__subtitle">Community AI directory</span>
          </span>
        </Link>

        <button
          type="button"
          className="nav-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        >
          {menuOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
        </button>

        <nav
          id="primary-navigation"
          className={cx('site-nav', menuOpen && 'site-nav--open')}
          aria-label="Primary"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={'end' in item ? item.end : false}
              className={({ isActive }) =>
                cx('site-nav__link', isActive && 'site-nav__link--active')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="site-header__actions">
          <ThemeToggle />
          <a
            className="button button--sm"
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github size={15} aria-hidden="true" />
            <span className="site-header__github-label">Repository</span>
          </a>
        </div>
      </div>
    </header>
  );
}