const net = require('net');
var jspack = require("jspack").jspack;

const client = new net.Socket();
client.connect(9999, '127.0.0.1', function () {
  console.log('Connected');
  const data = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0, "7": 0, "8": 0, "9": "1234" };
  const buf = Buffer.from(JSON.stringify(data));
  const len = Buffer.alloc(4);
  len.writeUInt32BE(buf.length, 0);
  // const len = Buffer.from(String(buf.length));
  console.log(typeof (len));

  client.write(Buffer.concat([len, buf]));
});

client.on('data', function (data) {
  console.log('Received: ' + data);
  client.destroy(); // kill client after server's response
});