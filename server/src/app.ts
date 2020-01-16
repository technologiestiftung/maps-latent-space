import express from "express";
import path from "path";
import { Server } from "http";
import io from "socket.io";
export const app = express();

const server = new Server(app);

const socket = io(server);

app.use(express.static(path.resolve(__dirname, "../../client")));

app.get("/", (_req, res) => {
  res.json({ foo: "bah boo" });
});

socket.on("connection", client => {
  client.on("message", data => {
    console.log(data);
  });
});
