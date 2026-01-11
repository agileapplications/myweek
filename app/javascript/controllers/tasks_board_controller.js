import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [
    "modal",
    "modalTitle",
    "titleInput",
    "descriptionInput",
    "bigCheckbox",
    "error",
    "contextMenu",
    "contextUnplan"
  ]

  dragStart(event) {
    const taskId = event.currentTarget.dataset.taskId
    event.dataTransfer.setData("text/plain", taskId)
    event.dataTransfer.effectAllowed = "move"
    this.draggedElement = event.currentTarget
    this.draggedNextSibling = event.currentTarget.nextElementSibling
    this.draggedParent = event.currentTarget.parentElement
    this.dropHandled = false
    this.draggedCardType = event.currentTarget.dataset.cardType
    this.closeContextMenu()

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
      if (
        !this.dropHandled &&
        this.draggedParent &&
        this.draggedCardType === "backlog" &&
        this.draggedElement.parentElement !== this.draggedParent
      ) {
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
    this.draggedCardType = null
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
    if (this.hasModalTarget && !this.modalTarget.classList.contains("hidden")) {
      if (event.key === "Escape") {
        event.preventDefault()
        this.closeModal()
      }
      return
    }
    if (!this.hoveredCard) return
    if (this.draggedElement) return

    if (event.key === "c") {
      event.preventDefault()
      this.archiveHoveredCard()
      return
    }

    if (event.key === "e") {
      event.preventDefault()
      this.openEdit()
    }
  }

  openEditFromClick(event) {
    if (this.draggedElement) return
    event.preventDefault()
    this.hoveredCard = event.currentTarget
    this.openEdit()
  }

  openNew(event) {
    const listId = event.currentTarget.dataset.taskListId ||
      event.currentTarget.closest("[data-task-list-id]")?.dataset.taskListId
    this.activeListId = listId
    this.editingTaskId = null
    this.activeCard = null
    this.showModal("New Task")
  }

  openEdit() {
    const card = this.contextCard || this.hoveredCard
    if (!card) return
    this.editingTaskId = card.dataset.taskId
    this.activeListId = card.dataset.taskListId
    this.activeCard = card
    this.showModal(
      "Edit Task",
      card.dataset.taskTitle,
      card.dataset.taskDescription,
      card.dataset.taskBig === "true"
    )
  }

  showModal(title, taskTitle = "", taskDescription = "", isBig = false) {
    this.modalTarget.classList.remove("hidden")
    this.modalTarget.classList.add("flex")
    this.modalTitleTarget.textContent = title
    this.titleInputTarget.value = taskTitle
    this.descriptionInputTarget.value = taskDescription
    this.bigCheckboxTarget.checked = isBig
    this.errorTarget.classList.add("hidden")
    this.errorTarget.textContent = "Title is required."
    this.titleInputTarget.focus()
  }

  closeModal() {
    this.modalTarget.classList.add("hidden")
    this.modalTarget.classList.remove("flex")
    this.editingTaskId = null
    this.activeListId = null
    this.activeCard = null
    this.closeContextMenu()
  }

  submitForm(event) {
    event.preventDefault()
    const title = this.titleInputTarget.value.trim()
    const description = this.descriptionInputTarget.value.trim()
    const isBig = this.bigCheckboxTarget.checked
    if (!title) {
      this.errorTarget.classList.remove("hidden")
      this.titleInputTarget.focus()
      return
    }

    if (!this.editingTaskId && !this.activeListId) {
      this.errorTarget.textContent = "Select a list before creating a task."
      this.errorTarget.classList.remove("hidden")
      return
    }

    const token = document.querySelector("meta[name='csrf-token']").content
    const payload = { task: { title: title, description: description || null, big: isBig } }
    const request = this.editingTaskId
      ? { url: `/tasks/${this.editingTaskId}`, method: "PATCH" }
      : { url: "/tasks", method: "POST" }

    if (!this.editingTaskId) {
      payload.task.task_list_id = this.activeListId
    }

    fetch(request.url, {
      method: request.method,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-CSRF-Token": token
      },
      body: JSON.stringify(payload)
    }).then((response) => {
      if (!response.ok) {
        return response.json().then((data) => {
          throw new Error(data.errors?.[0] || "Failed to save task")
        })
      }
      return response.json()
    }).then((data) => {
      if (this.editingTaskId && this.activeCard) {
        this.applyCardUpdate(this.activeCard, data.title, data.description, data.big)
      } else {
        this.insertNewCard(data)
      }
      this.closeModal()
    }).catch((error) => {
      this.errorTarget.textContent = error.message || "Could not save task."
      this.errorTarget.classList.remove("hidden")
    })
  }

  applyCardUpdate(card, title, description, isBig) {
    const taskId = card.dataset.taskId
    const backlogCard = this.element.querySelector(`[data-task-id="${taskId}"][data-card-type="backlog"]`)
    const plannedCard = this.element.querySelector(`[data-task-id="${taskId}"][data-card-type="planned"]`)

    if (backlogCard) {
      const plannedAccent = !!backlogCard.dataset.taskPlanned
      this.updateCardContent(backlogCard, title, description, isBig, plannedAccent)
    }

    if (plannedCard) {
      this.updateCardContent(plannedCard, title, description, isBig, false)
    }
  }

  updateCardContent(card, title, description, isBig, plannedAccent = false) {
    card.dataset.taskTitle = title
    card.dataset.taskDescription = description || ""
    card.dataset.taskBig = isBig

    const titleSpan = card.querySelector("span")
    if (titleSpan) {
      titleSpan.textContent = title
    }

    this.syncBigStyles(card, isBig)
    this.syncDescriptionIcon(card, description, plannedAccent)
  }

  insertNewCard(data) {
    const listElement = this.element.querySelector(`[data-task-list-id="${data.task_list_id}"]`)
    if (!listElement) return
    const container = listElement.querySelector("[data-tasks-board-target='cards']")
    if (!container) return

    const card = this.buildCardElement(data)
    container.appendChild(card)
    this.adjustCount(data.task_list_id, 1)
  }

  buildCardElement(data) {
    const card = document.createElement("div")
    card.className = "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm cursor-grab active:cursor-grabbing"
    card.setAttribute("draggable", "true")
    card.dataset.cardType = "backlog"
    card.dataset.taskId = data.id
    card.dataset.taskListId = data.task_list_id
    card.dataset.taskTitle = data.title
    card.dataset.taskDescription = data.description || ""
    card.dataset.taskBig = data.big
    card.dataset.taskPlanned = data.planned || ""
    card.dataset.action = "dragstart->tasks-board#dragStart dragend->tasks-board#dragEnd mouseenter->tasks-board#hoverCard mouseleave->tasks-board#leaveCard click->tasks-board#openEditFromClick contextmenu->tasks-board#openContextMenu"
    if (data.big) {
      card.classList.add("task-card--big")
    }
    if (data.planned) {
      this.setBacklogPlannedStyles(card, true)
    }

    const wrapper = document.createElement("div")
    wrapper.className = "flex items-center justify-between gap-2"

    const titleSpan = document.createElement("span")
    titleSpan.textContent = data.title
    titleSpan.className = `task-title ${data.big ? "task-title--big" : ""}`.trim()

    wrapper.appendChild(titleSpan)
    if (data.description) {
      wrapper.appendChild(this.buildDescriptionIcon(!!data.planned))
    }

    card.appendChild(wrapper)
    return card
  }

  buildDescriptionIcon(plannedCard = false) {
    const icon = document.createElement("span")
    icon.className = plannedCard ? "text-emerald-400" : "text-slate-400"
    icon.setAttribute("aria-label", "Has description")
    icon.innerHTML = `
      <svg viewBox="0 0 20 20" class="h-4 w-4" fill="currentColor" aria-hidden="true">
        <path d="M6 4h8a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H9.414L6 17.414V4z" />
      </svg>
    `
    return icon
  }

  syncDescriptionIcon(card, description, plannedAccent = false) {
    const wrapper = card.firstElementChild
    if (!wrapper) return
    const existingIcon = wrapper.querySelector("span.text-slate-400")
    const existingPlannedIcon = wrapper.querySelector("span.text-emerald-400")

    if (description && !existingIcon && !existingPlannedIcon) {
      wrapper.appendChild(this.buildDescriptionIcon(plannedAccent))
      return
    }

    if (!description) {
      if (existingIcon) existingIcon.remove()
      if (existingPlannedIcon) existingPlannedIcon.remove()
      return
    }

    if (description) {
      const icon = existingIcon || existingPlannedIcon
      if (icon) {
        if (plannedAccent) {
          icon.classList.remove("text-slate-400")
          icon.classList.add("text-emerald-400")
        } else {
          icon.classList.remove("text-emerald-400")
          icon.classList.add("text-slate-400")
        }
      }
    }
  }

  syncBigStyles(card, isBig) {
    if (isBig) {
      card.classList.add("task-card--big")
    } else {
      card.classList.remove("task-card--big")
    }
    const titleSpan = card.querySelector(".task-title")
    if (titleSpan) {
      if (isBig) {
        titleSpan.classList.add("task-title--big")
      } else {
        titleSpan.classList.remove("task-title--big")
      }
    }
  }

  archiveHoveredCard() {
    const card = this.hoveredCard
    if (!card) return
    this.archiveCard(card)
  }

  archiveCard(card) {
    if (!card) return
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
      const plannedCard = this.element.querySelector(`[data-task-id="${taskId}"][data-card-type="planned"]`)
      if (plannedCard) {
        plannedCard.remove()
      }
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
    if (this.draggedCardType !== "backlog") {
      taskElement.classList.remove("hidden")
      return
    }

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

  allowDropWeek(event) {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }

  dragEnterWeek(event) {
    const column = event.currentTarget.closest("[data-planned]")
    if (!column) return
    const placeholder = column.querySelector("[data-tasks-board-target='placeholder']")
    if (placeholder) {
      placeholder.classList.remove("hidden")
    }
  }

  dragLeaveWeek(event) {
    const column = event.currentTarget.closest("[data-planned]")
    if (!column) return
    if (column.contains(event.relatedTarget)) return
    const placeholder = column.querySelector("[data-tasks-board-target='placeholder']")
    if (placeholder) {
      placeholder.classList.add("hidden")
    }
  }

  dropOnDay(event) {
    event.preventDefault()
    const taskId = event.dataTransfer.getData("text/plain")
    if (!taskId) return

    const column = event.currentTarget.closest("[data-planned]")
    if (!column) return
    const plannedValue = column.dataset.planned
    const placeholder = column.querySelector("[data-tasks-board-target='placeholder']")
    if (placeholder) {
      placeholder.classList.add("hidden")
    }

    const taskElement = this.element.querySelector(`[data-task-id="${taskId}"][data-card-type="backlog"]`)
    const previousPlanned = taskElement?.dataset.taskPlanned || null
    if (taskElement) {
      taskElement.classList.remove("hidden")
      taskElement.dataset.taskPlanned = plannedValue
      this.setBacklogPlannedStyles(taskElement, true)
    }

    this.dropHandled = true
    if (this.draggedCardType === "planned" && this.draggedElement) {
      this.draggedElement.classList.remove("hidden")
    }

    this.upsertPlannedCard(taskId, plannedValue)
    this.updatePlanned(taskId, plannedValue, previousPlanned)
  }

  upsertPlannedCard(taskId, plannedValue) {
    const column = this.element.querySelector(`[data-planned="${plannedValue}"]`)
    if (!column) return
    const container = column.querySelector("[data-tasks-board-target='weekCards']")
    if (!container) return

    let card = this.element.querySelector(`[data-task-id="${taskId}"][data-card-type="planned"]`)
    if (card) {
      card.dataset.taskPlanned = plannedValue
      container.appendChild(card)
      return
    }

    const backlogCard = this.element.querySelector(`[data-task-id="${taskId}"][data-card-type="backlog"]`)
    if (!backlogCard) return

    card = this.buildPlannedCardFromBacklog(backlogCard)
    container.appendChild(card)
  }

  buildPlannedCardFromBacklog(backlogCard) {
    const card = backlogCard.cloneNode(true)
    card.dataset.cardType = "planned"
    card.dataset.taskPlanned = backlogCard.dataset.taskPlanned || ""
    this.setBacklogPlannedStyles(card, false)
    const icon = card.querySelector("span.text-emerald-400")
    if (icon) {
      icon.classList.remove("text-emerald-400")
      icon.classList.add("text-slate-400")
    }
    return card
  }

  updatePlanned(taskId, plannedValue, previousPlanned = null) {
    const token = document.querySelector("meta[name='csrf-token']").content
    fetch(`/tasks/${taskId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-CSRF-Token": token
      },
      body: JSON.stringify({ task: { planned: plannedValue } })
    }).then((response) => {
      if (!response.ok) throw new Error("Failed to update planned day")
    }).catch(() => {
      const backlogCard = this.element.querySelector(`[data-task-id="${taskId}"][data-card-type="backlog"]`)
      if (backlogCard) {
        if (previousPlanned) {
          backlogCard.dataset.taskPlanned = previousPlanned
          this.setBacklogPlannedStyles(backlogCard, true)
        } else {
          backlogCard.dataset.taskPlanned = ""
          this.setBacklogPlannedStyles(backlogCard, false)
        }
      }
      const plannedCard = this.element.querySelector(`[data-task-id="${taskId}"][data-card-type="planned"]`)
      if (plannedCard) {
        if (previousPlanned) {
          this.upsertPlannedCard(taskId, previousPlanned)
        } else {
          plannedCard.remove()
        }
      }
    })
  }

  unplanCard(card) {
    const taskId = card.dataset.taskId
    const previousPlanned = card.dataset.taskPlanned || null
    const backlogCard = this.element.querySelector(`[data-task-id="${taskId}"][data-card-type="backlog"]`)
    if (backlogCard) {
      backlogCard.dataset.taskPlanned = ""
      this.setBacklogPlannedStyles(backlogCard, false)
    }
    const plannedCard = this.element.querySelector(`[data-task-id="${taskId}"][data-card-type="planned"]`)
    if (plannedCard) {
      plannedCard.remove()
    }
    this.updatePlanned(taskId, null, previousPlanned)
  }

  setBacklogPlannedStyles(card, planned) {
    const plannedClasses = ["!bg-emerald-50", "!border-emerald-200", "hover:!border-emerald-300"]
    if (planned) {
      card.classList.add(...plannedClasses)
    } else {
      card.classList.remove(...plannedClasses)
    }

    const icon = card.querySelector("span.text-slate-400, span.text-emerald-400")
    if (icon) {
      if (planned) {
        icon.classList.remove("text-slate-400")
        icon.classList.add("text-emerald-400")
      } else {
        icon.classList.remove("text-emerald-400")
        icon.classList.add("text-slate-400")
      }
    }
  }

  openContextMenu(event) {
    event.preventDefault()
    event.stopPropagation()
    if (this.draggedElement) return
    this.contextCard = event.currentTarget
    this.closeContextMenu()
    if (this.hasContextUnplanTarget) {
      const planned = this.contextCard?.dataset.taskPlanned
      if (planned) {
        this.contextUnplanTarget.classList.remove("hidden")
      } else {
        this.contextUnplanTarget.classList.add("hidden")
      }
    }
    const menu = this.contextMenuTarget
    menu.style.left = `${event.clientX + 8}px`
    menu.style.top = `${event.clientY + 8}px`
    menu.classList.remove("hidden")
    setTimeout(() => {
      document.addEventListener("click", this.boundCloseContextMenu)
      document.addEventListener("contextmenu", this.boundCloseContextMenu)
    }, 0)
  }

  contextEdit(event) {
    event.preventDefault()
    const card = this.contextCard
    this.closeContextMenu()
    if (card) {
      this.contextCard = card
    }
    this.openEdit()
    this.contextCard = null
  }

  contextArchive(event) {
    event.preventDefault()
    const card = this.contextCard
    this.closeContextMenu()
    if (card) {
      this.archiveCard(card)
    } else {
      this.archiveHoveredCard()
    }
    this.contextCard = null
  }

  contextUnplan(event) {
    event.preventDefault()
    const card = this.contextCard
    this.closeContextMenu()
    if (!card) return
    this.unplanCard(card)
    this.contextCard = null
  }

  closeContextMenu() {
    if (!this.hasContextMenuTarget) return
    this.contextMenuTarget.classList.add("hidden")
    document.removeEventListener("click", this.boundCloseContextMenu)
    document.removeEventListener("contextmenu", this.boundCloseContextMenu)
  }

  boundCloseContextMenu = () => {
    this.closeContextMenu()
  }

  clearPlaceholders() {
    this.element.querySelectorAll("[data-tasks-board-target='placeholder']").forEach((placeholder) => {
      placeholder.classList.add("hidden")
    })
  }
}
