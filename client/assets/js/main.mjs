const imagePath = "/images/custom-map.png";
document.addEventListener("DOMContentLoaded", function() {
  const calcbutton = document.querySelector("#calc");
  if (calcbutton === null) {
    throw new Error("could not find button");
  }
  const socket = new WebSocket(`ws://${window.location.host}`);
  // socket.onclose =
  //   ("close",
  //   event => {
  //     socket.removeEventListener("message");
  //     socket.removeEventListener("open");
  //   });
  socket.addEventListener("open", _event => {
    socket.send("Hello server");
    calcbutton.addEventListener("click", event => {
      event.preventDefault();
      socket.send("calc");
    });
  });
  socket.addEventListener("message", event => {
    console.log('event["data"]', event.data);
    try {
      const json = JSON.parse(event.data);
      if (json.hasOwnProperty("command")) {
        if (json.command === "reload") {
          console.info("reload");
          const img = document.querySelector("#map");
          if (img !== null) {
            img.src = `${imagePath}?${Date.now()}`;
            socket.send("reload done");
          }
        }
      } else if (json.command === "value") {
        console.log(json.data);
      }
    } catch (error) {
      console.warn("could not parse JSON from backend");
    }
  });
});
