import {
    ApolloClient,
    InMemoryCache,
    HttpLink,
    from,
    NormalizedCacheObject,
} from "@apollo/client"
import { setContext } from '@apollo/client/link/context'
import merge from 'deepmerge';
import { AppProps } from 'next/app';
import { useMemo } from 'react';
// you need to provide your appsync config, follow readMe file
import AppSync from '../Appsync';

export const APOLLO_STATE_PROP_NAME = '__APOLLO_STATE__';

const authLink = setContext((_, { headers }) => {
    return {
        headers: {
            ...headers,
            'X-Api-Key': AppSync.aws_appsync_apiKey,
        },
    }
})

const httpLink = new HttpLink({
    uri: AppSync.aws_appsync_graphqlEndpoint,
})

function createApolloClient() {
    return new ApolloClient({
        ssrMode: typeof window === 'undefined',
        link: from([
            authLink,
            httpLink
        ]),
        cache: new InMemoryCache(),
    });
}

let apolloClient: ApolloClient<import('@apollo/client').NormalizedCacheObject>;
export function initializeApollo(
    initialState: NormalizedCacheObject = {},
): ApolloClient<NormalizedCacheObject> {
    const _apolloClient = apolloClient ?? createApolloClient();

    // If your page has Next.js data fetching methods that use Apollo Client, the initial state
    // gets hydrated here
    if (initialState) {
        // Get existing cache, loaded during client side data fetching
        const existingCache = _apolloClient.extract();

        // Merge the existing cache into data passed from getStaticProps/getServerSideProps
        const data = merge(initialState, existingCache);

        // Restore the cache with the merged data
        _apolloClient.cache.restore(data);
    }
    // For SSG and SSR always create a new Apollo Client
    if (typeof window === 'undefined') return _apolloClient;
    // Create the Apollo Client once in the client
    if (!apolloClient) apolloClient = _apolloClient;

    return _apolloClient;
}

export function useApollo(
    pageProps: AppProps['pageProps'],
): ApolloClient<NormalizedCacheObject> {
    const state = pageProps[APOLLO_STATE_PROP_NAME];
    const store = useMemo(() => initializeApollo(state), [state]);
    return store;
}
