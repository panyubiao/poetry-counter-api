// api/test.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  res.status(200).json({ 
    message: '测试 API 工作正常',
    timestamp: new Date().toISOString(),
    moduleSystem: 'ESM',
    status: 'OK'
  });
}