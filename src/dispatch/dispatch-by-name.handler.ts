import type {
  RequestHandler,
  RequestHandlerMethod,
  RequestModification,
} from '@hatsy/hatsy/core.js';
import type { RouterMeans } from '../router.means.js';

/**
 * Request processing handlers for route entry names.
 *
 * @typeParam TMeans - Supported route processing means.
 */
export interface DispatchNames<TMeans extends RouterMeans> {
  /**
   * Request handler method with entry name as its key.
   */
  readonly [entry: string]: RequestHandlerMethod<this, TMeans> | undefined;
}

/**
 * Dispatches request processing by route entry name.
 *
 * Builds a route processing handler that selects a route handler to dispatch to accordingly to the name of the first
 * route entry.
 *
 * Target route handler receives a route tail without first entry.
 *
 * @typeParam TMeans - Supported route processing means.
 * @param names - A map of request processing handlers for corresponding route entry names.
 *
 * @returns New route processing handler.
 */
export function dispatchByName<TMeans extends RouterMeans>(
  names: DispatchNames<TMeans>,
): RequestHandler<TMeans> {
  return async ({ route, next }) => {
    const {
      path: [firstEntry],
    } = route;

    if (firstEntry) {
      const handler = names[firstEntry.name];

      if (handler) {
        await next(handler.bind(names), {
          route: route.section(1),
        } as RequestModification<TMeans>);
      }
    }
  };
}
