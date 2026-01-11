class AddPlannedToTasks < ActiveRecord::Migration[8.1]
  def change
    add_column :tasks, :planned, :string
    add_index :tasks, :planned
  end
end
