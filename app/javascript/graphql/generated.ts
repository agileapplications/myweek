import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: any; output: any; }
};

export type Mutation = {
  __typename?: 'Mutation';
  toggleTaskArchived: Task;
};


export type MutationToggleTaskArchivedArgs = {
  id: Scalars['ID']['input'];
};

export type Query = {
  __typename?: 'Query';
  tasks: Array<Task>;
};


export type QueryTasksArgs = {
  archived?: InputMaybe<Scalars['Boolean']['input']>;
};

export type Task = {
  __typename?: 'Task';
  archivedAt?: Maybe<Scalars['DateTime']['output']>;
  big: Scalars['Boolean']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  planned?: Maybe<Scalars['String']['output']>;
  position: Scalars['Int']['output'];
  taskListId: Scalars['ID']['output'];
  title: Scalars['String']['output'];
};

export type ToggleTaskArchivedMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ToggleTaskArchivedMutation = { __typename?: 'Mutation', toggleTaskArchived: { __typename?: 'Task', id: string, archivedAt?: any | null } };

export type QueryTaskListQueryVariables = Exact<{
  archived?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type QueryTaskListQuery = { __typename?: 'Query', tasks: Array<{ __typename?: 'Task', id: string, title: string, description?: string | null, big: boolean, position: number, archivedAt?: any | null }> };


export const ToggleTaskArchivedDocument = gql`
    mutation ToggleTaskArchived($id: ID!) {
  toggleTaskArchived(id: $id) {
    id
    archivedAt
  }
}
    `;
export type ToggleTaskArchivedMutationFn = Apollo.MutationFunction<ToggleTaskArchivedMutation, ToggleTaskArchivedMutationVariables>;

/**
 * __useToggleTaskArchivedMutation__
 *
 * To run a mutation, you first call `useToggleTaskArchivedMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useToggleTaskArchivedMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [toggleTaskArchivedMutation, { data, loading, error }] = useToggleTaskArchivedMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useToggleTaskArchivedMutation(baseOptions?: Apollo.MutationHookOptions<ToggleTaskArchivedMutation, ToggleTaskArchivedMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ToggleTaskArchivedMutation, ToggleTaskArchivedMutationVariables>(ToggleTaskArchivedDocument, options);
      }
export type ToggleTaskArchivedMutationHookResult = ReturnType<typeof useToggleTaskArchivedMutation>;
export type ToggleTaskArchivedMutationResult = Apollo.MutationResult<ToggleTaskArchivedMutation>;
export type ToggleTaskArchivedMutationOptions = Apollo.BaseMutationOptions<ToggleTaskArchivedMutation, ToggleTaskArchivedMutationVariables>;
export const QueryTaskListDocument = gql`
    query QueryTaskList($archived: Boolean) {
  tasks(archived: $archived) {
    id
    title
    description
    big
    position
    archivedAt
  }
}
    `;

/**
 * __useQueryTaskListQuery__
 *
 * To run a query within a React component, call `useQueryTaskListQuery` and pass it any options that fit your needs.
 * When your component renders, `useQueryTaskListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useQueryTaskListQuery({
 *   variables: {
 *      archived: // value for 'archived'
 *   },
 * });
 */
export function useQueryTaskListQuery(baseOptions?: Apollo.QueryHookOptions<QueryTaskListQuery, QueryTaskListQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<QueryTaskListQuery, QueryTaskListQueryVariables>(QueryTaskListDocument, options);
      }
export function useQueryTaskListLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<QueryTaskListQuery, QueryTaskListQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<QueryTaskListQuery, QueryTaskListQueryVariables>(QueryTaskListDocument, options);
        }
// @ts-ignore
export function useQueryTaskListSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<QueryTaskListQuery, QueryTaskListQueryVariables>): Apollo.UseSuspenseQueryResult<QueryTaskListQuery, QueryTaskListQueryVariables>;
export function useQueryTaskListSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<QueryTaskListQuery, QueryTaskListQueryVariables>): Apollo.UseSuspenseQueryResult<QueryTaskListQuery | undefined, QueryTaskListQueryVariables>;
export function useQueryTaskListSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<QueryTaskListQuery, QueryTaskListQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<QueryTaskListQuery, QueryTaskListQueryVariables>(QueryTaskListDocument, options);
        }
export type QueryTaskListQueryHookResult = ReturnType<typeof useQueryTaskListQuery>;
export type QueryTaskListLazyQueryHookResult = ReturnType<typeof useQueryTaskListLazyQuery>;
export type QueryTaskListSuspenseQueryHookResult = ReturnType<typeof useQueryTaskListSuspenseQuery>;
export type QueryTaskListQueryResult = Apollo.QueryResult<QueryTaskListQuery, QueryTaskListQueryVariables>;