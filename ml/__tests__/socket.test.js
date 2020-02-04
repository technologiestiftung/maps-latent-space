const net = require("net");
var jspack = require("jspack").jspack;

function random() {
  return Math.random() * 1 - 1;
}
const client = new net.Socket();
client.connect(9999, "127.0.0.1", function() {
  console.log("Connected");
  const data = {
    "1": random(),
    "2": random(),
    "3": random(),
    "4": random(),
    "5": random(),
    "6": random(),
    "7": 0,
    "8": 0,
    "9": "1234"
  };
  const buf = Buffer.from(JSON.stringify(data));
  const len = Buffer.alloc(4);
  len.writeUInt32BE(buf.length, 0);
  // const len = Buffer.from(String(buf.length));
  console.log(typeof len);

  client.write(Buffer.concat([len, buf]));
});

client.on("data", function(data) {
  console.log("Received: " + data.readUIntBE(0, 4));
  const res = data.slice(4, data.length);
  console.log(JSON.parse(res.toString()));
  client.destroy(); // kill client after server's response
});
