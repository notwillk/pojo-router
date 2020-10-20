import React, { useCallback, useContext } from 'react';

import { UpdateContext } from './context';

export interface LinkProps {
  to: string;
  replace: boolean;
  component: React.ComponentType<React.AnchorHTMLAttributes<HTMLAnchorElement>>;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  children: React.ReactChildren;
}

export function Link({
  to,
  replace,
  component: Component,
  onClick,
  children,
}: LinkProps) {
  const setCurrentBrowserPathname = useContext(UpdateContext);

  const handleClick = useCallback(
    (e) => {
      e?.preventDefault();
      onClick?.(e);
      const nav = replace
        ? window.history.replaceState
        : window.history.pushState;
      nav({}, '', to);
      setCurrentBrowserPathname();
    },
    [to, replace, setCurrentBrowserPathname, onClick],
  );

  return (
    <Component href="#" onClick={handleClick}>
      {children}
    </Component>
  );
}
Link.defaultProps = {
  component: 'a',
  replace: false,
};
