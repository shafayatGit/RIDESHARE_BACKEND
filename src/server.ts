import { envVars } from "./config/env";
import { httpServer, io } from "./lib/io";
import { initChatSocket } from "./modules/chat/chat.socket";
import { seedAdmin } from "./utils/seed";

async function main() {
  try {
    seedAdmin();

    initChatSocket(io);

    httpServer.listen(envVars.PORT, () => {
      console.log(`Example app listening on port ${envVars.PORT}`);
    });
  } catch (err) {
    console.log(err);
  }
}

main();
