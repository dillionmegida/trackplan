import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
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
