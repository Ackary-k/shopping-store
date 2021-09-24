import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '@/components/Login.vue'

Vue.use(VueRouter)

// { path: '/login', component: () => { return import ('@/components/Login.vue') }
const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    redirect: '/welcome',
    component: () => { return import('@/components/Home.vue') },
    children: [
      { path: '/welcome', component: () => { return import('@/components/Welcome.vue') } },
      { path: '/users', component: () => { return import('@/components/user/Users.vue') } }
    ]
  }

]

const router = new VueRouter({
  routes
})

// 添加路由守卫
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()

  const token = window.sessionStorage.getItem('token')
  if (!token) return next('/login')
  next()
})

export default router
