import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
import Vue3Toastify from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import { queryClient } from './configs/react-query'

const app = createApp(App)

app.use(VueQueryPlugin, { queryClient })

app.use(createPinia())
app.use(router)
const authStore = useAuthStore()
authStore.init()

app.use(Vue3Toastify)

app.mount('#app')
