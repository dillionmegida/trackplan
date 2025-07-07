import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import OnboardingView from '../views/OnboardingView.vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { LINKS } from '@/constants/links'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: LINKS.home,
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: LINKS.onboarding,
      name: 'onboarding',
      component: OnboardingView,
      meta: { requiresAuth: true },
    },
    {
      path: LINKS.login,
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false },
    },
  ],
})

router.beforeEach((to, _, next) => {
  const auth = getAuth()
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

  onAuthStateChanged(auth, (user) => {
    if (requiresAuth && !user) {
      next({ name: 'login' })
    } else {
      next()
    }
  })
})

export default router
