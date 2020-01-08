const net = require('net');

const client = new net.Socket();
client.connect(9999, '127.0.0.1', function () {
  console.log('Connected');
  client.write(Buffer.from(JSON.stringify({ foo: 1 })));
});

client.on('data', function (data) {
  console.log('Received: ' + data);
  client.destroy(); // kill client after server's response
});