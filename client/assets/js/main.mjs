const imagePath = "/images/custom-map.png";
const socketAddress = `ws://${window.location.host}`;
document.addEventListener("DOMContentLoaded", function() {
  const calcbutton = document.querySelector("#calc");
  if (calcbutton === null) {
    throw new Error("could not find button");
  }
  let socket;

  const socketMessageListener = event => {
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
  const socketOpenListner = event => {
    socket.send("Hello server");
    calcbutton.addEventListener("click", event => {
      event.preventDefault();
      socket.send("calc");
    });
  };
  // socket.onclose =
  //   ("close",
  //   event => {
  //     socket.removeEventListener("message");
  //     socket.removeEventListener("open");
  //   });
  const SocketCloseListner = event => {
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
