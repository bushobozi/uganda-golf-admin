import { createRouter, createWebHistory } from 'vue-router'
import Error404 from '@/views/Error404.vue'
import HomeView from '@/views/HomeView.vue'
import Login from '@/views/auth/Login.vue'
import { useAuthStore } from '@/stores/auth'


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

// Global navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Initialize auth if not already done
  if (authStore.isLoading) {
    await authStore.initializeAuth()
  }
  
  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    if (authStore.isAuthenticated) {
      // User is authenticated, proceed
      next()
    } else {
      // User is not authenticated, redirect to login
      next({ 
        name: 'login', 
        query: { redirect: to.fullPath } 
      })
    }
  } else {
    // Route doesn't require auth
    if (to.name === 'login' && authStore.isAuthenticated) {
      // User is already authenticated, redirect to home
      next({ name: 'home' })
    } else {
      // Proceed normally
      next()
    }
  }
})

export default router
