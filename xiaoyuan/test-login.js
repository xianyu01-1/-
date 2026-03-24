import http from 'http';

const postData = JSON.stringify({
  username: 'admin01',
  password: '123456'
});

const options = {
  hostname: 'localhost',
  port: 8080,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log(`状态码: ${res.statusCode}`);
  console.log(`响应头: ${JSON.stringify(res.headers)}`);
  res.setEncoding('utf8');
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('响应数据:', data);
    try {
      const parsedData = JSON.parse(data);
      console.log('解析后的数据:', parsedData);
      console.log('success:', parsedData.success);
      console.log('userInfo:', parsedData.userInfo);
    } catch (e) {
      console.log('解析数据失败:', e);
    }
  });
});

req.on('error', (e) => {
  console.error(`请求失败: ${e.message}`);
});

// 写入数据到请求体
req.write(postData);
req.end();
