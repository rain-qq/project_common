// stores/auth.js
import { defineStore } from 'pinia';
import axios from 'axios';
import { exchangeCodeForToken, login, logout, refreshToken, ssoCheck, verifyToken } from '../api/auth';

const SSO_SERVER = 'http://localhost:3000';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    accessToken: localStorage.getItem('accessToken') || null,
    initialized: false
  }),
  getters: {
    isAuthenticated: (state) => !!state.accessToken
  },
  actions: {
    async handleLogin (credentials) {
      try {
        const response = await login(credentials);
        if (response.success) {
          this.setAuth(response.user, response.accessToken);
          return { success: true };
        }
        return { success: false, message: response.message };
      } catch (error) {
        return { success: false, message: error.message };
      }
    },
    // 处理SSO回调（新增）
    async handleSSOCallback() {
      try {
        // 1. 解析URL中的code参数
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        
        if (!code) {
          this.initialized = true
          return
        }

        // 2. 用code换取Access Token
        const { accessToken } = await exchangeCodeForToken(code)
        
        // 3. 存储Token并标记初始化完成
        this.accessToken = accessToken
        localStorage.setItem('accessToken', accessToken)
        
        // 4. 清理URL参数（可选）
        window.history.replaceState({}, '', window.location.pathname)

      } catch (error) {
        console.error('SSO回调处理失败:', error)
      } finally {
        this.initialized = true
      }
    },
    // 静默刷新Token（新增）
    async silentRefresh() {
      try {
        return await this.refreshToken();
      } catch {
        this.logout();
        return false;
      }
    },
    // 启动SSO流程
    async initiateSSOFlow(redirectTo) {
      try {
        const response = await axios.get(`${SSO_SERVER}/sso/check`, {
          params: { redirect: redirectTo },
          withCredentials: true // 确保携带cookie
        });

        if (response.data.success) {
          // 成功获取code，重定向到前端指定的redirect地址并附带code参数
          window.location.href = `${response.data.redirect}?code=${response.data.code}`;
        } else {
          // 处理错误，如显示错误信息或跳转到登录页面
          console.error(response.data.message);
          window.location.href = '/login';
        }
      } catch (error) {
        console.error('SSO检查失败:', error.response ? error.response.data : error.message);
        window.location.href = '/login';
      }
    },
    // 统一登录方法
    async login(credentials) {
      const res = await axios.post(`${SSO_SERVER}/api/login`, credentials);
      this.setAuth(res.data.user, res.data.accessToken);
    },

    // 统一设置认证状态
    setAuth(user, token) {
      this.user = user;
      this.accessToken = token;
      localStorage.setItem('accessToken', token);
    },

    // 静默检查登录状态（关键！）
    async checkAuth() {
      if (!this.accessToken) return false;
      
      try {
        // 先验证本地Token
        const res = await axios.get(`${SSO_SERVER}/api/verify`, {
          headers: { Authorization: `Bearer ${this.accessToken}` }
        });

        if (res.data.valid) {
          this.user = res.data.user;
          return true;
        }
      } catch (error) {
        // Token过期时尝试刷新
        if (error.response?.data?.code === 'TOKEN_EXPIRED') {
          return this.refreshToken();
        }
      }
      this.logout();
      return false;
    },

    // 刷新Token
    async refreshToken() {
      try {
        const res = await axios.post(`${SSO_SERVER}/api/refresh`, {}, {
          withCredentials: true // 携带RefreshToken
        });
        this.setAuth(this.user, res.data.accessToken);
        return true;
      } catch {
        this.logout();
        return false;
      }
    },

    // 统一退出
    async logout() {
      await axios.post(`${SSO_SERVER}/api/logout`, {}, { 
        withCredentials: true 
      });
      this.user = null;
      this.accessToken = null;
      localStorage.removeItem('accessToken');
    }
  }
});