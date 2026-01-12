module Types
  class QueryType < Types::BaseObject
    field :tasks, resolver: Resolvers::TasksResolver
  end
end
