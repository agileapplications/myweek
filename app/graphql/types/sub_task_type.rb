module Types
  class SubTaskType < Types::BaseObject
    field :id, ID, null: false
    field :task_id, ID, null: false
    field :title, String, null: false
    field :completed, Boolean, null: false
  end
end
