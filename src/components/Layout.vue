<script setup lang="ts">
import { signOut } from 'firebase/auth'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { auth } from '@/configs/firebase'
import { LINKS } from '@/constants/links'
import { toast } from 'vue3-toastify'
import LogoutIcon from '@/components/icons/LogoutIcon.vue'

const router = useRouter()
const authStore = useAuthStore()
const user = authStore.user

const handleLogout = async () => {
  try {
    await signOut(auth)
    router.push(LINKS.login)
  } catch (error) {
    console.error('Error signing out:', error)
    toast.error('Failed to sign out. Please try again.')
  }
}
</script>

<template>
  <div class="layout">
    <header class="header">
      <div class="container">
        <RouterLink to="/" class="logo">🗓️</RouterLink>
        <div class="user-menu">
          <div class="user-info">
            <img
              v-if="user?.photoURL"
              :src="user.photoURL"
              :alt="user.displayName"
              class="user-avatar"
            />
            <div v-else class="avatar-placeholder">
              {{ user.displayName.charAt(0).toUpperCase() }}
            </div>
            <button @click="handleLogout" class="logout-button">
              <LogoutIcon :size="20" :color="'currentColor'" />
              <span>Logout</span>
            </button>
          </div>
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

.logo {
  font-size: 1.75rem;
  font-weight: 800;
  color: #3b82f6;
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
}

.user-name {
  font-weight: 500;
  color: #1e293b;
  font-size: 0.95rem;
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

.avatar-placeholder {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
}

.main-content {
}

@media (max-width: 768px) {
  /* .header {
    padding: 1rem;
  } */

  .user-name {
    display: none;
  }

  .logout-button span {
    display: none;
  }

  .logout-button {
    padding: 0.4rem;
    border-radius: 50%;
  }
}
</style>