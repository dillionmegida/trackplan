import { ref } from "vue"

class DraggableChecklist {
  private dragging: boolean
  private idPrefix: string
  private dragOverCategory = ref<string | null>(null)

  constructor(idPrefix: string) {
    this.dragging = false
    this.idPrefix = idPrefix
    this.dragOverCategory.value = null
  }

  start(event: DragEvent) {
    this.dragging = true
    const target = event.target as HTMLElement

    if (!target.id || !event.dataTransfer) return

    event.dataTransfer.setData('text/plain', target.id.replace(this.idPrefix, ''))
    event.dataTransfer.effectAllowed = 'move'
  }

  over(event: DragEvent) {
    event.preventDefault()
    const target = event.target as HTMLElement

    if (!target.id || !event.dataTransfer) return

    this.dragOverCategory.value = target.id

    event.dataTransfer.dropEffect = 'move'
  }

  end() {
    this.dragging = false
    this.dragOverCategory.value = null
  }

  drop(event: DragEvent) {
    if (!event.dataTransfer || !this.dragOverCategory.value) return

    const checklistId = event.dataTransfer.getData('text/plain')

    return {
      checklistId,
    }
  }

  getDragging() {
    return this.dragging
  }

  getDragOverCategory() {
    return this.dragOverCategory.value;
  }
}

export default DraggableChecklist
