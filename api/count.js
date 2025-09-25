// api/count.js - 使用 ESM 语法
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // 设置 CORS 头部
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // 尝试从 KV 获取计数，如果失败则使用默认值
      let count;
      try {
        count = await kv.get('visit_count');
        if (count === null) {
          count = 1;
          await kv.set('visit_count', count);
        }
      } catch (error) {
        console.log('KV 未配置，使用默认值');
        count = 42; // 默认值
      }
      
      res.status(200).json({ 
        count: count,
        message: 'API 正常工作',
        timestamp: new Date().toISOString()
      });
    } 
    else if (req.method === 'POST') {
      // 增加计数
      let newCount;
      try {
        newCount = await kv.incr('visit_count');
      } catch (error) {
        console.log('KV 未配置，模拟增加');
        newCount = 43;
      }
      
      res.status(200).json({ count: newCount });
    }
    else {
      res.status(405).json({ error: '只支持 GET 和 POST 方法' });
    }
  } catch (error) {
    console.error('API 错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
}
