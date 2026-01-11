class CreateTaskLists < ActiveRecord::Migration[8.1]
  def change
    create_table :task_lists do |t|
      t.string :name, null: false

      t.timestamps
    end
  end
end
