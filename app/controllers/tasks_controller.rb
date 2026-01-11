class TasksController < ApplicationController
  def index
    @task_lists = TaskList.includes(:tasks).order(:name)
    @backlog_task_count = @task_lists.sum { |list| list.tasks.size }
  end

  def update
    task = Task.find(params[:id])

    if task.update(task_params)
      render json: { id: task.id, task_list_id: task.task_list_id }
    else
      render json: { errors: task.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def task_params
    params.require(:task).permit(:task_list_id)
  end
end
