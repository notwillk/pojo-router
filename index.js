import React, { useCallback, useMemo, useContext, useLayoutEffect, useState } from 'react';
import { match as matchPath, compile } from 'path-to-regexp';
import isString from 'lodash.isstring';

const InboundRouterContext = React.createContext({});
const OutboundRouterContext = React.createContext({});
const CurrentPathContext = React.createContext([]);

const PojoRouter = ({children, namedPaths, routes, notFound}) => {
  const [cachedMatches, setCachedMatches] = useState({});
  const currentPathState = useState('');

  const normalizedRouter = useMemo(
    () => routes.map(([pathOrPathName, values]) => {
      const pathObjectOrString = pathOrPathName in namedPaths ? namedPaths[pathOrPathName] : pathOrPathName;
      const { path, ...options } = isString(pathObjectOrString) ? {path: pathObjectOrString} : pathObjectOrString;
      return { pathOrPathName, values, matcher: matchPath(path, options), outboundPath: compile(path, options) };
    }),
    [namedPaths, routes]
  );

  const outboundRouter = useMemo(
    () => normalizedRouter.reduce(
      (acc, {pathOrPathName, outboundPath}) => ({...acc, [pathOrPathName]: outboundPath}),
      {}
    ),
    [normalizedRouter]
  );

  useLayoutEffect(() => setCachedMatches({}), [normalizedRouter]);

  const allMatches = useCallback(pathToMatch => {
    if(pathToMatch in cachedMatches) {
      return cachedMatches[pathToMatch];
    }

    const allMatches = normalizedRouter.reduce(
      (acc, {matcher, values}) => {
        const match = matcher(pathToMatch);
        const params = match && match.params ? match.params : {};
        return match ? [...acc, { ...values, ...params }] : acc;
      },
      []
    );

    const matches = allMatches.length === 0 ? [notFound] : allMatches;
    setCachedMatches(existingCachedMacthes => ({...existingCachedMacthes, [pathToMatch]: matches}));

    return matches;
  }, [cachedMatches, normalizedRouter, notFound]);

  return React.createElement(
    InboundRouterContext.Provider,
    { value: allMatches },
    React.createElement(
      OutboundRouterContext.Provider,
      { value: outboundRouter },
      React.createElement(
        CurrentPathContext.Provider,
        { value: currentPathState },
        children
      )
    )
  );
}

export const useCurrentPath = (...args) => {
  const [currentPath, setCurrentPath] = useContext(CurrentPathContext);

  if(args.length !== 0) {
    const nextCurrentPath = args[0];
    setCurrentPath(nextCurrentPath);
    return nextCurrentPath;
  }

  return currentPath;
};

export const useMatches = pathToMatch => {
  const allMatches = useContext(InboundRouterContext);
  return allMatches(pathToMatch);
};

export const useFirstMatch = pathToMatch => useMatches(pathToMatch)[0];

export const useBestMatch = (pathToMatch, matchComparator) => {
  const allMatches = useMatches(pathToMatch);
  allMatches.sort(matchComparator);
  return allMatches[0];
}

export const useCurrentMatch = () => useFirstMatch(useCurrentPath());

export const useOutboundRoute = pathOrPathName => {
  const allRoutes = useContext(OutboundRouterContext);
  const outboundRoute = allRoutes[pathOrPathName];

  if (!outboundRoute) {
    throw new Error(`Unknown route: ${pathOrPathName}`);
  }

  return outboundRoute;
};

export default PojoRouter;
