const http = require('http');

const req = http.request('http://localhost:3000/api/chat/vault', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
}, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk}`);
  });
  res.on('end', () => {
    console.log('No more data in response.');
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(JSON.stringify({ messages: [{ role: 'user', content: 'What is the sum of 10 and 20? Reply in one sentence' }] }));
req.end();
