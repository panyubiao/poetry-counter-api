import { MongoClient } from 'mongodb';

// 从环境变量读取 MongoDB 连接串
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('请在 Vercel 环境变量中配置 MONGODB_URI');
}

// 全局缓存 MongoDB 客户端连接
let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  // 开发环境：避免每次热重载创建新连接
  if (!global._mongoClientPromise) {
    client = new MongoClient(MONGODB_URI);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // 生产环境：每次新建连接
  client = new MongoClient(MONGODB_URI);
  clientPromise = client.connect();
}

export default async function handler(req, res) {
  // 允许跨域
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  try {
    const client = await clientPromise;
    const db = client.db('visit-counter'); // 数据库名
    const collection = db.collection('counters'); // 集合名

    // 原子操作：查找并自增，如果不存在则创建
    const result = await collection.findOneAndUpdate(
      { _id: 'total-visits' },
      { $inc: { count: 1 } },
      { upsert: true, returnDocument: 'after' }
    );

    const count = result.value.count;

    res.status(200).json({
      count,
      success: true,
      message: '总访问次数统计成功'
    });
  } catch (error) {
    console.error('访问统计出错:', error);
    res.status(500).json({
      count: 0,
      success: false,
      message: '统计接口错误.'
    });
  }
}

