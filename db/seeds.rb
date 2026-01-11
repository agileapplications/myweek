# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
Task.delete_all
TaskList.delete_all

list_names = [
  "Admin",
  "Product",
  "Bugs",
  "Content",
  "Marketing",
  "Hiring",
  "Ops",
  "Finance",
  "Research",
  "Personal"
]

verbs = ["Draft", "Review", "Plan", "Fix", "Design", "Outline", "Update", "Verify", "Prepare", "Ship"]
nouns = ["report", "landing page", "spec", "brief", "workflow", "dashboard", "release", "email", "audit", "proposal"]

rng = Random.new(1234)

list_names.each do |name|
  list = TaskList.create!(name: name)
  task_count = rng.rand(2..10)
  task_count.times do |index|
    title = "#{verbs.sample(random: rng)} #{nouns.sample(random: rng)} ##{index + 1}"
    description = rng.rand < 0.35 ? "Notes for #{title.downcase}." : nil
    list.tasks.create!(title: title, description: description, position: index)
  end
end
