module Types
  class SubTaskType < Types::BaseObject
    field :id, ID, null: false
    field :title, String, null: false
    field :completed, Boolean, null: false

    association_field :task, type: Types::TaskType, null: false
  end
end
