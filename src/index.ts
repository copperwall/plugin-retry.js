import { Octokit } from "@octokit/core";
import { RequestError } from "@octokit/request-error";

import { errorRequest } from "./error-request";
import { wrapRequest } from "./wrap-request";

export const VERSION = "0.0.0-development";

export function retry(
  octokit: Octokit,
  octokitOptions: ConstructorParameters<typeof Octokit>[0] = {}
) {
  const state = Object.assign(
    {
      enabled: true,
      retryAfterBaseValue: 1000,
      doNotRetry: [400, 401, 403, 404, 422],
      retries: 3,
    },
    octokitOptions.retry
  );

  octokit.retry = {
    retryRequest: (
      error: RequestError,
      retries: number,
      retryAfter: number
    ) => {
      error.request.request = Object.assign({}, error.request.request, {
        retries: retries,
        retryAfter: retryAfter,
      });

      return error;
    },
  };

  if (!state.enabled) {
    return;
  }

  octokit.hook.error("request", errorRequest.bind(null, octokit, state));
  octokit.hook.wrap("request", wrapRequest.bind(null, state));
}
retry.VERSION = VERSION;
