import { makeApp } from "./app.js";
import { initDb, setupDb, teardownDb } from "./services/db.js";

const app = makeApp({ logger: true });

initDb();

setupDb();

app.listen({ port: process.env.PORT || 5000 }, (err, address) => {
  console.log(`Server is now listening on ${address}`);
  if (err) {
    console.log(err);
    teardownDb();
    process.exit(1);
  }
});
