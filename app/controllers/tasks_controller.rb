class TasksController < ApplicationController
  def index
    @task_lists = TaskList.includes(:tasks).order(:name)
    @backlog_task_count = @task_lists.sum { |list| list.tasks.size }
  end
end
