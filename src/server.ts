import app from "./app";
import { envVars } from "./config/env";
import { seedAdmin } from "./utils/seed";

async function main() {
  try {
    seedAdmin();
    app.listen(envVars.PORT, () => {
      console.log(`Example app listening on port ${envVars.PORT}`);
    });
  } catch (err) {
    console.log(err);
  }
}

main();
