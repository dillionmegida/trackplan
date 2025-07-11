import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
import Vue3Toastify from 'vue3-toastify'
import VueSelect from 'vue-select'
import VueEllipseProgress from 'vue-ellipse-progress'
import FloatingVue from 'floating-vue'
import 'floating-vue/dist/style.css'

import 'vue-select/dist/vue-select.css'
import 'vue3-toastify/dist/index.css'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import { queryClient } from './configs/react-query'
import { LoggerPlugin } from './services/logger/logger'

const app = createApp(App)

app.use(VueQueryPlugin, { queryClient })

app.use(createPinia())
app.use(router)
const authStore = useAuthStore()
authStore.init()

app.component('v-select', VueSelect)

app.use(VueEllipseProgress)
app.use(FloatingVue)
app.use(Vue3Toastify)
app.use(LoggerPlugin)
app.mount('#app')
