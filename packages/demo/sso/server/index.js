import express from 'express';
import cors from 'cors';
import session from 'express-session';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';

const app = express();

// 中间件
app.use(cookieParser());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  exposedHeaders: ['set-cookie']
}));
app.use(express.json());
app.use(session({
  secret: 'sso_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

const JWT_SECRET = {
  ACCESS: 'your_access_token_secret',
  REFRESH: 'your_refresh_token_secret'
};

const users = [
  { id: 1, username: 'user1', password: 'pass1', email: 'user1@example.com' },
  { id: 2, username: 'user2', password: 'pass2', email: 'user2@example.com' }
];

// 生成双Token
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    JWT_SECRET.ACCESS,
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { userId },
    JWT_SECRET.REFRESH,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

// 登录接口（改造后）
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    req.session.userId = user.id; // 存储会话
    
    const { accessToken, refreshToken } = generateTokens(user.id);
    
    // 设置HTTP Only的Refresh Token Cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false, // 生产环境应为true
      sameSite: 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    
    res.json({ 
      success: true,
      accessToken,
      user: { id: user.id, username: user.username, email: user.email }
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// 新增：Token刷新接口
app.post('/api/refresh', (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(401);

  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET.REFRESH);
    const { accessToken } = generateTokens(decoded.userId);
    
    res.json({ accessToken });
  } catch (err) {
    res.sendStatus(403);
  }
});

// 验证接口（改造后）
app.get('/api/verify', (req, res) => {
  const token = req.query.token || req.headers.authorization?.split(' ')[1];
  
  if (!token) return res.status(401).json({ valid: false });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET.ACCESS);
    const user = users.find(u => u.id === decoded.userId);
    
    res.json({ 
      valid: true,
      user: user ? { 
        id: user.id, 
        username: user.username, 
        email: user.email 
      } : null
    });
  } catch (err) {
    // Access Token过期时返回特定错误码
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        valid: false,
        code: 'TOKEN_EXPIRED'
      });
    }
    res.status(401).json({ valid: false });
  }
});

// 登出接口（改造后）
app.post('/api/logout', (req, res) => {
  // 清除会话
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
    }
    // 清除Refresh Token Cookie
    res.clearCookie('refreshToken');
    res.json({ success: true });
  });
});

// 新增：SSO检查端点（跨域关键）
app.get('/sso/check', (req, res) => {
  const { redirect } = req.query;
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken || !redirect) {
    return res.status(400).json({
      success: false,
      error: 'invalid_request',
      message: 'Missing required parameters'
    });
  }

  try {
    // 验证Refresh Token
    const decoded = jwt.verify(refreshToken, JWT_SECRET.REFRESH);
    
    // 生成一次性Code（有效期5分钟）
    const code = crypto.randomBytes(16).toString('hex');
    req.session.ssoCode = { code, userId: decoded.userId };
    
    // 返回成功结果
    res.json({
      success: true,
      code: code,
      redirect: decodeURIComponent(redirect)
    });

  } catch (err) {
    res.status(401).json({
      success: false,
      error: 'invalid_token',
      message: 'Invalid or expired refresh token'
    });
  }
});

// 新增：Code换Token接口
app.post('/sso/token', (req, res) => {
  const { code } = req.body;
  
  if (!code || !req.session.ssoCode || req.session.ssoCode.code !== code) {
    return res.status(400).json({ error: 'Invalid code' });
  }
  
  const { accessToken } = generateTokens(req.session.ssoCode.userId);
  delete req.session.ssoCode; // 一次性Code立即失效
  
  res.json({ accessToken });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`SSO Server running on http://localhost:${PORT}`));