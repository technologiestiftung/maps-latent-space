import net from "net";
interface CreateClientOpts {
  host: string;
  port: number;
}
export function createClient(opts: CreateClientOpts): net.Socket {
  const client = net.createConnection(opts, function() {
    console.info(
      `INFO:TCP:CLIENT: localAddress ${client.localAddress}:${client.localPort}`
    );
    console.info(
      `INFO:TCP:CLIENT: remoteAddress ${client.remoteAddress}:${client.remotePort}`
    );
  });
  client.setEncoding("utf8");
  // client.setTimeout(3000);
  // client.setKeepAlive(true, 3000);
  // client.on("data", function(data) {
  //   console.info(`INFO:TCP:CLIENT: ${data}`);
  // });
  client.on("error", err => {
    console.error("ERROR:TCP:CLIENT:", err);
  });
  client.on("timeout", () => {
    console.error("ERROR:TCP:CLIENT: timeout on stream");
  });
  client.on("drain", () => {
    console.info("INFO:TCP:CLIENT: socket got drained");
  });
  client.on("end", () => {
    console.info("INFO:TCP:CLIENT: End emitted");
  });
  client.on("close", hadError => {
    console.info("INFO:TCP:CLIENT: connection closed");
    if (hadError) {
      console.error("ERROR:TCP:CLIENT: connection close with error");
    }
  });
  return client;
}
