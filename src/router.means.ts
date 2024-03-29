import type { PathRoute, RouteMatch, RoutePattern, URLRoute } from '@hatsy/route-match';

/**
 * Request routing means.
 *
 * @typeParam TRoute - A type of supported route.
 */
export interface RouterMeans<TRoute extends PathRoute = URLRoute> {
  /**
   * Original route.
   *
   * This should never be changed.
   */
  readonly fullRoute: TRoute;

  /**
   * Matching route.
   *
   * This is either an original route, or its tail.
   */
  readonly route: TRoute;

  /**
   * A successful match of the route(s) against pattern(s).
   */
  readonly routeMatch: RouteMatch<TRoute>;

  /**
   * A parser of route pattern string.
   */
  routePattern(pattern: string): RoutePattern<TRoute>;
}
