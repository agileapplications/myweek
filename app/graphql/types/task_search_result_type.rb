module Types
  class TaskSearchResultType < Types::BaseObject
    field :total_count, Integer, null: false
    field :tasks, [Types::TaskType], null: false
  end
end
