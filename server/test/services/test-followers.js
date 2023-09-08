import test from "ava";
import dotenv from "dotenv";
import path from "path";
import sinon from "sinon";
import axios from "axios";
import { makeApp } from "../../src/app.js";
import {
  initDb,
  resetDb,
  setupDb,
  teardownDb,
  insertOrReplaceVault,
  insertOrReplaceQuote,
  createNotifier,
  getNotifiersByVaultId,
  getNotificationsByUserId,
} from "../../src/services/db/index.js";
import {
  maybeSendNotification,
  handleVault,
} from "../../src/services/followers.js";
import { initVstorageWatcher } from "../../src/vstorageWatcher.js";

test.beforeEach(async (t) => {
  dotenv.config({
    path: path.resolve(process.cwd(), ".env.test"),
    override: true,
  });
  const resp = Promise.resolve({
    status: 200,
    ok: true,
  });
  t.context.postStub = sinon.stub(axios, "post").resolves(resp);
  t.context.getStub = sinon.stub(axios, "get").resolves(resp);
  t.context.consoleErrorSpy = sinon.spy(console, "error");
  t.context.consoleLogSpy = sinon.spy(console, "log");
  resetDb();
  t.context.app = makeApp({ logger: false });
  t.context.db = await setupDb(initDb());
  t.context.vstorage = await initVstorageWatcher();

  // register a user
  const body = { email: "john@doe.com" };
  await t.context.app.inject({
    method: "POST",
    url: "register",
    body,
  });
  const verifyResponse = await t.context.app.inject({
    method: "POST",
    url: "verify",
    body: {
      token: t.context.postStub
        .getCall(0)
        .args[1].text.split("verify?token=")[1]
        .split(".")[0],
    },
  });
  if (!verifyResponse.headers["set-cookie"].includes("HttpOnly")) {
    throw new Error("Error getting jwt token.");
  }
  t.context.headers = { cookie: verifyResponse.headers["set-cookie"] };
});

test.afterEach.always(async (t) => {
  t.context.postStub.restore();
  t.context.getStub.restore();
  t.context.consoleErrorSpy.restore();
  t.context.consoleLogSpy.restore();
  if (t.context.db) {
    await teardownDb();
    t.context.db = null;
  }
  t.context.app = null;
  t.context.vstorage = null;
});

const fixtures = {
  vaults: [
    {
      vaultManagerId: 0,
      vaultId: 20,
      locked: 4420000000,
      debt: 11872792789,
      state: "active",
    },
    {
      vaultManagerId: 0,
      vaultId: 24,
      locked: 52500000,
      debt: 150838150,
      state: "active",
    },
  ],
  quotes: [
    {
      vaultManagerId: 0,
      quoteAmountIn: 1000000,
      quoteAmountOut: 6917094,
      inIssuerName: "IST",
      outIssuerName: "ATOM",
    },
  ],
};

test("maybeSendNotification should send a notification for vaults that breach the threshold", async (t) => {
  const notifiers = [
    { userId: 1, vaultManagerId: 0, vaultId: 20, collateralizationRatio: 1000 },
    { userId: 1, vaultManagerId: 0, vaultId: 20, collateralizationRatio: 999 },
    { userId: 1, vaultManagerId: 0, vaultId: 24, collateralizationRatio: 999 },
  ];

  await Promise.all(fixtures.vaults.map(insertOrReplaceVault));
  await Promise.all(fixtures.quotes.map(insertOrReplaceQuote));
  await Promise.all(notifiers.map(createNotifier));

  await maybeSendNotification(100, 0, 20);
  await maybeSendNotification(100, 0, 24);

  // ensure email api is called
  notifiers.forEach((n, i) => {
    const call = t.context.postStub.getCall(i + 1).args[1];
    t.is(
      call.subject,
      "Inter Vault Alert: Collateralization Level Breached",
      `Email is sent for scenario ${i + 1}`
    );
    t.is(
      call.text,
      `Your ATOM vault #${n.vaultId}, has crossed below the ${n.collateralizationRatio}% collateralization level.`,
      `Email body is correct for scenario ${i + 1}`
    );
  });

  // ensure notifications are persisted to the database
  const dbNotifications = await getNotificationsByUserId(notifiers[0].userId);
  dbNotifications.reverse().forEach(({ id, message, sentAt }, i) => {
    t.truthy(
      id,
      `Notification is persisted to the database for scenario ${i + 1}`
    );
    t.truthy(
      message,
      `Notification message is persisted to the database for scenario ${i + 1}`
    );
    t.truthy(
      String(sentAt).length === 13 && typeof sentAt === "number",
      `Notification stores a sentAt timestamp for scenario ${i + 1}`
    );
  });
});

test("maybeSendNotification should not a notification for vaults that haeven't breached the threshold", async (t) => {
  const notifiers = [
    { userId: 1, vaultManagerId: 0, vaultId: 20, collateralizationRatio: 500 },
    { userId: 1, vaultManagerId: 0, vaultId: 20, collateralizationRatio: 550 },
    { userId: 1, vaultManagerId: 0, vaultId: 24, collateralizationRatio: 500 },
  ];

  await Promise.all(fixtures.vaults.map(insertOrReplaceVault));
  await Promise.all(fixtures.quotes.map(insertOrReplaceQuote));
  await Promise.all(notifiers.map(createNotifier));

  await maybeSendNotification(600, 0, 20);
  await maybeSendNotification(600, 0, 24);

  notifiers.forEach((_, i) => {
    const call = t.context.postStub.getCall(i + 1);
    t.falsy(call, `Email should not be sent for scenario ${i + 1}`);
  });

  const dbNotifications = await getNotificationsByUserId(notifiers[0].userId);
  t.is(
    dbNotifications.length,
    0,
    "No notifications should be persisted to the db"
  );
});

test("maybeSendNotification should only send one notification until the threshold is reset", async (t) => {
  const notifiers = [
    { userId: 1, vaultManagerId: 0, vaultId: 20, collateralizationRatio: 500 },
  ];

  await Promise.all(fixtures.vaults.map(insertOrReplaceVault));
  await Promise.all(fixtures.quotes.map(insertOrReplaceQuote));
  const dbNotifiers0 = await Promise.all(notifiers.map(createNotifier));
  t.is(
    dbNotifiers0[0].active,
    0,
    "Notifier should be `active: false` to start."
  );

  // sent to price (collateralizationRatio) updates
  await maybeSendNotification(100, 0, 20);
  await maybeSendNotification(101, 0, 20);

  // confirm only one email is sent
  const firstCall = t.context.postStub.getCall(1).args[1];
  t.is(
    firstCall.subject,
    "Inter Vault Alert: Collateralization Level Breached",
    "Email is sent for base scenario."
  );
  t.is(
    firstCall.text,
    `Your ATOM vault #${notifiers[0].vaultId}, has crossed below the ${notifiers[0].collateralizationRatio}% collateralization level.`,
    "Email body is correct for base scenario."
  );
  const secondCall = t.context.postStub.getCall(2);
  t.falsy(secondCall, "Only one email should be sent");

  const dbNotifiers1 = await getNotifiersByVaultId(notifiers[0]);
  t.is(
    dbNotifiers1[0].active,
    1,
    "Notifier should be `active: true` after it's sent."
  );

  // send a higher ratio to reset the threshold
  const resetThreshold = notifiers[0].collateralizationRatio + 1; // 501
  await maybeSendNotification(resetThreshold, 0, 20);
  const dbNotifiers2 = await getNotifiersByVaultId(notifiers[0]);
  t.is(
    dbNotifiers2[0].active,
    0,
    "Notifier should be set back to `active: false` after recrossing threshold."
  );

  // recrossing the threshold should send an email again
  await maybeSendNotification(200, 0, 20);
  const secondEmail = t.context.postStub.getCall(2).args[1];
  t.is(
    secondEmail.text,
    `Your ATOM vault #${notifiers[0].vaultId}, has crossed below the ${notifiers[0].collateralizationRatio}% collateralization level.`,
    "Email body is correct for base scenario."
  );
});

test("maybeSendNotification returns with no action when an invalid collateralizationRatio is provided", async (t) => {
  const notifiers = [
    { userId: 1, vaultManagerId: 0, vaultId: 20, collateralizationRatio: 500 },
    { userId: 1, vaultManagerId: 0, vaultId: 20, collateralizationRatio: 550 },
  ];

  await Promise.all(fixtures.vaults.map(insertOrReplaceVault));
  await Promise.all(fixtures.quotes.map(insertOrReplaceQuote));
  await Promise.all(notifiers.map(createNotifier));

  const invalidRatio = "600";
  await maybeSendNotification(invalidRatio, 0, 20);

  notifiers.forEach((_, i) => {
    const call = t.context.postStub.getCall(i + 1);
    t.falsy(call, "Function should early return");
  });

  t.is(
    t.context.consoleErrorSpy.getCall(0).args[0],
    `Invalid ratio provided ${invalidRatio}`,
    "console.error should be called"
  );
});

test("handleVault should mark a closed or liquidated vault expired", async (t) => {
  const vaultPath = "published.vaultFactory.managers.manager0.vaults.vault20";
  const vaultData = {
    debtSnapshot: {
      debt: {
        brand: "Alleged: SEVERED: IST brand ",
        value: 11872792789n,
      },
    },
    locked: {
      brand: "Alleged: SEVERED: ATOM brand",
      value: 4420000000n,
    },
    vaultState: "closed",
  };

  const modifiedFixtures = { ...fixtures };
  modifiedFixtures.vaults[0].vaultId = 3;
  modifiedFixtures.vaults[1].vaultId = 3;
  await Promise.all(modifiedFixtures.vaults.map(insertOrReplaceVault));
  await Promise.all(modifiedFixtures.quotes.map(insertOrReplaceQuote));

  await handleVault(vaultPath, vaultData);

  t.is(
    t.context.consoleLogSpy.getCall(0).args[0],
    `Skipping vault with state: ${vaultData.vaultState}`,
    "console.error should be called"
  );
});
