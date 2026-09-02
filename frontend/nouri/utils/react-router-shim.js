import React from 'react';

export function useNavigate() {
  return (href) => {
    if (!href) return;
    if (/^https?:\/\//i.test(href)) {
      window.open(href, '_blank', 'noopener,noreferrer');
      return;
    }
    const path = href.replace(/^\//, '');
    const [targetRaw, query = ''] = path.split('?');
    const ALIASES = { share: 'create', find: 'map', 'request-food': 'request' };
    const target = ALIASES[targetRaw.toLowerCase()] || targetRaw;
    window.dispatchEvent(new CustomEvent('foodmaps:navigate_ui', {
      detail: {
        action: 'open',
        target,
        path: href.startsWith('/') ? href : `/${href}`,
        query: query || null,
        summary: null,
      },
    }));
  };
}

export function BrowserRouter({ children }) {
  return children;
}

export function Routes({ children }) {
  return children;
}

export function Route() {
  return null;
}

export function Link({ to, children, ...rest }) {
  return (
    <a
      href={to}
      {...rest}
      onClick={(e) => {
        e.preventDefault();
        useNavigate()(to);
      }}
    >
      {children}
    </a>
  );
}
