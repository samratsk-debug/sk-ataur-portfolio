import { useEffect, useState } from 'react';
export type Route = 'public' | 'admin' | 'preview';
function parse(hash: string): Route {
  if (hash.startsWith('#/admin')) return 'admin';
  if (hash.startsWith('#/preview')) return 'preview';
  return 'public';
}
export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parse(window.location.hash));
  useEffect(() => {
    const onHash = () => setRoute(parse(window.location.hash));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return route;
}