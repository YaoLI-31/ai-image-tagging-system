const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件配置
app.use(cors({
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// 百度AI配置
const BAIDU_API_KEY = process.env.BAIDU_API_KEY;
const BAIDU_SECRET_KEY = process.env.BAIDU_SECRET_KEY;

// 工具函数：获取access_token
let accessTokenCache = {
  token: null,
  expireTime: 0
};

async function getBaiduAccessToken() {
  // 检查缓存是否有效（有效期通常为30天，我们提前5分钟刷新）
  if (accessTokenCache.token && Date.now() < accessTokenCache.expireTime) {
    console.log('使用缓存的access_token');
    return accessTokenCache.token;
  }

  try {
    console.log('请求新的access_token...');
    const response = await axios.post(
      'https://aip.baidubce.com/oauth/2.0/token',
      null,
      {
        params: {
          grant_type: 'client_credentials',
          client_id: BAIDU_API_KEY,
          client_secret: BAIDU_SECRET_KEY
        },
        timeout: 10000
      }
    );

    if (response.data.access_token) {
      accessTokenCache.token = response.data.access_token;
      // 设置过期时间（提前5分钟刷新）
      accessTokenCache.expireTime = Date.now() + (response.data.expires_in - 300) * 1000;
      console.log('access_token获取成功');
      return response.data.access_token;
    } else {
      throw new Error('获取access_token失败');
    }
  } catch (error) {
    console.error('获取access_token失败:', error.message);
    if (error.response) {
      console.error('响应数据:', error.response.data);
    }
    throw error;
  }
}

// 1. 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Baidu AI Image Recognition Proxy',
    endpoints: [
      { method: 'POST', path: '/api/analyze/general', desc: '通用物体识别' },
      { method: 'GET', path: '/api/config', desc: '获取配置信息' }
    ]
  });
});

// 2. 通用物体识别（主要功能）
app.post('/api/analyze/general', async (req, res) => {
  try {
    console.log('收到图片识别请求');
    
    const { imageBase64 } = req.body;
    
    if (!imageBase64) {
      return res.status(400).json({ 
        error: '缺少必要参数',
        message: '请提供imageBase64参数'
      });
    }

    // 检查base64格式（简单验证）
    if (imageBase64.length > 4 * 1024 * 1024) { // 4MB限制
      return res.status(400).json({
        error: '图片太大',
        message: '图片大小不能超过4MB，请压缩后重试'
      });
    }

    // 获取access_token
    const accessToken = await getBaiduAccessToken();
    
    console.log('调用百度AI通用物体识别API...');
    
    // 调用百度AI API
    const response = await axios.post(
      'https://aip.baidubce.com/rest/2.0/image-classify/v2/advanced_general',
      `image=${encodeURIComponent(imageBase64)}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        params: { access_token: accessToken },
        timeout: 30000 // 30秒超时
      }
    );

    console.log('百度AI响应:', {
      result_num: response.data.result_num,
      log_id: response.data.log_id
    });

    // 返回标准化响应
    res.json({
      success: true,
      data: response.data,
      timestamp: new Date().toISOString(),
      log_id: response.data.log_id
    });

  } catch (error) {
    console.error('图片识别失败:', error.message);
    
    let statusCode = 500;
    let errorMessage = '服务器内部错误';
    
    if (error.response) {
      // 百度API返回的错误
      statusCode = error.response.status;
      errorMessage = `百度API错误: ${error.response.data.error_msg || '未知错误'}`;
      console.error('百度API错误详情:', error.response.data);
    } else if (error.request) {
      // 请求发送了但没有收到响应
      errorMessage = '无法连接到百度AI服务，请检查网络';
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = '请求超时，请稍后重试';
    }
    
    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      code: error.response?.data?.error_code || 'UNKNOWN_ERROR',
      timestamp: new Date().toISOString()
    });
  }
});

// 3. 获取配置信息（不暴露敏感信息）
app.get('/api/config', (req, res) => {
  res.json({
    service: 'Baidu AI Proxy',
    version: '1.0.0',
    features: ['通用物体识别'],
    max_image_size: '4MB',
    status: 'running',
    baidu_api_configured: !!BAIDU_API_KEY
  });
});

// 4. 文件上传测试端点（可选）
app.post('/api/test/echo', (req, res) => {
  res.json({
    message: '后端服务正常',
    received: {
      hasImage: !!req.body.imageBase64,
      imageLength: req.body.imageBase64?.length || 0,
      timestamp: new Date().toISOString()
    }
  });
});

// 5. 主页
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>AI图片标签系统 - 后端服务</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        h1 { color: #4f46e5; }
        .endpoint { background: #f3f4f6; padding: 10px; margin: 10px 0; border-radius: 5px; }
        code { background: #e5e7eb; padding: 2px 4px; border-radius: 3px; }
      </style>
    </head>
    <body>
      <h1>🎯 AI图片标签系统 - 后端服务</h1>
      <p>服务器正在运行中</p>
      
      <h2>🛠️ 可用接口</h2>
      <div class="endpoint">
        <strong>GET /api/health</strong> - 健康检查
        <br><a href="/api/health" target="_blank">点击测试</a>
      </div>
      
      <div class="endpoint">
        <strong>POST /api/analyze/general</strong> - 通用物体识别
        <br>Body: <code>{ "imageBase64": "base64字符串" }</code>
      </div>
      
      <div class="endpoint">
        <strong>GET /api/config</strong> - 配置信息
        <br><a href="/api/config" target="_blank">点击测试</a>
      </div>
      
      <h2>📋 使用说明</h2>
      <ol>
        <li>确保已在 <code>.env</code> 文件中配置百度AI API密钥</li>
        <li>前端页面运行在 <a href="http://localhost:5500" target="_blank">http://localhost:5500</a></li>
        <li>使用VSCode的Thunder Client扩展测试API</li>
      </ol>
      
      <h2>🔗 相关链接</h2>
      <ul>
        <li><a href="https://ai.baidu.com/" target="_blank">百度AI开放平台</a></li>
        <li><a href="https://github.com/yourusername/ai-image-project" target="_blank">项目GitHub仓库</a></li>
      </ul>
    </body>
    </html>
  `);
});

// 启动服务器
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(50));
  console.log('🚀 AI图片标签系统 - 后端服务器启动成功');
  console.log('='.repeat(50));
  console.log(`📡 本地地址: http://localhost:${PORT}`);
  console.log(`🔍 健康检查: http://localhost:${PORT}/api/health`);
  console.log(`🛠️  配置信息: http://localhost:${PORT}/api/config`);
  console.log('='.repeat(50));
  console.log('📝 重要提示:');
  console.log('1. 确保前端页面运行在 http://localhost:5500');
  console.log('2. 检查 .env 文件中的百度AI API配置');
  console.log('3. 使用 Thunder Client 测试API连接');
  console.log('='.repeat(50) + '\n');
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n🛑 正在关闭服务器...');
  process.exit(0);
});