module Types
  class MutationType < Types::BaseObject
    field :toggle_task_archived, Types::TaskType, null: false do
      argument :id, ID, required: true
    end

    def toggle_task_archived(id:)
      task = Task.find(id)
      next_archived_at = task.archived_at? ? nil : Time.current
      task.update!(archived_at: next_archived_at)
      task
    end
  end
end
