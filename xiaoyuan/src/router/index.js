import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: (to) => {
      const userInfo = localStorage.getItem('userInfo');
      return userInfo ? '/home' : '/login';
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../components/Login.vue')
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../components/Home.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/secondhand-market',
    name: 'SecondhandMarket',
    component: () => import('../components/SecondhandMarket.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/secondhand-goods-detail/:id',
    name: 'SecondhandGoodsDetail',
    component: () => import('../components/SecondhandGoodsDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/notice',
    name: 'Notice',
    component: () => import('../components/Notice.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/food',
    name: 'Food',
    component: () => import('../components/Food.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/food-detail/:id',
    name: 'FoodDetail',
    component: () => import('../components/FoodDetail.vue'),
    meta: { requiresAuth: true }
  },

  {
    path: '/lost-and-found',
    name: 'LostAndFound',
    component: () => import('../components/LostAndFound.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/lost-and-found-detail/:id',
    name: 'LostAndFoundDetail',
    component: () => import('../components/LostAndFoundDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../components/Admin.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/orders',
    name: 'Orders',
    component: () => import('../components/OrderList.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)
  const userInfo = localStorage.getItem('userInfo')
  const isLoggedIn = !!userInfo
  const userRole = isLoggedIn ? JSON.parse(userInfo).role : null

  if (requiresAuth) {
    if (!isLoggedIn) {
      // 未登录，跳转到登录页
      next('/login')
    } else if (requiresAdmin && userRole !== 'admin') {
      // 需要管理员权限，但不是管理员
      alert('权限不足，需要管理员权限')
      next('/home')
    } else {
      // 已登录且权限满足
      next()
    }
  } else {
    // 不需要登录的页面
    next()
  }
})

export default router
