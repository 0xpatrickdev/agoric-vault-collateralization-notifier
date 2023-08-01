import test from "ava";
import dotenv from "dotenv";
import path from "path";
import { getEnvVar, getEnvVars } from "../../src/utils/getEnvVar.js";

test.beforeEach(async (t) => {
  dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });
});

test("getEnvVar() returns an environment variable", async (t) => {
  const JWT_SECRET = getEnvVar("JWT_SECRET");
  t.is(
    JWT_SECRET,
    "test-jwt-secret",
    "getEnvVar should return a value from .env.test"
  );
});

test("getEnvVar() throws when environment variable is not defined", async (t) => {
  t.throws(() => getEnvVar("JWT_SECRET_2"), {
    message: "JWT_SECRET_2 not set",
  });
});

test("getEnvVars() returns a list of environment variables", async (t) => {
  const [JWT_SECRET, JWT_EXPIRY] = getEnvVars(["JWT_SECRET", "JWT_EXPIRY"]);
  t.is(
    JWT_SECRET,
    "test-jwt-secret",
    "getEnvVars should return a value from .env.test"
  );
  t.is(JWT_EXPIRY, "30d", "getEnvVars should return a value from .env.test");
});
