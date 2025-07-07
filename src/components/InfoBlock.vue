<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'info' | 'warning' | 'error'
  title?: string
  message: string
  icon?: string
}

const props = defineProps<Props>()

const variant = computed(() => props.variant || 'info')

const iconColor = computed(() => {
  switch (variant.value) {
    case 'info':
      return '#3b82f6'
    case 'warning':
      return '#f59e0b'
    case 'error':
      return '#ef4444'
    default:
      return '#3b82f6'
  }
})
</script>

<template>
  <div
    :class="[
      'info-block',
      `variant-${variant}`,
      { 'has-icon': icon },
      { 'has-title': title }
    ]"
  >
    <div class="icon-wrapper" v-if="icon">
      <component :is="icon" :size="20" :color="iconColor" />
    </div>
    <div class="content">
      <div class="title" v-if="title">{{ title }}</div>
      <div class="message">{{ message }}</div>
    </div>
    <div class="action" v-if="$slots.action">
      <slot name="action"></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.info-block {
  display: flex;
  align-items: flex-start;
  padding: 0.5rem 1rem;
  border-radius: 0.75rem;
  background: white;
  border: 1px solid #e2e8f0;
  margin-bottom: 1rem;
  font-size: 0.9rem;

  &.variant-info {
    border-color: #bfdbfe;
    .icon-wrapper svg path {
      stroke: #3b82f6;
    }
  }

  &.variant-warning {
    border-color: #fef3c7;
    .icon-wrapper svg path {
      stroke: #f59e0b;
    }
  }

  &.variant-error {
    border-color: #fee2e2;
    .icon-wrapper svg path {
      stroke: #ef4444;
    }
  }

  .icon-wrapper {
    display: flex;
    align-items: center;
    margin-right: 1rem;
    min-width: 24px;
  }

  .content {
    flex: 1;
    display: flex;
    flex-direction: column;

    .title {
      font-weight: 500;
      color: #475569;
      margin-bottom: 0.25rem;
    }

    .message {
      color: #64748b;
      line-height: 1.5;
    }
  }

  .action {
    margin-left: 1rem;
    display: flex;
    align-items: center;
  }
}
</style>