import fp from "fastify-plugin";
import cors from "@fastify/cors";
import { getEnvVar } from "../utils/getEnvVar.js";

/**
 * @param {import('fastify').FastifyInstance} fastify
 * @returns {Promise<void>}
 */
export const corsPlugin = fp(async function (fastify) {
  fastify.register(cors, {
    origin: getEnvVar("APP_DOMAIN"),
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    credentials: true,
  });
});
