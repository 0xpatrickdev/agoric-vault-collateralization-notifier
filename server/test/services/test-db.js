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
  getNotifiersByUser,
  setNotifierExpired,
  insertOrReplaceQuote,
  getLatestQuote,
  insertOrReplaceBrand,
} from "../../src/services/db/index.js";
import { FIVE_SECONDS_IN_MS } from "../../src/utils/constants.js";

const fixtures = {
  brands: [
    {
      brand: "[object Alleged: SEVERED: ATOM brand]",
      issuerName: "ATOM",
      decimalPlaces: 6,
      assetKind: "nat",
    },
    {
      brand: "[object Alleged: SEVERED: IST brand]",
      issuerName: "IST",
      decimalPlaces: 6,
      assetKind: "nat",
    },
  ],
};

test.beforeEach(async (t) => {
  dotenv.config({
    path: path.resolve(process.cwd(), ".env.test"),
    override: true,
  });
  resetDb();
  t.context.app = makeApp();
  t.context.db = await setupDb(initDb());
});

test.afterEach.always(async (t) => {
  if (t.context.db) {
    await teardownDb();
    t.context.db = null;
  }
  t.context.app = null;
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
    { ...notifier, id: 1, active: 0, expired: 0 },
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

test("setNotifierExpired marks a notifier expired", async (t) => {
  const notifier = {
    userId: 1,
    vaultManagerId: 0,
    vaultId: 1,
    collateralizationRatio: 500,
  };

  await createNotifier(notifier);
  const notifiers0 = await getNotifiersByUser(1);
  t.is(notifiers0[0].expired, 0, "Notifier should not be expired to start.");

  await setNotifierExpired(1);
  const notifiers1 = await getNotifiersByUser(1);
  t.is(notifiers1[0].expired, 1, "Notifier should be marked expired.");
});

test("getLatestQuote returns the lastest quote", async (t) => {
  const quote = {
    vaultManagerId: 0,
    quoteAmountIn: 1000000,
    quoteAmountOut: 6917094,
    inIssuerName: "IST",
    outIssuerName: "ATOM",
  };

  const quotesWithDisplayInfo = Object.assign({}, quote, {
    amountInDecimals: 6,
    amountOutDecimals: 6,
  });

  await insertOrReplaceQuote(quote);
  await Promise.all(fixtures.brands.map(insertOrReplaceBrand)); // ensure brands exist

  const { latestTimestamp, ...rest } = await getLatestQuote(
    quote.vaultManagerId
  );
  t.deepEqual(quotesWithDisplayInfo, rest, "Quote should be retrievable.");
  t.truthy(latestTimestamp, "Quote should have a timestamp.");
});

test("getNotifiersByUser should return an empty array when notifiers are not found", async (t) => {
  t.deepEqual(await getNotifiersByUser(), []);
});
