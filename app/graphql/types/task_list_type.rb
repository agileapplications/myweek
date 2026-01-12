module Types
  class TaskListType < Types::BaseObject
    field :id, ID, null: false
    field :name, String, null: false
    field :tasks, [Types::TaskType], null: false do
      argument :archived, Boolean, required: false, default_value: false
    end

    def tasks(archived:)
      scope = Task.where(task_list_id: object.id).order(:position, :id)
      archived ? scope.where.not(archived_at: nil) : scope.where(archived_at: nil)
    end
  end
end
