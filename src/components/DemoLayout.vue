<script setup lang="ts">
import { LINKS } from '@/constants/links'
import LogoutIcon from '@/components/icons/LogoutIcon.vue'
import { RouterLink } from 'vue-router'
import { demoUser } from '@/constants/demoUser'
</script>

<template>
  <div class="layout">
    <header class="header">
      <div class="container">
        <RouterLink :to="LINKS.demo" class="logo">
          <img src="/logo-dark.png" alt="TrackPlan" />
        </RouterLink>
        <div class="user-menu">
          <div class="user-info">
            <img :src="demoUser.photoURL" :alt="demoUser.name" class="user-avatar" />
          </div>
          <RouterLink :to="LINKS.landing" class="logout-button">
            <LogoutIcon :size="20" :color="'currentColor'" />
            <span>Leave Demo</span>
          </RouterLink>
        </div>
      </div>
    </header>
    <main class="main-content">
      <slot></slot>
    </main>
  </div>
</template>

<style lang="scss" scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8fafc;
}

.header {
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 10;

  .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
  }
}

.active-organization {
  font-size: 0.8rem;
  height: 20px;
  &.container {
    padding-block: 0.2rem;
  }

  .active-organization-label {
    background-color: #9ca3af;
    color: white;
    padding: 0.2rem 0.5rem;
  }

  .active-organization-text {
    background-color: #1e293b;
    color: white;
    padding: 0.2rem 0.5rem;
  }
}

.logo {
  font-size: 1.75rem;
  font-weight: 800;
  color: #3b82f6;

  img {
    width: 2rem;
  }
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;

  img {
    transition: transform 0.2s ease;
  }

  &:hover {
    img {
      transform: scale(1.1);
    }
  }
}

.logout-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 0.4rem 0.75rem;
  font-size: 0.85rem;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.logout-button:hover {
  background-color: #f1f5f9;
  color: #3b82f6;
  border-color: #cbd5e1;
}

.logout-button svg {
  width: 16px;
  height: 16px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e2e8f0;
}

.main-content {
}

@media (max-width: 768px) {
  .logout-button span {
    display: none;
  }

  .logout-button {
    padding: 0.4rem;
    border-radius: 50%;
  }
}
</style>