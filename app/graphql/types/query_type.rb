module Types
  class QueryType < Types::BaseObject
    field :tasks, resolver: Resolvers::TasksResolver
    field :task_lists, resolver: Resolvers::TaskListsResolver
    field :search_tasks, resolver: Resolvers::TaskSearchResolver
  end
end
