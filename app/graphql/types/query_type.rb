module Types
  class QueryType < Types::BaseObject
    field :tasks, resolver: Resolvers::TasksResolver
    field :task_lists, [Types::TaskListType], null: false

    def task_lists
      TaskList.order(:name)
    end
  end
end
