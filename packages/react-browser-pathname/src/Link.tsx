import React, { useCallback, useContext } from 'react';

import { UpdateContext } from './context';

export type LinkProps<
  P extends Pick<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    'onClick' | 'target'
  >
> = {
  to: string;
  replace: boolean;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
} & (
  | ({ component: React.ComponentType<P> } & P)
  | ({
      component: string;
      children: React.ReactNode;
    } & React.AnchorHTMLAttributes<HTMLAnchorElement>) // for builtins use anchor tag props
);

export function Link<
  P extends Pick<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    'onClick' | 'target'
  > = React.AnchorHTMLAttributes<HTMLAnchorElement>
>({ to, replace, component: Component, onClick, ...rest }: LinkProps<P>) {
  const setCurrentBrowserPathname = useContext(UpdateContext);

  const handleClick = useCallback(
    (e) => {
      e?.preventDefault();
      onClick?.(e);

      // let browser handle "target=_blank" etc.
      if (!rest.target || rest.target === '_self') {
        setCurrentBrowserPathname({
          url: to,
          data: {},
          type: replace ? 'REPLACE' : 'PUSH',
        });
      }
    },
    [to, replace, setCurrentBrowserPathname, onClick, rest.target],
  );

  return <Component onClick={handleClick} {...(rest as any)} />;
}
Link.defaultProps = {
  component: 'a',
  replace: false,
};
