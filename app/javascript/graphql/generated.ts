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
  __typename: 'Mutation';
  createSubTask: SubTask;
  createTask: Task;
  deleteSubTask: Scalars['ID']['output'];
  deleteTaskList: Scalars['ID']['output'];
  moveTask: Task;
  setTaskPlanned: Task;
  toggleTaskArchived: Task;
  updateSubTask: SubTask;
  updateTask: Task;
};


export type MutationCreateSubTaskArgs = {
  taskId: Scalars['ID']['input'];
  title: Scalars['String']['input'];
};


export type MutationCreateTaskArgs = {
  big?: InputMaybe<Scalars['Boolean']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  taskListId: Scalars['ID']['input'];
  title: Scalars['String']['input'];
};


export type MutationDeleteSubTaskArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteTaskListArgs = {
  id: Scalars['ID']['input'];
};


export type MutationMoveTaskArgs = {
  id: Scalars['ID']['input'];
  position: Scalars['Int']['input'];
  taskListId: Scalars['ID']['input'];
};


export type MutationSetTaskPlannedArgs = {
  id: Scalars['ID']['input'];
  planned?: InputMaybe<Scalars['String']['input']>;
};


export type MutationToggleTaskArchivedArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUpdateSubTaskArgs = {
  completed?: InputMaybe<Scalars['Boolean']['input']>;
  id: Scalars['ID']['input'];
  title?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateTaskArgs = {
  big?: InputMaybe<Scalars['Boolean']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  title?: InputMaybe<Scalars['String']['input']>;
};

export type Query = {
  __typename: 'Query';
  taskLists: Array<TaskList>;
  tasks: Array<Task>;
};


export type QueryTasksArgs = {
  archived?: InputMaybe<Scalars['Boolean']['input']>;
};

export type SubTask = {
  __typename: 'SubTask';
  completed: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  taskId: Scalars['ID']['output'];
  title: Scalars['String']['output'];
};

export type Task = {
  __typename: 'Task';
  archivedAt?: Maybe<Scalars['DateTime']['output']>;
  big: Scalars['Boolean']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  planned?: Maybe<Scalars['String']['output']>;
  position: Scalars['Int']['output'];
  subTasks: Array<SubTask>;
  taskList: TaskList;
  taskListId: Scalars['ID']['output'];
  title: Scalars['String']['output'];
};

export type TaskList = {
  __typename: 'TaskList';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  tasks: Array<Task>;
};


export type TaskListTasksArgs = {
  archived?: InputMaybe<Scalars['Boolean']['input']>;
};

export type CreateSubTaskMutationVariables = Exact<{
  taskId: Scalars['ID']['input'];
  title: Scalars['String']['input'];
}>;


export type CreateSubTaskMutation = { __typename: 'Mutation', createSubTask: { __typename: 'SubTask', id: string, taskId: string, title: string, completed: boolean } };

export type CreateTaskMutationVariables = Exact<{
  taskListId: Scalars['ID']['input'];
  title: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  big?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type CreateTaskMutation = { __typename: 'Mutation', createTask: { __typename: 'Task', id: string, taskListId: string, title: string, description?: string | null, big: boolean, planned?: string | null, position: number, archivedAt?: any | null, subTasks: Array<{ __typename: 'SubTask', id: string, taskId: string, title: string, completed: boolean }> } };

export type DeleteSubTaskMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteSubTaskMutation = { __typename: 'Mutation', deleteSubTask: string };

export type DeleteTaskListMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteTaskListMutation = { __typename: 'Mutation', deleteTaskList: string };

export type MoveTaskMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  taskListId: Scalars['ID']['input'];
  position: Scalars['Int']['input'];
}>;


export type MoveTaskMutation = { __typename: 'Mutation', moveTask: { __typename: 'Task', id: string, taskListId: string, position: number } };

export type SetTaskPlannedMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  planned?: InputMaybe<Scalars['String']['input']>;
}>;


export type SetTaskPlannedMutation = { __typename: 'Mutation', setTaskPlanned: { __typename: 'Task', id: string, planned?: string | null } };

export type ToggleTaskArchivedMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ToggleTaskArchivedMutation = { __typename: 'Mutation', toggleTaskArchived: { __typename: 'Task', id: string, archivedAt?: any | null } };

export type UpdateSubTaskMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  title?: InputMaybe<Scalars['String']['input']>;
  completed?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type UpdateSubTaskMutation = { __typename: 'Mutation', updateSubTask: { __typename: 'SubTask', id: string, taskId: string, title: string, completed: boolean } };

export type UpdateTaskMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  title?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  big?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type UpdateTaskMutation = { __typename: 'Mutation', updateTask: { __typename: 'Task', id: string, taskListId: string, title: string, description?: string | null, big: boolean, planned?: string | null, position: number, archivedAt?: any | null, subTasks: Array<{ __typename: 'SubTask', id: string, taskId: string, title: string, completed: boolean }> } };

export type MainBoardQueryVariables = Exact<{ [key: string]: never; }>;


export type MainBoardQuery = { __typename: 'Query', taskLists: Array<{ __typename: 'TaskList', id: string, name: string, tasks: Array<{ __typename: 'Task', id: string, taskListId: string, title: string, description?: string | null, big: boolean, planned?: string | null, position: number, archivedAt?: any | null, subTasks: Array<{ __typename: 'SubTask', id: string, taskId: string, title: string, completed: boolean }> }> }> };


export const CreateSubTaskDocument = gql`
    mutation CreateSubTask($taskId: ID!, $title: String!) {
  createSubTask(taskId: $taskId, title: $title) {
    id
    taskId
    title
    completed
  }
}
    `;
export type CreateSubTaskMutationFn = Apollo.MutationFunction<CreateSubTaskMutation, CreateSubTaskMutationVariables>;

/**
 * __useCreateSubTaskMutation__
 *
 * To run a mutation, you first call `useCreateSubTaskMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateSubTaskMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createSubTaskMutation, { data, loading, error }] = useCreateSubTaskMutation({
 *   variables: {
 *      taskId: // value for 'taskId'
 *      title: // value for 'title'
 *   },
 * });
 */
export function useCreateSubTaskMutation(baseOptions?: Apollo.MutationHookOptions<CreateSubTaskMutation, CreateSubTaskMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateSubTaskMutation, CreateSubTaskMutationVariables>(CreateSubTaskDocument, options);
      }
export type CreateSubTaskMutationHookResult = ReturnType<typeof useCreateSubTaskMutation>;
export type CreateSubTaskMutationResult = Apollo.MutationResult<CreateSubTaskMutation>;
export type CreateSubTaskMutationOptions = Apollo.BaseMutationOptions<CreateSubTaskMutation, CreateSubTaskMutationVariables>;
export const CreateTaskDocument = gql`
    mutation CreateTask($taskListId: ID!, $title: String!, $description: String, $big: Boolean) {
  createTask(
    taskListId: $taskListId
    title: $title
    description: $description
    big: $big
  ) {
    id
    taskListId
    title
    description
    big
    planned
    position
    archivedAt
    subTasks {
      id
      taskId
      title
      completed
    }
  }
}
    `;
export type CreateTaskMutationFn = Apollo.MutationFunction<CreateTaskMutation, CreateTaskMutationVariables>;

/**
 * __useCreateTaskMutation__
 *
 * To run a mutation, you first call `useCreateTaskMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateTaskMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createTaskMutation, { data, loading, error }] = useCreateTaskMutation({
 *   variables: {
 *      taskListId: // value for 'taskListId'
 *      title: // value for 'title'
 *      description: // value for 'description'
 *      big: // value for 'big'
 *   },
 * });
 */
export function useCreateTaskMutation(baseOptions?: Apollo.MutationHookOptions<CreateTaskMutation, CreateTaskMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateTaskMutation, CreateTaskMutationVariables>(CreateTaskDocument, options);
      }
export type CreateTaskMutationHookResult = ReturnType<typeof useCreateTaskMutation>;
export type CreateTaskMutationResult = Apollo.MutationResult<CreateTaskMutation>;
export type CreateTaskMutationOptions = Apollo.BaseMutationOptions<CreateTaskMutation, CreateTaskMutationVariables>;
export const DeleteSubTaskDocument = gql`
    mutation DeleteSubTask($id: ID!) {
  deleteSubTask(id: $id)
}
    `;
export type DeleteSubTaskMutationFn = Apollo.MutationFunction<DeleteSubTaskMutation, DeleteSubTaskMutationVariables>;

/**
 * __useDeleteSubTaskMutation__
 *
 * To run a mutation, you first call `useDeleteSubTaskMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteSubTaskMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteSubTaskMutation, { data, loading, error }] = useDeleteSubTaskMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteSubTaskMutation(baseOptions?: Apollo.MutationHookOptions<DeleteSubTaskMutation, DeleteSubTaskMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteSubTaskMutation, DeleteSubTaskMutationVariables>(DeleteSubTaskDocument, options);
      }
export type DeleteSubTaskMutationHookResult = ReturnType<typeof useDeleteSubTaskMutation>;
export type DeleteSubTaskMutationResult = Apollo.MutationResult<DeleteSubTaskMutation>;
export type DeleteSubTaskMutationOptions = Apollo.BaseMutationOptions<DeleteSubTaskMutation, DeleteSubTaskMutationVariables>;
export const DeleteTaskListDocument = gql`
    mutation DeleteTaskList($id: ID!) {
  deleteTaskList(id: $id)
}
    `;
export type DeleteTaskListMutationFn = Apollo.MutationFunction<DeleteTaskListMutation, DeleteTaskListMutationVariables>;

/**
 * __useDeleteTaskListMutation__
 *
 * To run a mutation, you first call `useDeleteTaskListMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteTaskListMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteTaskListMutation, { data, loading, error }] = useDeleteTaskListMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteTaskListMutation(baseOptions?: Apollo.MutationHookOptions<DeleteTaskListMutation, DeleteTaskListMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteTaskListMutation, DeleteTaskListMutationVariables>(DeleteTaskListDocument, options);
      }
export type DeleteTaskListMutationHookResult = ReturnType<typeof useDeleteTaskListMutation>;
export type DeleteTaskListMutationResult = Apollo.MutationResult<DeleteTaskListMutation>;
export type DeleteTaskListMutationOptions = Apollo.BaseMutationOptions<DeleteTaskListMutation, DeleteTaskListMutationVariables>;
export const MoveTaskDocument = gql`
    mutation MoveTask($id: ID!, $taskListId: ID!, $position: Int!) {
  moveTask(id: $id, taskListId: $taskListId, position: $position) {
    id
    taskListId
    position
  }
}
    `;
export type MoveTaskMutationFn = Apollo.MutationFunction<MoveTaskMutation, MoveTaskMutationVariables>;

/**
 * __useMoveTaskMutation__
 *
 * To run a mutation, you first call `useMoveTaskMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMoveTaskMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [moveTaskMutation, { data, loading, error }] = useMoveTaskMutation({
 *   variables: {
 *      id: // value for 'id'
 *      taskListId: // value for 'taskListId'
 *      position: // value for 'position'
 *   },
 * });
 */
export function useMoveTaskMutation(baseOptions?: Apollo.MutationHookOptions<MoveTaskMutation, MoveTaskMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<MoveTaskMutation, MoveTaskMutationVariables>(MoveTaskDocument, options);
      }
export type MoveTaskMutationHookResult = ReturnType<typeof useMoveTaskMutation>;
export type MoveTaskMutationResult = Apollo.MutationResult<MoveTaskMutation>;
export type MoveTaskMutationOptions = Apollo.BaseMutationOptions<MoveTaskMutation, MoveTaskMutationVariables>;
export const SetTaskPlannedDocument = gql`
    mutation SetTaskPlanned($id: ID!, $planned: String) {
  setTaskPlanned(id: $id, planned: $planned) {
    id
    planned
  }
}
    `;
export type SetTaskPlannedMutationFn = Apollo.MutationFunction<SetTaskPlannedMutation, SetTaskPlannedMutationVariables>;

/**
 * __useSetTaskPlannedMutation__
 *
 * To run a mutation, you first call `useSetTaskPlannedMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetTaskPlannedMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setTaskPlannedMutation, { data, loading, error }] = useSetTaskPlannedMutation({
 *   variables: {
 *      id: // value for 'id'
 *      planned: // value for 'planned'
 *   },
 * });
 */
export function useSetTaskPlannedMutation(baseOptions?: Apollo.MutationHookOptions<SetTaskPlannedMutation, SetTaskPlannedMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SetTaskPlannedMutation, SetTaskPlannedMutationVariables>(SetTaskPlannedDocument, options);
      }
export type SetTaskPlannedMutationHookResult = ReturnType<typeof useSetTaskPlannedMutation>;
export type SetTaskPlannedMutationResult = Apollo.MutationResult<SetTaskPlannedMutation>;
export type SetTaskPlannedMutationOptions = Apollo.BaseMutationOptions<SetTaskPlannedMutation, SetTaskPlannedMutationVariables>;
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
export const UpdateSubTaskDocument = gql`
    mutation UpdateSubTask($id: ID!, $title: String, $completed: Boolean) {
  updateSubTask(id: $id, title: $title, completed: $completed) {
    id
    taskId
    title
    completed
  }
}
    `;
export type UpdateSubTaskMutationFn = Apollo.MutationFunction<UpdateSubTaskMutation, UpdateSubTaskMutationVariables>;

/**
 * __useUpdateSubTaskMutation__
 *
 * To run a mutation, you first call `useUpdateSubTaskMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateSubTaskMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateSubTaskMutation, { data, loading, error }] = useUpdateSubTaskMutation({
 *   variables: {
 *      id: // value for 'id'
 *      title: // value for 'title'
 *      completed: // value for 'completed'
 *   },
 * });
 */
export function useUpdateSubTaskMutation(baseOptions?: Apollo.MutationHookOptions<UpdateSubTaskMutation, UpdateSubTaskMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateSubTaskMutation, UpdateSubTaskMutationVariables>(UpdateSubTaskDocument, options);
      }
export type UpdateSubTaskMutationHookResult = ReturnType<typeof useUpdateSubTaskMutation>;
export type UpdateSubTaskMutationResult = Apollo.MutationResult<UpdateSubTaskMutation>;
export type UpdateSubTaskMutationOptions = Apollo.BaseMutationOptions<UpdateSubTaskMutation, UpdateSubTaskMutationVariables>;
export const UpdateTaskDocument = gql`
    mutation UpdateTask($id: ID!, $title: String, $description: String, $big: Boolean) {
  updateTask(id: $id, title: $title, description: $description, big: $big) {
    id
    taskListId
    title
    description
    big
    planned
    position
    archivedAt
    subTasks {
      id
      taskId
      title
      completed
    }
  }
}
    `;
export type UpdateTaskMutationFn = Apollo.MutationFunction<UpdateTaskMutation, UpdateTaskMutationVariables>;

/**
 * __useUpdateTaskMutation__
 *
 * To run a mutation, you first call `useUpdateTaskMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateTaskMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateTaskMutation, { data, loading, error }] = useUpdateTaskMutation({
 *   variables: {
 *      id: // value for 'id'
 *      title: // value for 'title'
 *      description: // value for 'description'
 *      big: // value for 'big'
 *   },
 * });
 */
export function useUpdateTaskMutation(baseOptions?: Apollo.MutationHookOptions<UpdateTaskMutation, UpdateTaskMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateTaskMutation, UpdateTaskMutationVariables>(UpdateTaskDocument, options);
      }
export type UpdateTaskMutationHookResult = ReturnType<typeof useUpdateTaskMutation>;
export type UpdateTaskMutationResult = Apollo.MutationResult<UpdateTaskMutation>;
export type UpdateTaskMutationOptions = Apollo.BaseMutationOptions<UpdateTaskMutation, UpdateTaskMutationVariables>;
export const MainBoardDocument = gql`
    query MainBoard {
  taskLists {
    id
    name
    tasks {
      id
      taskListId
      title
      description
      big
      planned
      position
      archivedAt
      subTasks {
        id
        taskId
        title
        completed
      }
    }
  }
}
    `;

/**
 * __useMainBoardQuery__
 *
 * To run a query within a React component, call `useMainBoardQuery` and pass it any options that fit your needs.
 * When your component renders, `useMainBoardQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMainBoardQuery({
 *   variables: {
 *   },
 * });
 */
export function useMainBoardQuery(baseOptions?: Apollo.QueryHookOptions<MainBoardQuery, MainBoardQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MainBoardQuery, MainBoardQueryVariables>(MainBoardDocument, options);
      }
export function useMainBoardLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MainBoardQuery, MainBoardQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MainBoardQuery, MainBoardQueryVariables>(MainBoardDocument, options);
        }
// @ts-ignore
export function useMainBoardSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<MainBoardQuery, MainBoardQueryVariables>): Apollo.UseSuspenseQueryResult<MainBoardQuery, MainBoardQueryVariables>;
export function useMainBoardSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MainBoardQuery, MainBoardQueryVariables>): Apollo.UseSuspenseQueryResult<MainBoardQuery | undefined, MainBoardQueryVariables>;
export function useMainBoardSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MainBoardQuery, MainBoardQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<MainBoardQuery, MainBoardQueryVariables>(MainBoardDocument, options);
        }
export type MainBoardQueryHookResult = ReturnType<typeof useMainBoardQuery>;
export type MainBoardLazyQueryHookResult = ReturnType<typeof useMainBoardLazyQuery>;
export type MainBoardSuspenseQueryHookResult = ReturnType<typeof useMainBoardSuspenseQuery>;
export type MainBoardQueryResult = Apollo.QueryResult<MainBoardQuery, MainBoardQueryVariables>;