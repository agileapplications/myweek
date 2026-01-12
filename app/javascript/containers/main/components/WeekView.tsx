import type { MouseEvent } from "react"
import WeekColumn from "./WeekColumn"
import type { Task } from "../../../graphql/generated"

type Day = {
  key: string
  label: string
}

type WeekViewProps = {
  days: Day[]
  plannedByDay: Record<string, Task[]>
  onTaskClick: (taskId: string) => void
  onTaskContextMenu: (taskId: string, event: MouseEvent) => void
  onTaskHover: (taskId: string | null) => void
}

const WeekView = ({ days, plannedByDay, onTaskClick, onTaskContextMenu, onTaskHover }: WeekViewProps) => {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 flex-1">
      {days.map((day) => (
        <WeekColumn
          key={day.key}
          plannedKey={day.key}
          label={day.label}
          tasks={plannedByDay[day.key] || []}
          onTaskClick={onTaskClick}
          onTaskContextMenu={onTaskContextMenu}
          onTaskHover={onTaskHover}
        />
      ))}
    </section>
  )
}

export default WeekView
