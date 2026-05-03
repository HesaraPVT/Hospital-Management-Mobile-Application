const http = require('http');

function post(path, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });

    req.on('error', (e) => reject(e));
    req.write(data);
    req.end();
  });
}

(async () => {
  try {
    console.log('Registering user...');
    const r = await post('/api/auth/register', { name: 'AutoTest User', email: 'autotest@example.com', password: 'test123' });
    console.log('REGISTER STATUS', r.status);
    console.log('REGISTER BODY', r.body);

    console.log('\nLogging in...');
    const l = await post('/api/auth/login', { email: 'autotest@example.com', password: 'test123' });
    console.log('LOGIN STATUS', l.status);
    console.log('LOGIN BODY', l.body);
  } catch (err) {
    console.error('ERROR', err.message);
  }
})();
