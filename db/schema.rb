# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2025_01_01_000007) do
  create_table "sub_tasks", force: :cascade do |t|
    t.boolean "completed", default: false, null: false
    t.datetime "created_at", null: false
    t.integer "task_id", null: false
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.index ["task_id"], name: "index_sub_tasks_on_task_id"
  end

  create_table "task_lists", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.datetime "updated_at", null: false
  end

  create_table "tasks", force: :cascade do |t|
    t.datetime "archived_at"
    t.boolean "big", default: false, null: false
    t.datetime "created_at", null: false
    t.text "description"
    t.string "planned"
    t.integer "position", default: 0, null: false
    t.integer "task_list_id", null: false
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.index ["archived_at"], name: "index_tasks_on_archived_at"
    t.index ["planned"], name: "index_tasks_on_planned"
    t.index ["task_list_id", "position"], name: "index_tasks_on_task_list_id_and_position"
    t.index ["task_list_id"], name: "index_tasks_on_task_list_id"
  end

  add_foreign_key "sub_tasks", "tasks"
  add_foreign_key "tasks", "task_lists"
end
