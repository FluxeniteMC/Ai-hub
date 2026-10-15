import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

import { SiteFooter } from './components/layout/SiteFooter';
import { SiteHeader } from './components/layout/SiteHeader';
import { HomePage } from './pages/HomePage';
import { useScrollToTop } from './hooks/useScrollToTop';

// Route-level code splitting keeps the first paint light; the catalog stays
// in the shared chunk because the header and footer both read it.
const ExplorePage = lazy(() => import('./pages/ExplorePage').then((m) => ({ default: m.ExplorePage })));
const EntryDetailPage = lazy(() =>
  import('./pages/EntryDetailPage').then((m) => ({ default: m.EntryDetailPage })),
);
const ComparePage = lazy(() => import('./pages/ComparePage').then((m) => ({ default: m.ComparePage })));
const DocsPage = lazy(() => import('./pages/DocsPage').then((m) => ({ default: m.DocsPage })));
const UpdatesPage = lazy(() =>
  import('./pages/UpdatesPage').then((m) => ({ default: m.UpdatesPage })),
);
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
);

function RouteFallback() {
  return (
    <div className="route-fallback" role="status" aria-live="polite">
      <span className="sr-only">Loading page…</span>
      <div className="skeleton route-fallback__line" />
      <div className="skeleton route-fallback__line" />
      <div className="skeleton route-fallback__line" />
    </div>
  );
}

export default function App() {
  useScrollToTop();

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <SiteHeader />

      <main className="site-main" id="main-content">
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/listing/:id" element={<EntryDetailPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/docs" element={<DocsPage />} />
            <Route path="/updates" element={<UpdatesPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>

      <SiteFooter />
    </div>
  );
}