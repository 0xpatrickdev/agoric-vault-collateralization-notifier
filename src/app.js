import dotenv from "dotenv";
import fastify from "fastify";
import { jwtPlugin } from "./plugins/jwt.js";
import { auth } from "./routes/auth.js";
import { health } from "./routes/health.js";
import { notifiers } from "./routes/notifers.js";
import { getEnvVar } from "./utils/getEnvVar.js";

dotenv.config();

/**
 * Creates and configures a Fastify server application.
 * @param {import('fastify').FastifyServerOptions} [opts={}]
 * @returns {import('fastify').FastifyInstance}
 */
export const makeApp = (opts = {}) => {
  const app = fastify(opts);

  const JWT_SECRET = getEnvVar("JWT_SECRET");
  app.register(jwtPlugin, { secret: JWT_SECRET });

  app.register(auth);
  app.register(health);
  app.register(notifiers);

  return app;
};
