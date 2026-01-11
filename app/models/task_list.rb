class TaskList < ApplicationRecord
  has_many :tasks, -> { order(:position, :id) }, dependent: :destroy

  validates :name, presence: true
end
