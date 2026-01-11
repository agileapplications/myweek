class Task < ApplicationRecord
  PLANNED_OPTIONS = %w[
    monday
    tuesday
    wednesday
    thursday
    friday
    weekend
    next_week
  ].freeze

  belongs_to :task_list
  has_many :sub_tasks, dependent: :destroy

  validates :title, presence: true
  validates :position, numericality: { greater_than_or_equal_to: 0 }
  validates :planned, inclusion: { in: PLANNED_OPTIONS }, allow_nil: true
end
