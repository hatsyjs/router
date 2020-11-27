/**
 * @packageDocumentation
 * @module @hatsy/router
 */
import type { HttpMeans } from '@hatsy/hatsy';
import type { RequestContext } from '@hatsy/hatsy/core';
import type { PathRoute, RoutePattern, URLRoute } from '@hatsy/route-match';
import type { RouterMeans } from './router.means';

/**
 * Router configuration.
 *
 * @typeParam TMeans  A type of incoming request processing means.
 * @typeParam TRoute  Supported route type.
 */
export type RouterConfig<TMeans = HttpMeans, TRoute extends PathRoute = URLRoute> =
    | RouterConfig.DefaultRoute<TMeans, TRoute>
    | RouterConfig.CustomRoute<TMeans, TRoute>;

export namespace RouterConfig {

  /**
   * Base router configuration.
   *
   * @typeParam TMeans  A type of incoming request processing means.
   * @typeParam TRoute  Supported route type.
   */
  export interface Base<TMeans = HttpMeans, TRoute extends PathRoute = URLRoute> {

    /**
     * A parser of route pattern string.
     *
     * The `this` parameter is bound to current request processing means.
     *
     * @param pattern  Pattern string in supported format.
     * @param context  Current request processing context.
     *
     * @default Supports patterns in simple format (`simpleRoutePattern()`).
     */
    routePattern?(pattern: string, context: RequestContext<TMeans & RouterMeans<TRoute>>): RoutePattern<TRoute>;

  }

  /**
   * Router configuration with default route builder.
   *
   * @typeParam TMeans  A type of incoming request processing means.
   * @typeParam TRoute  Supported route type.
   */
  export interface DefaultRoute<TMeans = HttpMeans, TRoute extends PathRoute = URLRoute> extends Base<TMeans, TRoute> {

    readonly buildRoute?: undefined;

  }

  /**
   * Router configuration with custom route builder.
   *
   * @typeParam TMeans  A type of incoming HTTP request processing means.
   */
  export interface CustomRoute<TMeans = HttpMeans, TRoute extends PathRoute = URLRoute> extends Base<TMeans, TRoute> {

    /**
     * Builds a route based on incoming request.
     *
     * @param context  Request processing context.
     *
     * @returns New URL route.
     *
     * @default Builds a route based on {@link HttpMeans.Addresses.url request URL} (for HTTP requests).
     */
    buildRoute(context: RequestContext<TMeans>): TRoute;

  }

}
