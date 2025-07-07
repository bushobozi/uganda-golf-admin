import { createRouter, createWebHistory } from 'vue-router'
import Error404 from '@/views/Error404.vue'
import HomeView from '@/views/HomeView.vue'
import Login from '@/views/auth/Login.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,  
      meta: {
        title: 'Home',
        requiresAuth: true
      }  
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: {
        title: 'Login',
        requiresAuth: false
      }
    },
    {
      path: '/:catchAll(.*)',
      name: '404',
      component: Error404
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

export default router
