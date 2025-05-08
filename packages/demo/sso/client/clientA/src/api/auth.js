import axios from 'axios';

const SSO_SERVER = 'http://localhost:3000';
axios.defaults.withCredentials = true; // 关键：允许跨域携带Cookie

/**
 * 登录接口（双Token方案）
 * @param {object} credentials - { username, password }
 * @returns {Promise<{user: object, accessToken: string}>}
 */
export const login = async (credentials) => {
  try {
    const response = await axios.post(`${SSO_SERVER}/api/login`, credentials);
    
    // 注意：RefreshToken 通过HTTP Only Cookie自动设置
    return {
      user: response.data.user,
      accessToken: response.data.accessToken,
      success: response.data.success
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

/**
 * 验证Access Token
 * @param {string} token - Access Token
 * @returns {Promise<{valid: boolean, user?: object}>}
 */
export const verifyToken = async (token) => {
  try {
    const response = await axios.get(`${SSO_SERVER}/api/verify`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // 扩展返回结果，包含Token过期时的特殊状态
    if (response.data.code === 'TOKEN_EXPIRED') {
      return { 
        valid: false, 
        expired: true,
        user: response.data.user // 可能返回部分用户信息
      };
    }
    return response.data;
  } catch (error) {
    throw new Error('Token verification failed');
  }
};

/**
 * 刷新Access Token
 * @returns {Promise<{accessToken: string}>}
 */
export const refreshToken = async () => {
  try {
    // 自动携带HTTP Only的RefreshToken
    const response = await axios.post(`${SSO_SERVER}/api/refresh`);
    return response.data;
  } catch (error) {
    throw new Error('Refresh token failed');
  }
};

/**
 * 退出登录
 * @returns {Promise<{success: boolean}>}
 */
export const logout = async () => {
  try {
    // 清除服务端会话和RefreshToken Cookie
    const response = await axios.post(`${SSO_SERVER}/api/logout`);
    
    // 建议客户端也主动清除本地Token
    return response.data;
  } catch (error) {
    throw new Error('Logout failed');
  }
};

/**
 * SSO 检查端点（用于跨域跳转）
 * @param {string} redirectUrl - 回调地址
 * @returns {void}
 */
export const ssoCheck = (redirectUrl) => {
  // 触发服务端重定向流程
  window.location.href = `${SSO_SERVER}/sso/check?redirect=${encodeURIComponent(redirectUrl)}`;
};

/**
 * 用Code换取AccessToken
 * @param {string} code - 一次性授权码
 * @returns {Promise<{accessToken: string}>}
 */
export const exchangeCodeForToken = async (code) => {
  try {
    const response = await axios.post(`${SSO_SERVER}/sso/token`, { code });
    return response.data;
  } catch (error) {
    throw new Error('Code exchange failed');
  }
};

// 配置响应拦截器处理Token过期
axios.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    // 检测到Access Token过期
    if (error.response?.status === 401 && 
        error.response?.data?.code === 'TOKEN_EXPIRED' &&
        !originalRequest._retry) {
      
      originalRequest._retry = true;
      
      try {
        // 尝试刷新Token
        const { accessToken } = await refreshToken();
        
        // 重试原始请求
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // 刷新失败则跳转到SSO检查页
        ssoCheck(window.location.href);
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);