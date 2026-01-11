class TasksController < ApplicationController
  def index
    @task_lists = TaskList.includes(:tasks).order(:name)
    @backlog_task_count = @task_lists.sum { |list| list.tasks.size }
    @week_days = [
      { key: "monday", label: "Mon" },
      { key: "tuesday", label: "Tue" },
      { key: "wednesday", label: "Wed" },
      { key: "thursday", label: "Thu" },
      { key: "friday", label: "Fri" },
      { key: "saturday", label: "Sat" },
      { key: "sunday", label: "Sun" },
      { key: "next_week", label: "Next Week" }
    ]
    planned_keys = @week_days.map { |day| day[:key] }
    @planned_by_day = @task_lists.flat_map(&:tasks)
                                 .select { |task| planned_keys.include?(task.planned) }
                                 .group_by(&:planned)
  end

  def create
    list = TaskList.find_by(id: task_params[:task_list_id])
    unless list
      render json: { errors: ["Task list not found"] }, status: :unprocessable_entity
      return
    end
    position = list.tasks.count

    task = list.tasks.new(task_params.except(:position).merge(position: position))

    if task.save
      render json: {
        id: task.id,
        task_list_id: task.task_list_id,
        title: task.title,
        description: task.description,
        big: task.big,
        planned: task.planned,
        position: task.position
      }
    else
      render json: { errors: task.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    task = Task.find(params[:id])

    if task_params[:archived_at].present?
      if task.update(task_params)
        normalize_positions!(task.task_list_id)
        render json: { id: task.id, archived_at: task.archived_at }
      else
        render json: { errors: task.errors.full_messages }, status: :unprocessable_entity
      end
      return
    end

    planned_param_present = params[:task].is_a?(ActionController::Parameters) &&
      (params[:task].key?(:planned) || params[:task].key?("planned"))
    planned_value = task_params[:planned].presence

    if planned_param_present && task_params[:task_list_id].blank? && task_params[:position].blank?
      if task.update(planned: planned_value)
        render json: { id: task.id, planned: task.planned }
      else
        render json: { errors: task.errors.full_messages }, status: :unprocessable_entity
      end
      return
    end

    if task_params[:task_list_id].present? || task_params[:position].present?
      source_list_id = task.task_list_id
      target_list_id = task_params[:task_list_id]&.to_i || source_list_id
      target_position = task_params[:position]&.to_i

      Task.transaction do
        normalize_positions!(source_list_id)
        normalize_positions!(target_list_id) if target_list_id != source_list_id

      target_position = Task.where(task_list_id: target_list_id, archived_at: nil).where.not(id: task.id).count if target_position.nil?
      target_position = [
        [target_position, 0].max,
        Task.where(task_list_id: target_list_id, archived_at: nil).where.not(id: task.id).count
      ].min

      Task.where(task_list_id: target_list_id, archived_at: nil).where.not(id: task.id)
          .where("position >= ?", target_position)
          .update_all("position = position + 1")

        task.update!(task_list_id: target_list_id, position: target_position)

        normalize_positions!(source_list_id)
        normalize_positions!(target_list_id)
      end

      render json: { id: task.id, task_list_id: task.task_list_id, position: task.position }
    elsif task.update(task_params)
      render json: {
        id: task.id,
        title: task.title,
        description: task.description,
        big: task.big,
        planned: task.planned
      }
    else
      render json: { errors: task.errors.full_messages }, status: :unprocessable_entity
    end
  rescue ActiveRecord::RecordInvalid
    render json: { errors: task.errors.full_messages }, status: :unprocessable_entity
  end

  private

  def task_params
    params.require(:task).permit(:task_list_id, :position, :archived_at, :title, :description, :big, :planned)
  end

  def normalize_positions!(list_id)
    Task.where(task_list_id: list_id, archived_at: nil).order(:position, :id).pluck(:id).each_with_index do |id, index|
      Task.where(id: id).update_all(position: index)
    end
  end
end
