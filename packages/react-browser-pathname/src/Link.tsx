import React, { useCallback, useContext } from 'react';

import { UpdateContext } from './context';

export interface LinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  replace: boolean;
  target?: string;
  component: React.ComponentType<React.AnchorHTMLAttributes<HTMLAnchorElement>>;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

export function Link({
  to,
  replace,
  component: Component,
  onClick,
  ...rest
}: LinkProps) {
  const setCurrentBrowserPathname = useContext(UpdateContext);

  const handleClick = useCallback(
    (e) => {
      e?.preventDefault();
      onClick?.(e);
      const nav = replace
        ? window.history.replaceState
        : window.history.pushState;

      // let browser handle "target=_blank" etc.
      if (!rest.target || rest.target === '_self') {
        nav({}, '', to);
        setCurrentBrowserPathname();
      }
    },
    [to, replace, setCurrentBrowserPathname, onClick, rest.target],
  );

  return <Component onClick={handleClick} {...rest} />;
}
Link.defaultProps = {
  component: 'a',
  replace: false,
};
