import React, { useContext, useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

const PathnameContext = React.createContext<string | null>(null);
const UpdateContext = React.createContext(() => {
  return;
});

const getPathname = () => `${window.location.pathname}`;

const BrowserPathname = ({ children }: { children: ReactNode }) => {
  const [location, setLocation] = useState(getPathname());

  const setCurrentBrowserPathname = useCallback(() => {
    setLocation(getPathname());
  }, []);

  useEffect(() => {
    window.addEventListener('popstate', setCurrentBrowserPathname);

    return () => {
      window.removeEventListener('popstate', setCurrentBrowserPathname);
    };
  }, [setCurrentBrowserPathname]);

  return (
    <UpdateContext.Provider value={setCurrentBrowserPathname}>
      <PathnameContext.Provider value={location}>
        {children}
      </PathnameContext.Provider>
    </UpdateContext.Provider>
  );
};

export const useBrowserPathname = () => useContext(PathnameContext);

export const usePushPath = () => {
  const setCurrentBrowserPathname = useContext(UpdateContext);

  return useCallback(
    (path: string, title: string | undefined = '') => {
      window.history.pushState({}, title, path);
      setCurrentBrowserPathname();
    },
    [setCurrentBrowserPathname],
  );
};

export const useReplacePath = () => {
  const setCurrentBrowserPathname = useContext(UpdateContext);

  return useCallback(
    (path: string, title = '') => {
      window.history.replaceState({}, title, path);
      setCurrentBrowserPathname();
    },
    [setCurrentBrowserPathname],
  );
};

export default BrowserPathname;
