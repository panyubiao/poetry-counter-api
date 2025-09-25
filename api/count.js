// 存储访问次数（使用 Vercel KV 免费存储，避免服务器重启后数据丢失）
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // 允许跨域访问（解决前端调用问题）
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  try {
    // 从 KV 存储中获取当前次数，没有则初始化为 0
    let count = await kv.get('poetry_visit_count') || 0;
    // 增加访问次数
    count = parseInt(count) + 1;
    // 保存更新后的次数
    await kv.set('poetry_visit_count', count);
    // 返回总访问次数
    res.status(200).json({ count: count, success: true });
  } catch (error) {
    console.error('统计失败:', error);
    // 出错时返回当前缓存的次数（避免影响前端显示）
    const count = await kv.get('poetry_visit_count') || 0;
    res.status(200).json({ count: count, success: false });
  }
}