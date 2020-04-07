import express from "express";
import path from "path";
import cors from "cors";
import WebSocket from "ws";
import http from "http";
import { Board, Sensor, SensorOption } from "johnny-five";
import EventEmitter from "events";
import { createClient } from "./tcp-client";
import { config } from "./config";

const app = express();
class Notify extends EventEmitter {}
const notify = new Notify();
const HOST = "127.0.0.1";
const SOCKET_PORT = 9999;

let board: Board | undefined;

if (config.useHardware) {
  board = new Board({ repl: false, port: "/dev/ttyACM0" });
}
/**
 * Express specific stuff
 *
 */
app.use(cors());
const sensors: Sensor[] = [];
const sensorValues: number[] = [0, 0, 0, 0, 0, 0, 0];
const pins = ["A0", "A1" /*, "A2", "A4", "A5", "A6"*/];

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
// sclient.connect(SOCKET_PORT, HOST, sClientConnectCB);
// sclient.setKeepAlive(true, 5000);

// sclient.on("close", hadError => {
//   console.info("INFO:ML: connection closed");
//   if (hadError) {
//     console.error("INFO:ML: with error");
//   }
// });
/**
 * We are getting data back frpm the python process
 * Socket Stuff
 */

/**
 * Send data to the ML Python process
 *
 */
notify.on("ml_update", () => {
  const sclient = createClient({ host: HOST, port: SOCKET_PORT });
  sclient.on("data", function(data) {
    const res = data.toString().slice(4, data.length);
    console.info(`INFO:TCP:CLIENT: response ${res}`);
    notify.emit("frontend_update");
    sclient.destroy();
  });

  const id = String(Math.floor(Math.random() * 1000)).padStart(4, "0");
  const data = {
    "1": sensorValues[0],
    "2": sensorValues[1],
    "3": sensorValues[2],
    "4": sensorValues[3],
    "5": sensorValues[4],
    "6": sensorValues[5],
    "7": sensorValues[6],
    "8": 0,
    "9": id
  };
  console.info("INFO:ML: sending data", data);
  const buf = Buffer.from(JSON.stringify(data));
  const len = Buffer.alloc(4);
  len.writeUInt32BE(buf.length, 0);
  const out = Buffer.concat([len, buf], buf.length + 4);
  sclient.write(out, err => {
    if (err) {
      console.error(`ERROR:TCP:CLIENT: ${err}`);
    }
    // mlIsProcessing = false;
  });
});

/**
 *
 * we have a connections
 */
wss.on("connection", function connection(ws) {
  console.info("INFO:FRONTEND: someone connected");
  /**
   * getting a message from the frontend
   * not needed yet
   *
   */
  ws.on("message", function incoming(data) {
    console.info(`INFO:FRONTEND: Data received: ${data}`);
    try {
      const json = JSON.parse(data.toString());
      if (json.sensorValues) {
        for (let i = 0; i < 7; i++) {
          sensorValues[i] = json.sensorValues[i] as number;
        }
        notify.emit("ml_update");
        if (sensorValues[6] === 1) {
          sensorValues[6] = 0;
        }
      }
    } catch (error) {
      console.error(error);
    }
  });
  /**
   * all websocket clients
   */
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      /**
       * update frontend
       */
      notify.on("frontend_update", () => {
        client.send(
          JSON.stringify({ data: sensorValues, command: "frontend_update" })
        );
      });
      /**
       *
       * send values to the frontend
       * not specifically needed but useful for debugging
       */
      notify.on("frontend_values", () => {
        console.info("INFO:FRONTEND: change emitted over websocket");
        client.send(
          JSON.stringify({
            data: sensorValues,
            command: "frontend_values"
          })
        );
      });
    }
  });
  // });
});

if (config.useHardware && board) {
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
          console.info(
            `INFO:SENSOR: Sensor A${sensor.pin} changed`,
            sensor.fscaleTo(-1, 1)
          );
          sensorValues[i] = sensor.fscaleTo(-1, 1);
          notify.emit("frontend_values");
          // if (mlIsProcessing === false) {
          notify.emit("ml_update");
          // }
        });
      });
    });
  });
}
