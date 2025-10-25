import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './assets/main.css'
// PWA Registration
import { registerSW } from 'virtual:pwa-register'

const app = createApp(App)

app.config.devtools = true
app.use(createPinia())
app.use(router)

app.mount('#app')

// Register Service Worker
const updateSW = registerSW({
  onNeedRefresh() {
    console.log('New content available, please refresh.');
  },
  onOfflineReady() {
    console.log('App ready to work offline');
  },
})