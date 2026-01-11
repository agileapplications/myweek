import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  dragStart(event) {
    const taskId = event.currentTarget.dataset.taskId
    event.dataTransfer.setData("text/plain", taskId)
    event.dataTransfer.effectAllowed = "move"
    this.draggedElement = event.currentTarget
    this.draggedNextSibling = event.currentTarget.nextElementSibling
    this.draggedParent = event.currentTarget.parentElement
    this.dropHandled = false

    setTimeout(() => {
      if (this.draggedElement) {
        this.draggedElement.classList.add("hidden")
      }
    }, 0)
  }

  dragEnd() {
    this.clearPlaceholders()
    if (this.draggedElement) {
      this.draggedElement.classList.remove("hidden")
      if (!this.dropHandled && this.draggedParent && this.draggedElement.parentElement !== this.draggedParent) {
        if (this.draggedNextSibling && this.draggedNextSibling.parentElement === this.draggedParent) {
          this.draggedParent.insertBefore(this.draggedElement, this.draggedNextSibling)
        } else {
          this.draggedParent.appendChild(this.draggedElement)
        }
      }
    }
    this.draggedElement = null
    this.draggedNextSibling = null
    this.draggedParent = null
    this.dropHandled = false
  }

  hoverCard(event) {
    this.hoveredCard = event.currentTarget
  }

  leaveCard(event) {
    if (this.hoveredCard === event.currentTarget) {
      this.hoveredCard = null
    }
  }

  keyDown(event) {
    if (event.key !== "c") return
    if (!this.hoveredCard) return
    if (this.draggedElement) return

    const card = this.hoveredCard
    const taskId = card.dataset.taskId
    const listId = card.dataset.taskListId
    const parent = card.parentElement
    const nextSibling = card.nextElementSibling

    card.classList.add("hidden")
    this.adjustCount(listId, -1)

    const token = document.querySelector("meta[name='csrf-token']").content
    fetch(`/tasks/${taskId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-CSRF-Token": token
      },
      body: JSON.stringify({ task: { archived_at: new Date().toISOString() } })
    }).then((response) => {
      if (!response.ok) throw new Error("Failed to archive task")
      card.remove()
      this.hoveredCard = null
    }).catch(() => {
      card.classList.remove("hidden")
      if (parent) {
        if (nextSibling && nextSibling.parentElement === parent) {
          parent.insertBefore(card, nextSibling)
        } else {
          parent.appendChild(card)
        }
      }
      this.adjustCount(listId, 1)
    })
  }

  allowDrop(event) {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
    this.positionPlaceholder(event)
  }

  dragEnter(event) {
    const listElement = event.currentTarget.closest("[data-task-list-id]")
    if (!listElement) return
    const placeholder = listElement.querySelector("[data-tasks-board-target='placeholder']")
    if (placeholder) {
      placeholder.classList.remove("hidden")
    }
  }

  dragLeave(event) {
    const listElement = event.currentTarget.closest("[data-task-list-id]")
    if (!listElement) return
    if (listElement.contains(event.relatedTarget)) return
    const placeholder = listElement.querySelector("[data-tasks-board-target='placeholder']")
    if (placeholder) {
      placeholder.classList.add("hidden")
    }
  }

  drop(event) {
    event.preventDefault()
    const taskId = event.dataTransfer.getData("text/plain")
    if (!taskId) return

    const listElement = event.currentTarget.closest("[data-task-list-id]")
    if (!listElement) return
    this.dropHandled = true
    const placeholder = listElement.querySelector("[data-tasks-board-target='placeholder']")
    if (placeholder) {
      placeholder.classList.add("hidden")
    }

    const taskElement = this.element.querySelector(`[data-task-id="${taskId}"]`)
    if (!taskElement) return

    const previousListId = taskElement.dataset.taskListId
    const targetListId = listElement.dataset.taskListId

    const previousContainer = taskElement.parentElement
    const targetContainer = listElement.querySelector("[data-tasks-board-target='cards']")
    if (!targetContainer) return

    if (placeholder && placeholder.parentElement === targetContainer) {
      targetContainer.insertBefore(taskElement, placeholder)
    } else {
      targetContainer.appendChild(taskElement)
    }

    const targetPosition = Array.from(targetContainer.querySelectorAll("[data-task-id]")).indexOf(taskElement)
    taskElement.dataset.taskListId = targetListId
    taskElement.classList.remove("hidden")

    if (previousListId !== targetListId) {
      this.updateCounts(previousListId, targetListId, 1)
    }

    this.updateTask(
      taskId,
      targetListId,
      targetPosition,
      taskElement,
      previousContainer,
      previousListId,
      this.draggedNextSibling
    )
  }

  positionPlaceholder(event) {
    const listElement = event.currentTarget.closest("[data-task-list-id]")
    if (!listElement) return

    const container = listElement.querySelector("[data-tasks-board-target='cards']")
    const placeholder = listElement.querySelector("[data-tasks-board-target='placeholder']")
    if (!container || !placeholder) return

    placeholder.classList.remove("hidden")

    const cards = Array.from(container.querySelectorAll("[data-task-id]")).filter(
      (card) => card !== this.draggedElement
    )
    const y = event.clientY
    let insertBefore = null

    for (const card of cards) {
      const rect = card.getBoundingClientRect()
      if (y < rect.top + rect.height / 2) {
        insertBefore = card
        break
      }
    }

    if (insertBefore) {
      container.insertBefore(placeholder, insertBefore)
    } else {
      container.appendChild(placeholder)
    }
  }

  updateCounts(previousListId, targetListId, delta) {
    const previousCount = this.findCountElement(previousListId)
    const targetCount = this.findCountElement(targetListId)

    if (previousCount) {
      this.setCount(previousCount, this.readCount(previousCount) - delta)
    }

    if (targetCount && previousListId !== targetListId) {
      this.setCount(targetCount, this.readCount(targetCount) + delta)
    }
  }

  adjustCount(listId, delta) {
    const count = this.findCountElement(listId)
    if (count) {
      this.setCount(count, this.readCount(count) + delta)
    }
  }

  findCountElement(listId) {
    return this.element.querySelector(`[data-task-list-id="${listId}"] [data-tasks-board-target="count"]`)
  }

  readCount(element) {
    return Number(element.dataset.taskCount || 0)
  }

  setCount(element, count) {
    const safeCount = Math.max(0, count)
    element.dataset.taskCount = safeCount
    element.textContent = `${safeCount} ${safeCount === 1 ? "task" : "tasks"}`
  }

  updateTask(taskId, targetListId, targetPosition, taskElement, previousContainer, previousListId, previousNextSibling) {
    const token = document.querySelector("meta[name='csrf-token']").content

    fetch(`/tasks/${taskId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-CSRF-Token": token
      },
      body: JSON.stringify({ task: { task_list_id: targetListId, position: targetPosition } })
    }).then((response) => {
      if (!response.ok) throw new Error("Failed to update task list")
    }).catch(() => {
      if (previousContainer) {
        if (previousNextSibling && previousNextSibling.parentElement === previousContainer) {
          previousContainer.insertBefore(taskElement, previousNextSibling)
        } else {
          previousContainer.appendChild(taskElement)
        }
      }
      taskElement.dataset.taskListId = previousListId
      taskElement.classList.remove("hidden")
      if (previousListId !== targetListId) {
        this.updateCounts(targetListId, previousListId, 1)
      }
    })
  }

  clearPlaceholders() {
    this.element.querySelectorAll("[data-tasks-board-target='placeholder']").forEach((placeholder) => {
      placeholder.classList.add("hidden")
    })
  }
}
