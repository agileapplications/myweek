class SubTasksController < ApplicationController
  def create
    task = Task.find_by(id: sub_task_params[:task_id])
    unless task
      render json: { errors: ["Task not found"] }, status: :unprocessable_entity
      return
    end

    sub_task = task.sub_tasks.new(sub_task_params.except(:task_id))

    if sub_task.save
      render json: {
        id: sub_task.id,
        task_id: sub_task.task_id,
        title: sub_task.title,
        completed: sub_task.completed
      }
    else
      render json: { errors: sub_task.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    sub_task = SubTask.find(params[:id])

    if sub_task.update(sub_task_params.except(:task_id))
      render json: {
        id: sub_task.id,
        task_id: sub_task.task_id,
        title: sub_task.title,
        completed: sub_task.completed
      }
    else
      render json: { errors: sub_task.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    sub_task = SubTask.find(params[:id])
    sub_task.destroy
    render json: { id: sub_task.id }
  end

  private

  def sub_task_params
    params.require(:sub_task).permit(:task_id, :title, :completed)
  end
end
