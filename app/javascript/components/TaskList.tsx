import { useQueryTaskListQuery, useToggleTaskArchivedMutation } from "../graphql/generated"
import { useState } from "react"

const TaskList = () => {
  const [archivedFilter, setArchivedFilter] = useState<"all" | "active" | "archived">("all")
  const archived =
    archivedFilter === "all" ? null : archivedFilter === "archived" ? true : false

  const { data, loading, error } = useQueryTaskListQuery({
    variables: { archived },
  })
  const [toggleTaskArchived, toggleTaskArchivedState] = useToggleTaskArchivedMutation()

  return (
    <div>
      <div className="flex items-center gap-3">
        <h1>Task List</h1>
        <label className="text-sm text-slate-500" htmlFor="archive-filter">
          Filter
        </label>
        <select
          id="archive-filter"
          className="rounded border border-slate-200 px-2 py-1 text-sm"
          value={archivedFilter}
          onChange={(event) => setArchivedFilter(event.target.value as typeof archivedFilter)}
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
      </div>
      {loading && <p>Loading...</p>}
      {error && <p>Failed to load tasks.</p>}
      {!loading && !error && (
        <ul>
          {(data?.tasks || []).map((task) => (
            <li key={task.id}>
              <button
                type="button"
                className={`text-left ${task.archivedAt ? "line-through text-slate-400" : ""}`}
                onClick={() => toggleTaskArchived({ variables: { id: task.id } })}
                disabled={toggleTaskArchivedState.loading}
              >
                {task.title}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default TaskList
