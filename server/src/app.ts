import express from "express";
import path from "path";
import cors from "cors";
import WebSocket from "ws";
import http from "http";
import { Board, Sensor, SensorOption } from "johnny-five";
import EventEmitter from "events";
import net from "net";

const app = express();
const sclient = new net.Socket();
class Notify extends EventEmitter {}
const notify = new Notify();

const board = new Board({ repl: false, port: "/dev/ttyACM0" });
/**
 * Express specific stuff
 *
 */
app.use(cors());
const sensors: Sensor[] = [];
const sensorValues: number[] = [0, 0, 0, 0, 0, 0];
const pins = ["A0" /*, "A1", "A2", "A4", "A5", "A6"*/];
app.use(express.static(path.resolve(__dirname, "../../client")));
app.use("/images", express.static(path.resolve(__dirname, "../../ml/out")));
app.get("/", (_req, res) => {
  res.json({ foo: "bah boo" });
});

/**
 * Websocket stuff
 *
 */
export const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

/**
 * We are getting data back frpm the python process
 * Socket Stuff
 */
sclient.on("data", function(data) {
  console.log("Received: " + data.readUIntBE(0, 4));
  const res = data.slice(4, data.length);
  console.log(JSON.parse(res.toString()));
  notify.emit("update");
  // sclient.destroy(); // kill client after server's response
});
/**
 * Send data to the ML Python process
 *
 */
notify.on("send", () => {
  sclient.connect(9999, "127.0.0.1", function() {
    console.log("Connected");
    const data = {
      "1": sensorValues[0],
      "2": sensorValues[1],
      "3": sensorValues[2],
      "4": sensorValues[3],
      "5": sensorValues[4],
      "6": sensorValues[5],
      "7": 0,
      "8": 0,
      "9": "1234"
    };
    const buf = Buffer.from(JSON.stringify(data));
    const len = Buffer.alloc(4);
    len.writeUInt32BE(buf.length, 0);
    // const len = Buffer.from(String(buf.length));
    console.log(typeof len);
    sclient.write(Buffer.concat([len, buf]));
  });
});

/**
 *
 * we have a connections
 */
wss.on("connection", function connection(ws) {
  console.log("someone connected");
  /**
   * getting a message from the frontend
   * not needed yet
   *
   */
  ws.on("message", function incoming(data) {
    console.log(data);
  });
  /**
   * all websocket clients
   */
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      /**
       * update frontend
       */
      notify.on("update", () => {
        client.send(JSON.stringify({ data: sensorValues, command: "update" }));
      });
      /**
       *
       * send values to the frontend
       * not specifically needed but useful for debugging
       */
      notify.on("values", () => {
        console.log("change emitted");
        client.send(
          JSON.stringify({
            data: sensorValues,
            command: "values"
          })
        );
      });
    }
  });
  // });
});

/**
 * The arduino board is ready
 *
 */
board.on("ready", () => {
  pins.forEach(pin => {
    const opts: SensorOption = {
      // eslint-disable-next-line
      // @ts-ignore
      freq: 250 /* @ts-ignore */,
      pin: pin,
      /* types dont are conform to docs */
      threshold: 5 /* types dont are conform to docs */
    };

    sensors.push(new Sensor(opts));
    sensors.forEach((sensor, i) => {
      sensor.on("change", () => {
        console.log(`Sensor ${sensor.id} changed`, sensor.fscaleTo(-1, 1));
        sensorValues[i] = sensor.fscaleTo(-1, 1);
        notify.emit("values");
        notify.emit("send");
      });
    });
  });
});
