module Resolvers
  class TaskListsResolver < GraphQL::Schema::Resolver
    type [Types::TaskListType], null: false

    def resolve
      TaskList.order(:name)
    end
  end
end
