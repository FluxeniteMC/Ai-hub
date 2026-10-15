import { useEffect } from 'react';

const BASE = 'Fluxenite AI Hub';
const DEFAULT_DESCRIPTION =
  'Search, filter and compare 500+ AI APIs, LLM models, vector databases and developer tools. Generated from the FluxeniteMC/Ai-hub repository README and rebuilt on every commit.';

/**
 * Sets the document title and meta description for a route.
 *
 * The crawler-facing copy in index.html is static; this keeps the title and
 * description accurate as the user moves around, which matters for sharing,
 * bookmarks and client-side navigation.
 */
export function useDocumentMeta(title: string, description?: string) {
  useEffect(() => {
    const fullTitle = title === BASE ? title : `${title} · ${BASE}`;
    document.title = fullTitle;

    const meta = document.querySelector('meta[name="description"]');
    if (meta && description) meta.setAttribute('content', description);

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', fullTitle);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc && description) ogDesc.setAttribute('content', description);
  }, [title, description]);
}

export { BASE, DEFAULT_DESCRIPTION };