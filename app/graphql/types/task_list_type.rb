module Types
  class TaskListType < Types::BaseObject
    field :id, ID, null: false
    field :name, String, null: false
    field :tasks, [Types::TaskType], null: false do
      argument :archived, Boolean, required: false, default_value: false
    end

    def tasks(archived:)
      tasks = dataloader.with(Loaders::AssociationLoader, TaskList, :tasks).load(object)
      tasks.then do |loaded|
        filtered = archived ? loaded.select(&:archived_at?) : loaded.reject(&:archived_at?)
        filtered.sort_by { |task| [task.position, task.id] }
      end
    end
  end
end
