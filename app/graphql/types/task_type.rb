module Types
  class TaskType < Types::BaseObject
    field :id, ID, null: false
    field :task_list_id, ID, null: false
    field :title, String, null: false
    field :description, String, null: true
    field :big, Boolean, null: false
    field :planned, String, null: true
    field :position, Integer, null: false
    field :archived_at, GraphQL::Types::ISO8601DateTime, null: true
  end
end
