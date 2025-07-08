import './assets/main.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js' 
// bootstrap icons
import 'bootstrap-icons/font/bootstrap-icons.css'

import { VueFire, VueFireAuth } from 'vuefire'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { firebaseApp } from './firebase'
import router from './router'
import { useAuthStore } from './stores/auth'


const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(VueFire, {
  firebaseApp,
  modules: [
    VueFireAuth(),
  ]
})


const authStore = useAuthStore()
authStore.initializeAuth().then(() => {
  console.log('Auth initialized:', authStore.getUser)
}).catch((error) => {
  console.error('Error initializing auth:', error)
});


app.mount('#app')
