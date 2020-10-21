import React, { useContext, useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import { PathnameContext, UpdateContext, SET_ACTION } from './context';

const getPathname = () => `${window.location.pathname}`;

const BrowserPathname = ({
  children,
  initialPath,
  onChange,
}: {
  children: ReactNode;
  initialPath: string;
  onChange?: (path: string, callback: () => void | undefined) => void;
}) => {
  const [location, setLocation] = useState(initialPath);

  const updatePathname = useCallback(
    (url: string) => {
      if (onChange) {
        onChange(url, () => setLocation(url));
      } else {
        setLocation(url);
      }
    },
    [onChange, setLocation],
  );

  const setCurrentBrowserPathname = useCallback(
    ({ data, title, url, type }: SET_ACTION) => {
      switch (type) {
        case 'REPLACE':
          window.history.replaceState(data, title, url);
          break;
        case 'PUSH':
          window.history.pushState(data, title, url);
          break;
      }
      if (url) {
        updatePathname(url);
      }
    },
    [updatePathname],
  );

  useEffect(() => {
    const update = () => updatePathname(getPathname());
    window.addEventListener('popstate', update);

    return () => {
      window.removeEventListener('popstate', update);
    };
  }, [updatePathname]);

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
    (url: string, title: string | undefined = '') => {
      setCurrentBrowserPathname({ url, title, data: {}, type: 'PUSH' });
    },
    [setCurrentBrowserPathname],
  );
};

export const useReplacePath = () => {
  const setCurrentBrowserPathname = useContext(UpdateContext);

  return useCallback(
    (url: string, title = '') => {
      setCurrentBrowserPathname({ url, title, data: {}, type: 'REPLACE' });
    },
    [setCurrentBrowserPathname],
  );
};

export default BrowserPathname;
export { Link } from './Link';
export { UpdateContext };
