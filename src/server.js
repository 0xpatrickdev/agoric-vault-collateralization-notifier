import { makeApp } from "./app.js";
import { initDb, setupDb, teardownDb } from "./services/db/index.js";
import { initVstorageWatcher } from "./vstorageWatcher.js";

const app = makeApp({ logger: true });

initDb();
await setupDb();

await initVstorageWatcher();

app.listen({ port: process.env.PORT || 5000 }, (err, address) => {
  console.log(`Server is now listening on ${address}`);
  if (err) {
    console.log(err);
    teardownDb();
    process.exit(1);
  }
});
