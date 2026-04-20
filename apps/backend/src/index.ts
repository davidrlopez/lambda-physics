import { buildApp } from "./app";
import type { FastifyInstance } from "fastify";

declare const process: {
  env: { PORT?: string; [key: string]: string | undefined };
  exit(code?: number): never;
};

const start = async () => {
  const app: FastifyInstance = buildApp();
  try {
    const port = Number(process.env.PORT) || 3000;
    await app.listen({ port, host: "0.0.0.0" });
    console.log(`Listening on port ${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
