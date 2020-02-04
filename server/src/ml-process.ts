import { spawn } from "child_process";
import path from "path";
export const mlProcess: () => void = () => {
  const ml = spawn(
    path.resolve(__dirname, "../../ml/docker-run-latent.sh"),
    []
  );

  ml.stdout.on("data", data => {
    console.log(`ML STDOUT: ${data}`);
  });

  ml.stderr.on("data", data => {
    console.error(`ML SDTERR: ${data}`);
  });

  ml.stderr.on("close", (code: string) => {
    console.error(`ML CLOSE: ${code}`);
  });
};
