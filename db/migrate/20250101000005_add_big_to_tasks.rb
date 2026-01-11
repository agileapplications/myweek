class AddBigToTasks < ActiveRecord::Migration[8.1]
  def change
    add_column :tasks, :big, :boolean, default: false, null: false
  end
end
