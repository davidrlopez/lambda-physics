import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildApp } from "../app";

const app = buildApp();

beforeAll(async () => {
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe("GET /api/stats", () => {
  it("responde 200 y tiene las claves esperadas", async () => {
    const respuesta = await app.inject({
      method: "GET",
      url: "/api/stats",
    });

    expect(respuesta.statusCode).toBe(200);
    const datos = respuesta.json();
    expect(datos).toHaveProperty("totalPartidas");
    expect(datos).toHaveProperty("mediaTiempo");
  });
});
