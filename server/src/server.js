import { makeApp } from "./app.js";
import { initDb, setupDb, teardownDb } from "./services/db/index.js";
import { initVstorageWatcher } from "./vstorageWatcher.js";

const app = makeApp({ logger: true });

const start = async () => {
  initDb();
  await setupDb();
  await initVstorageWatcher();
};

start();

app.listen({ port: Number(process.env.PORT) || 5000 }, (err, address) => {
  console.log(`Server is now listening on ${address}`);
  if (err) {
    console.log(err);
    teardownDb();
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  }
});
