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
        requiresGuest: true,
        title: 'Login'
      },
    },
    {
      path: '/:pathMatch(.*)*',
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
  if (authStore.loading) {
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
  } else if (to.meta.requiresGuest) {
    // Route requires guest (unauthenticated user)
    if (authStore.isAuthenticated) {
      // User is authenticated, redirect to home
      next({ name: 'home' })
    } else {
      // User is not authenticated, proceed
      next()
    }
  } else {
    // Route doesn't require specific auth state
    next()
  }
})

export default router
