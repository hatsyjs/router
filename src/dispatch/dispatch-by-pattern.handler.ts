import {
  RequestContext,
  requestHandler,
  RequestHandler,
  RequestHandlerMethod,
  requestUpdate,
} from '@hatsy/hatsy/core.js';
import {
  PathRoute,
  RouteCaptor,
  routeMatch,
  RouteMatcher,
  RoutePattern,
  URLRoute,
} from '@hatsy/route-match';
import { isIterable, lazyValue } from '@proc7ts/primitives';
import type { RouterMeans } from '../router.means.js';

/**
 * Routing dispatch pattern.
 *
 * Declares a route handler to delegate request processing to when the route matches target {@link on pattern}.
 *
 * @typeParam TRoute - A type of supported route.
 * @typeParam TMeans - A type of route processing means.
 */
export interface DispatchPattern<
  TRoute extends PathRoute = URLRoute,
  TMeans extends RouterMeans<TRoute> = RouterMeans<TRoute>,
> {
  /**
   * A route pattern that should match the route in order to dispatch processing the the {@link to handler}.
   *
   * When specified as a string, the pre-configured {@link RouterMeans.routePattern pattern parser} is used to parse it.
   */
  readonly on: RoutePattern<TRoute> | string;

  /**
   * A route handler to dispatch request processing to when the route matches the {@link on pattern}.
   *
   * This handler would receive a {@link tail} of the matching route.
   */
  readonly to: RequestHandlerMethod<this, TMeans>;

  /**
   * Extracts route tail from matching route.
   *
   * The extracted route tail is passed to the {@link to handler}.
   *
   * @param context - Route processing context of the matching route.
   *
   * @returns  Extracted tail of the matching route.
   *
   * @default Extracts a matching route tail starting from the first capture/wildcard. If no captures or wildcards
   * present in pattern, then full route extracted.
   */
  tail?(context: RequestContext<TMeans>): TRoute;
}

/**
 * @internal
 */
function defaultRouteTailExtractor<TRoute extends PathRoute>({
  route,
  routeMatch,
}: RequestContext<RouterMeans<TRoute>>): TRoute {
  let fromEntry: number | undefined;

  routeMatch((_type, _name, _arg, position: RouteMatcher.Position<TRoute>) => {
    if (fromEntry == null) {
      fromEntry = position.entryIndex;
    }
  });

  return fromEntry ? route.section(fromEntry) : route;
}

/**
 * @internal
 */
function handlerByDispatchPattern<TRoute extends PathRoute, TMeans extends RouterMeans<TRoute>>(
  pattern: DispatchPattern<TRoute, TMeans>,
): RequestHandler<TMeans> {
  const { on } = pattern;
  const tail = pattern.tail ? pattern.tail.bind(pattern) : defaultRouteTailExtractor;

  return async (context: RequestContext<RouterMeans<TRoute> & TMeans>) => {
    const { route, routeMatch: prevMatch, routePattern, next } = context;
    const patternMatch = routeMatch(route, typeof on === 'string' ? routePattern(on) : on);

    if (!patternMatch) {
      return;
    }

    const getTail = lazyValue(() => tail({ ...context, routeMatch: patternMatch }));

    await next(
      pattern.to.bind(pattern),
      requestUpdate<RouterMeans<TRoute>>({
        get route() {
          return getTail();
        },
        routeMatch(captor: RouteCaptor<TRoute>): void {
          prevMatch(captor);
          patternMatch(captor);
        },
      }),
    );
  };
}

/**
 * Dispatches request processing by matching route pattern.
 *
 * Builds a route processing handler that dispatcher to route handler(s) corresponding to pattern the route matches.
 *
 * Selects the first matching pattern and delegates request processing to its handler. If the handler not responded,
 * then tries the next matching pattern, and so on until responded or no routes left.
 *
 * @typeParam TRoute - A type of supported route.
 * @typeParam TMeans - A type of route processing means.
 * @param routes - Either a routing dispatch pattern, or iterable of routing dispatch patterns.
 *
 * @returns Route processing handler.
 */
export function dispatchByPattern<TRoute extends PathRoute, TMeans extends RouterMeans<TRoute>>(
  routes: DispatchPattern<TRoute, TMeans> | Iterable<DispatchPattern<TRoute, TMeans>>,
): RequestHandler<TMeans> {
  return isIterable(routes)
    ? requestHandler(Array.from(routes, handlerByDispatchPattern))
    : handlerByDispatchPattern(routes);
}
