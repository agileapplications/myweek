class AddArchivedAtToTasks < ActiveRecord::Migration[8.1]
  def change
    add_column :tasks, :archived_at, :datetime
    add_index :tasks, :archived_at
  end
end
