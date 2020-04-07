const imagePath = "/images/custom-map.png";
const socketAddress = `ws://${window.location.host}`;
const sensorValues = [0, 0, 0, 0, 0, 0, 0];
document.addEventListener("DOMContentLoaded", function () {
  const inputs = document.querySelectorAll(".input__range--feature");

  const calcbutton = document.querySelector("#calc");
  if (calcbutton === null) {
    throw new Error("could not find button");
  }

  let socket;

  const socketMessageListener = (event) => {
    console.log('event["data"]', event.data);
    try {
      const json = JSON.parse(event.data);
      if (json.hasOwnProperty("command")) {
        if (json.command === "frontend_update") {
          console.info("frontend_update");
          const img = document.querySelector("#map");
          if (img !== null) {
            img.src = `${imagePath}?${Date.now()}`;
            socket.send("frontend_update done");
          }
        }
      } else if (json.command === "frontend_values") {
        console.log(json.data);
      }
    } catch (error) {
      console.warn("could not parse JSON from backend");
    }
  };
  const socketOpenListner = (event) => {
    Array.from(inputs).forEach((input) => {
      input.addEventListener("change", (event) => {
        console.log(event);
        const id = parseInt(event.target.id.split("-")[1], 10);
        if (!isNaN(id)) {
          // console.log(event.target.valueAsNumber);
          if (id - 1 >= 0 && id - 1 < 6) {
            sensorValues[id - 1] = event.target.valueAsNumber;
            socket.send(JSON.stringify({ sensorValues }));
          }
        }
      });
    });
    calcbutton.addEventListener("click", (event) => {
      event.preventDefault();
      sensorValues[6] = 1;
      socket.send(JSON.stringify({ sensorValues }));
      sensorValues[6] = 0;
    });
  };
  // socket.onclose =
  //   ("close",
  //   event => {
  //     socket.removeEventListener("message");
  //     socket.removeEventListener("open");
  //   });
  const SocketCloseListner = (event) => {
    if (socket) {
      console.error("Socket was closed");
    }
    socket = new WebSocket(socketAddress);
    socket.addEventListener("open", socketOpenListner);
    socket.addEventListener("message", socketMessageListener);
    socket.addEventListener("close", SocketCloseListner);
  };

  SocketCloseListner();
});
