import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';

import App from './App';

import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/catalog.css';
import './styles/report.css';
import './styles/pages.css';
import './styles/legal.css';

const container = document.getElementById('root');
if (!container) throw new Error('Root element #root was not found in index.html');

// Remove the pre-hydration shell so the dark placeholder never lingers.
const removeBootShell = () => document.getElementById('boot')?.remove();

// HashRouter keeps deep links working on GitHub Pages without any server-side
// rewrite rules, so refreshing /compare or /listing/:id never 404s.
createRoot(container).render(
  <StrictMode>
    <HashRouter>
      <App onReady={removeBootShell} />
    </HashRouter>
  </StrictMode>,
);