import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/HomeView.vue'
import Login from '@/views/Login.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: { 
        requiresAuth: true,
        ssoCheck: true // 新增：需要SSO验证的标记
      }
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { 
        guestOnly: true,
        ssoRedirect: false // 明确不进行SSO跳转
      }
    }
  ]
})

router.beforeEach(async (to, from) => {
  const authStore = useAuthStore();
  // 初始化时检查URL中的SSO code（跨域回调处理）
  if (!authStore.initialized) {
    try {
      await authStore.handleSSOCallback();
    } catch (error) {
      console.error('SSO回调处理失败:', error);
      return { path: '/login' };
    }
  }

  // 需要认证但未登录
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    try {
      const refreshed = await authStore.silentRefresh();

      if (!refreshed) {
        if (to.meta.ssoCheck !== false) {
          await authStore.initiateSSOFlow(to.fullPath);
          return false; // 中断当前导航
        }
        
        return {
          path: '/login',
          query: { redirect: to.fullPath }
        };
      }
    } catch (error) {
      console.error('静默刷新Token失败:', error);
      return { path: '/login', query: { redirect: to.fullPath } };
    }
  }

  // // 已登录用户访问guestOnly页面
  // if (to.meta.guestOnly && authStore.isAuthenticated) {
  //   return from.meta.requiresAuth ? false : { path: '/' };
  // }

  // // 确保页面刷新后能获取最新用户信息
  // if (authStore.isAuthenticated && !authStore.user) {
  //   try {
  //     await authStore.fetchUserProfile();
  //   } catch (error) {
  //     console.error('获取用户信息失败:', error);
  //     authStore.logout();
  //     return { path: '/login' };
  //   }
  // }
});

// 全局后置钩子：清除SSO流程中的临时参数
router.afterEach((to) => {
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.has('code') || urlParams.has('state')) {
    window.history.replaceState({}, '', to.fullPath)
  }
})

export default router