import test from "ava";
import dotenv from "dotenv";
import path from "path";
import { makeApp } from "../../src/app.js";
import {
  initDb,
  resetDb,
  setupDb,
  teardownDb,
  createNotifier,
  addOrUpdateUser,
  getUserByToken,
  markUserVerified,
  getUserById,
} from "../../src/services/db.js";
import { FIVE_SECONDS_IN_MS } from "../../src/utils/constants.js";

test.beforeEach(async (t) => {
  dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });
  resetDb();
  t.context.app = await makeApp();
  t.context.db = await setupDb(initDb());
});

test.afterEach.always(async (t) => {
  if (t.context.db) {
    await teardownDb();
    t.context.db = null;
  }
});

test("addOrUpdateUser creates a user and getUserByToken returns it", async (t) => {
  const tokenExpiry = new Date().getTime() + FIVE_SECONDS_IN_MS;
  const user = {
    email: "test1@test.com",
    token: "test-access-token-1",
    tokenExpiry,
    verified: 0,
  };

  const result = await addOrUpdateUser(user);
  t.is(result, 1, "addOrUpdateUser should add 1 record");

  const dbUser = await getUserByToken(user.token);
  t.deepEqual(
    dbUser,
    { ...user, id: 1 },
    "getUserByToken should return user with an id"
  );
});

test("createNotifier inserts a notifier and returns it", async (t) => {
  const notifier = {
    userId: 1, // @todo should this throw an error since FK does not exist yet?
    vaultManagerId: 1,
    vaultId: 1,
    collateralizationRatio: 1.23,
  };

  const result = await createNotifier(notifier);
  t.deepEqual(
    result,
    { ...notifier, id: 1 },
    "createNotifier should return the notifier with an id"
  );
});

test("markUserVerified marks the user verified and removes token", async (t) => {
  const tokenExpiry = new Date().getTime() + FIVE_SECONDS_IN_MS;
  const user = {
    email: "test@test.com",
    token: "test-access-token",
    tokenExpiry,
    verified: 0,
  };

  await addOrUpdateUser(user);
  const dbUser0 = await getUserByToken(user.token);
  t.is(dbUser0.verified, 0, "user should not be verified yet");
  t.is(dbUser0.token, user.token, "user should have an access token");
  t.is(
    dbUser0.tokenExpiry,
    tokenExpiry,
    "user should have an access token expiry"
  );
  await markUserVerified(dbUser0.id);
  const dbUser1 = await getUserById(dbUser0.id);
  t.is(dbUser1.verified, 1, "user should verified");
  t.is(dbUser1.token, null, "user token should be removed");
  t.is(dbUser1.tokenExpiry, null, "user tokenExpiry should be removed");
});

// @todo test getNotifersByUser
// @todo test deleteNotifer
