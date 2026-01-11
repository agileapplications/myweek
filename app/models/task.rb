class Task < ApplicationRecord
  belongs_to :task_list

  validates :title, presence: true
  validates :position, numericality: { greater_than_or_equal_to: 0 }
end
