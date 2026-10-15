import { Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

import { EmptyState } from '../components/ui/EmptyState';

export function NotFoundPage() {
  return (
    <div className="container">
      <EmptyState
        icon={<Compass size={22} />}
        title="Page not found"
        description="That route does not exist on this site. It may have been renamed, or the link may be out of date."
        actions={
          <>
            <Link className="button button--primary" to="/">
              Go home
            </Link>
            <Link className="button" to="/explore">
              Explore the catalog
            </Link>
          </>
        }
      />
    </div>
  );
}