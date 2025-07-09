<script setup lang="ts">
import { auth, provider } from '@/configs/firebase'
import { LINKS } from '@/constants/links'
import { onAuthStateChanged, signInWithPopup } from 'firebase/auth'
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isLoading = ref(false)
const error = ref('')

const login = async () => {
  try {
    isLoading.value = true
    error.value = ''
    await signInWithPopup(auth, provider)
    router.push(LINKS.home)
  } catch (err) {
    console.error('Login failed:', err)
    error.value = 'Failed to sign in. Please try again.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      router.push(LINKS.home)
    } else {
      console.log('No user is signed in')
    }
  })

  onUnmounted(() => unsubscribe())
})
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <div class="logo">
        <img src="/logo-dark.png" alt="Trackplan Logo" />
      </div>
      <h1>Trackplan</h1>
      <p class="subtitle">We use Google to authenticate users</p>

      <button @click="login" :disabled="isLoading" class="google-btn">
        <span class="google-btn-text" v-if="!isLoading">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Sign in with Google
        </span>
        <span v-else>Signing in...</span>
      </button>

      <p v-if="error" class="error-message">{{ error }}</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  background: linear-gradient(135deg, #f6f9fc 0%, #f1f5f9 100%);
  padding: 6rem 1.5rem 1.5rem;
}

.login-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  padding: 2.5rem;
  width: 100%;
  max-width: 420px;
  text-align: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  }
}

.logo {
  margin-bottom: 1.75rem;

  img {
    width: 50px;
    margin: 0 auto;
  }
}

h1 {
  color: #1a1a1a;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  letter-spacing: -0.5px;
  background: linear-gradient(90deg, #2563eb, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  color: #64748b;
  font-size: 1.05rem;
  margin-bottom: 2.25rem;
  font-weight: 400;
  line-height: 1.5;
}

.google-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  padding: 0.875rem 1.5rem;
  background: #ffffff;
  color: #3c4043;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  z-index: 1;

  .google-btn-text {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, rgba(66, 133, 244, 0.1) 0%, rgba(255, 255, 255, 0) 100%);
    opacity: 0;
    transition: opacity 0.2s ease;
    z-index: -1;
  }

  &:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

    &::before {
      opacity: 1;
    }
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none !important;
  }

  svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }
}

.error-message {
  margin-top: 1.5rem;
  color: #dc2626;
  font-size: 0.9rem;
  background-color: #fef2f2;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  border-left: 3px solid #dc2626;
  animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .login-card {
    padding: 2rem 1.5rem;
  }

  h1 {
    font-size: 1.75rem;
  }

  .subtitle {
    font-size: 1rem;
    margin-bottom: 2rem;
  }
}
</style>