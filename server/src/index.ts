import { server } from "./app";
import { mlProcess } from "./ml-process";
mlProcess();
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  process.stdout.write(`listening on http://localhost:${PORT}\n`);
});
