import { app } from "./app";
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  process.stdout.write(`listening on http://localhost:${PORT}\n`);
});


