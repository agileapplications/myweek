class TasksController < ApplicationController
  def index
    @task_lists = TaskList.includes(:tasks).order(:name)
    @backlog_task_count = @task_lists.sum { |list| list.tasks.size }
  end

  def update
    task = Task.find(params[:id])
    source_list_id = task.task_list_id
    target_list_id = task_params[:task_list_id]&.to_i || source_list_id
    target_position = task_params[:position]&.to_i

    Task.transaction do
      normalize_positions!(source_list_id)
      normalize_positions!(target_list_id) if target_list_id != source_list_id

      target_position = Task.where(task_list_id: target_list_id).where.not(id: task.id).count if target_position.nil?
      target_position = [[target_position, 0].max, Task.where(task_list_id: target_list_id).where.not(id: task.id).count].min

      Task.where(task_list_id: target_list_id).where.not(id: task.id).where("position >= ?", target_position)
          .update_all("position = position + 1")

      task.update!(task_list_id: target_list_id, position: target_position)

      normalize_positions!(source_list_id)
      normalize_positions!(target_list_id)
    end

    render json: { id: task.id, task_list_id: task.task_list_id, position: task.position }
  rescue ActiveRecord::RecordInvalid
    render json: { errors: task.errors.full_messages }, status: :unprocessable_entity
  end

  private

  def task_params
    params.require(:task).permit(:task_list_id, :position)
  end

  def normalize_positions!(list_id)
    Task.where(task_list_id: list_id).order(:position, :id).pluck(:id).each_with_index do |id, index|
      Task.where(id: id).update_all(position: index)
    end
  end
end
