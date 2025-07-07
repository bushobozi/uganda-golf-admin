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


const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(VueFire, {
  firebaseApp,
  modules: [
    VueFireAuth(),
  ]
})

app.mount('#app')
