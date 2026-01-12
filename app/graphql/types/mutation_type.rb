module Types
  class MutationType < Types::BaseObject
    field :create_task, Types::TaskType, null: false do
      argument :task_list_id, ID, required: true
      argument :title, String, required: true
      argument :description, String, required: false
      argument :big, Boolean, required: false
    end

    field :update_task, Types::TaskType, null: false do
      argument :id, ID, required: true
      argument :title, String, required: false
      argument :description, String, required: false
      argument :big, Boolean, required: false
    end

    field :move_task, Types::TaskType, null: false do
      argument :id, ID, required: true
      argument :task_list_id, ID, required: true
      argument :position, Integer, required: true
    end

    field :set_task_planned, Types::TaskType, null: false do
      argument :id, ID, required: true
      argument :planned, String, required: false
    end

    field :toggle_task_archived, Types::TaskType, null: false do
      argument :id, ID, required: true
    end

    field :create_sub_task, Types::SubTaskType, null: false do
      argument :task_id, ID, required: true
      argument :title, String, required: true
    end

    field :update_sub_task, Types::SubTaskType, null: false do
      argument :id, ID, required: true
      argument :title, String, required: false
      argument :completed, Boolean, required: false
    end

    field :delete_sub_task, ID, null: false do
      argument :id, ID, required: true
    end

    def create_task(task_list_id:, title:, description: nil, big: false)
      list = TaskList.find(task_list_id)
      position = Task.where(task_list_id: list.id, archived_at: nil).count
      Task.create!(
        task_list_id: list.id,
        title: title,
        description: description.presence,
        big: big || false,
        position: position
      )
    end

    def update_task(id:, title: nil, description: nil, big: nil)
      task = Task.find(id)
      updates = {}
      updates[:title] = title if title.present?
      updates[:description] = description.presence unless description.nil?
      updates[:big] = big unless big.nil?
      task.update!(updates) if updates.any?
      task
    end

    def move_task(id:, task_list_id:, position:)
      task = Task.find(id)
      source_list_id = task.task_list_id
      target_list_id = task_list_id.to_i

      Task.transaction do
        target_ids = Task.where(task_list_id: target_list_id, archived_at: nil)
                         .where.not(id: task.id)
                         .order(:position, :id)
                         .pluck(:id)
        clamped_position = [[position.to_i, 0].max, target_ids.length].min
        target_ids.insert(clamped_position, task.id)

        target_ids.each_with_index do |task_id, index|
          Task.where(id: task_id).update_all(position: index)
        end

        if source_list_id != target_list_id
          source_ids = Task.where(task_list_id: source_list_id, archived_at: nil)
                           .where.not(id: task.id)
                           .order(:position, :id)
                           .pluck(:id)
          source_ids.each_with_index do |task_id, index|
            Task.where(id: task_id).update_all(position: index)
          end
        end

        task.update!(task_list_id: target_list_id, position: clamped_position)
      end

      task.reload
    end

    def set_task_planned(id:, planned: nil)
      task = Task.find(id)
      task.update!(planned: planned.presence)
      task
    end

    def toggle_task_archived(id:)
      task = Task.find(id)
      next_archived_at = task.archived_at? ? nil : Time.current
      task.update!(archived_at: next_archived_at)
      task
    end

    def create_sub_task(task_id:, title:)
      task = Task.find(task_id)
      SubTask.create!(task: task, title: title, completed: false)
    end

    def update_sub_task(id:, title: nil, completed: nil)
      sub_task = SubTask.find(id)
      updates = {}
      updates[:title] = title if title.present?
      updates[:completed] = completed unless completed.nil?
      sub_task.update!(updates) if updates.any?
      sub_task
    end

    def delete_sub_task(id:)
      sub_task = SubTask.find(id)
      sub_task.destroy
      id
    end
  end
end
