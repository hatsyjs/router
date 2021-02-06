import type { HttpMeans, RequestHandler } from '@hatsy/hatsy';
import { RequestCapability, RequestContext, requestExtension } from '@hatsy/hatsy/core';
import { PathRoute, simpleRoutePattern, urlRoute, URLRoute } from '@hatsy/route-match';
import { noop } from '@proc7ts/primitives';
import type { RouterConfig } from './router-config';
import type { RouterMeans } from './router.means';

/**
 * Request routing capability.
 *
 * Provides {@link RouterMeans request routing means} for handlers.
 *
 * @typeParam TInput - A type of request processing means required in order to apply this capability.
 * @typeParam TRoute - Supported route type.
 */
export interface Routing<TInput = HttpMeans, TRoute extends PathRoute = URLRoute>
    extends RequestCapability<TInput, RouterMeans<TRoute>> {

  /**
   * Configures routing capability that constructs a route by incoming HTTP request.
   *
   * @param config - Router configuration without route build.
   *
   * @returns New request routing capability.
   */
  with<TInput extends HttpMeans>(
      config: RouterConfig.DefaultRoute<TInput>,
  ): Routing<TInput>;

  /**
   * Configures routing capability with custom route builder.
   *
   * @param config - Route configuration with custom route builder.
   *
   * @returns New request routing capability.
   */
  with<TInput, TRoute extends PathRoute>(
      config: RouterConfig.CustomRoute<TInput, TRoute>,
  ): Routing<TInput, TRoute>;

}

/**
 * @internal
 */
function buildURLRoute<TMeans, TRoute extends PathRoute>(
    context: RequestContext<TMeans>,
): TRoute {

  const { requestAddresses } = context as unknown as HttpMeans;

  return urlRoute(requestAddresses.url) as unknown as TRoute;
}

/**
 * @internal
 */
class RoutingCapability<TInput, TRoute extends PathRoute>
    extends RequestCapability<TInput, RouterMeans<TRoute>>
    implements Routing<TInput, TRoute> {

  readonly for: <TMeans extends TInput>(
      handler: RequestHandler<TMeans & RouterMeans<TRoute>>,
  ) => RequestHandler<TMeans>;

  constructor(config: RouterConfig<TInput, TRoute>) {
    super();

    const routePattern = config.routePattern
        ? config.routePattern.bind(config)
        : simpleRoutePattern;
    const buildRoute: (context: RequestContext<TInput>) => TRoute = config.buildRoute
        ? config.buildRoute.bind(config)
        : buildURLRoute;

    this.for = <TMeans extends TInput>(
        handler: RequestHandler<TMeans & RouterMeans<TRoute>>,
    ): RequestHandler<TMeans> => context => {

      const route: TRoute = buildRoute(context as RequestContext<TInput>);

      return context.next(handler, requestExtension({
        fullRoute: route,
        route,
        routeMatch: noop,
        routePattern(pattern: string) {
          return routePattern(
              pattern,
              this as RequestContext<any>,
          );
        },
      }));
    };
  }

  with<TInput extends HttpMeans>(
      config: RouterConfig.DefaultRoute<TInput>,
  ): Routing<TInput>;

  with<TInput extends HttpMeans, TRoute extends URLRoute>(
      config: RouterConfig.CustomRoute<TInput, TRoute>,
  ): Routing<TInput, TRoute>;

  with<TInput extends HttpMeans, TRoute extends URLRoute>(
      config: RouterConfig<TInput, TRoute>,
  ): Routing<TInput, TRoute> {
    return new RoutingCapability(config);
  }

}

/**
 * Request routing capability instance.
 *
 * Can be used directly (for HTTP requests), or {@link Routing.with configured} first.
 */
export const Routing: Routing = (/*#__PURE__*/ new RoutingCapability<HttpMeans, URLRoute>({}));
