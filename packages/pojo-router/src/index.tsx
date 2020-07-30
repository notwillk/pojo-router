import React, {
  useCallback,
  useMemo,
  useContext,
  useLayoutEffect,
  useState,
} from 'react';
import { match as matchPath, compile } from 'path-to-regexp';
import isString from 'lodash.isstring';

// We want to allow re-declaration of this by declaration merging,
// but assume types if not defined

// styled-components uses this to have theme defined.
// https://styled-components.com/docs/api#create-a-declarations-file
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DefaultRoutePojo {}

type AnyIfEmpty<T extends object> = keyof T extends never ? any : T;

const thrower = () => {
  throw new Error('context not set');
};
const InboundRouterContext = React.createContext(
  thrower as (v: string) => AnyIfEmpty<DefaultRoutePojo>[],
);
const OutboundRouterContext = React.createContext({} as Record<string, any>);
const CurrentPathContext = React.createContext('');

type NamedPath = {
  path: string;
  sensitive?: boolean;
  [k: string]: any;
};
type Route = [string, AnyIfEmpty<DefaultRoutePojo>];
type Props = {
  children: React.ReactChild;
  namedPaths: Record<string, string | NamedPath>;
  routes: Route[];
  notFound: boolean;
  currentPath: string;
};

const PojoRouter = ({
  children,
  namedPaths = {},
  routes,
  notFound,
  currentPath,
}: Props) => {
  const [cachedMatches, setCachedMatches] = useState({});

  const normalizedRouter = useMemo(
    () =>
      routes.map(([pathOrPathName, values]) => {
        const pathObjectOrString =
          pathOrPathName in namedPaths
            ? namedPaths[pathOrPathName]
            : pathOrPathName;
        // TODO: lodash isString doesn't type correctly
        const { path, ...options } = isString(pathObjectOrString)
          ? { path: pathObjectOrString as string }
          : (pathObjectOrString as NamedPath);
        return {
          pathOrPathName,
          values,
          matcher: matchPath(path, options),
          outboundPath: compile(path, options),
        };
      }),
    [namedPaths, routes],
  );

  const outboundRouter = useMemo(
    () =>
      normalizedRouter.reduce(
        (acc, { pathOrPathName, outboundPath }) => ({
          ...acc,
          [pathOrPathName]: outboundPath,
        }),
        {},
      ),
    [normalizedRouter],
  );

  useLayoutEffect(() => setCachedMatches({}), [normalizedRouter]);

  const allMatches = useCallback(
    (pathToMatch: string) => {
      if (pathToMatch in cachedMatches) {
        return cachedMatches[pathToMatch];
      }

      const allMatches = normalizedRouter.reduce(
        (
          acc: Record<string, any>[],
          { matcher, values },
        ): Record<string, any>[] => {
          const match = matcher(pathToMatch);
          const params = match && match.params ? match.params : {};
          return match ? [...acc, { ...values, ...params }] : acc;
        },
        [],
      );

      const matches = allMatches.length === 0 ? [notFound] : allMatches;
      setCachedMatches((existingCachedMacthes) => ({
        ...existingCachedMacthes,
        [pathToMatch]: matches,
      }));

      return matches;
    },
    [cachedMatches, normalizedRouter, notFound],
  );

  return (
    <InboundRouterContext.Provider value={allMatches}>
      <OutboundRouterContext.Provider value={outboundRouter}>
        <CurrentPathContext.Provider value={currentPath}>
          {children}
        </CurrentPathContext.Provider>
      </OutboundRouterContext.Provider>
    </InboundRouterContext.Provider>
  );
};

export const useCurrentPath = () => {
  return useContext(CurrentPathContext);
};

export const useMatches = (pathToMatch: string) => {
  const allMatches = useContext(InboundRouterContext);
  return allMatches(pathToMatch);
};

export const useFirstMatch = (pathToMatch: string) =>
  useMatches(pathToMatch)[0];

export const useBestMatch = (
  pathToMatch: string,
  matchComparator: (s1: string, s2: string) => number,
) => {
  const allMatches = useMatches(pathToMatch);
  allMatches.sort(matchComparator);
  return allMatches[0];
};

export const useCurrentMatch = () => useFirstMatch(useCurrentPath());

export const useOutboundRoute = (pathOrPathName: string) => {
  const allRoutes = useContext(OutboundRouterContext);
  const outboundRoute = allRoutes[pathOrPathName];

  if (!outboundRoute) {
    throw new Error(`Unknown route: ${pathOrPathName}`);
  }

  return outboundRoute;
};

export default PojoRouter;
