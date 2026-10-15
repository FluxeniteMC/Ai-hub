import { Component, type ErrorInfo, type ReactNode } from 'react';

import { BrandLogo } from './BrandLogo';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Catches render errors so a fault shows a readable message with a way out,
 * instead of the blank dark page a crashed React tree would otherwise leave.
 */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    // Kept for console diagnostics; nothing is sent anywhere.
    console.error('UI error:', error, info.componentStack);
  }

  private readonly handleReload = () => {
    window.location.reload();
  };

  private readonly handleGoHome = () => {
    window.location.hash = '#/';
  };

  override render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="app-shell">
        <main className="site-main">
          <div className="container">
            <div className="crash">
              <span className="crash__mark" aria-hidden="true">
                <BrandLogo size={26} />
              </span>
              <h1 className="crash__title">This page ran into a problem</h1>
              <p className="crash__body">
                Something went wrong while rendering. The catalog data itself is fine — reloading
                usually fixes it.
              </p>
              <pre className="crash__detail">{error.message}</pre>
              <div className="crash__actions">
                <button type="button" className="button button--primary" onClick={this.handleReload}>
                  Reload the page
                </button>
                <button type="button" className="button" onClick={this.handleGoHome}>
                  Go to the home page
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
}