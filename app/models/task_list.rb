class TaskList < ApplicationRecord
  has_many :tasks, -> { where(archived_at: nil).order(:position, :id) }, dependent: :destroy

  validates :name, presence: true
end
