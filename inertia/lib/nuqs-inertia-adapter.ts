import { router, usePage } from '@inertiajs/react';
import {
  unstable_createAdapterProvider as createAdapterProvider,
  renderQueryString,
  type unstable_AdapterInterface as AdapterInterface,
  type unstable_AdapterOptions as AdapterOptions,
  type unstable_UpdateUrlFunction as UpdateUrlFunction
} from 'nuqs/adapters/custom';
import * as React from 'react';
import { useEffect } from 'react';

const isServer = typeof window === 'undefined';

function getSearchParams(url: string): URLSearchParams {
  if (isServer) {
    // On server, parse the URL without origin
    const queryIndex = url.indexOf('?');
    if (queryIndex === -1) return new URLSearchParams();
    return new URLSearchParams(url.slice(queryIndex));
  }

  // Check if URL is already absolute
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return new URL(url).searchParams;
  }

  // Relative URL - prepend origin
  return new URL(`${location.origin}${url}`).searchParams;
}

function useNuqsInertiaAdapter(): AdapterInterface {
  const currentUrl = usePage().url;
  // We need the searchParams to be optimistic to avoid
  // flickering when the internal state is updated
  // but the URL is not yet updated.
  const [searchParams, setSearchParams] = React.useState(() =>
    getSearchParams(currentUrl)
  );

  useEffect(() => {
    setSearchParams(getSearchParams(currentUrl));
  }, [currentUrl]);

  const updateUrl: UpdateUrlFunction = React.useCallback(
    (search: URLSearchParams, options: AdapterOptions) => {
      // Skip URL updates on server
      if (isServer) return;

      const url = new URL(window.location.href);
      url.search = renderQueryString(search);
      setSearchParams(url.searchParams);

      // Server-side request
      if (options?.shallow === false) {
        router.visit(url, {
          replace: options.history === 'replace',
          preserveScroll: !options.scroll,
          preserveState: true,
          async: true
        });
        return;
      }

      const method = options.history === 'replace' ? 'replace' : 'push';

      router[method]({
        url: url.toString(),
        clearHistory: false,
        encryptHistory: false,
        preserveScroll: !options.scroll,
        preserveState: true
      });
    },
    []
  );

  return {
    searchParams,
    updateUrl
  };
}

export const NuqsAdapter = createAdapterProvider(useNuqsInertiaAdapter);
