import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildApp } from "../app";

const app = buildApp();

beforeAll(async () => {
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe("GET /api/ranking", () => {
  it("genera 200 marcas", async () => {
    const respuesta = await app.inject({
      method: "GET",
      url: "/api/ranking",
    });

    expect(respuesta.statusCode).toBe(200);
    const datos = respuesta.json();
    expect(Array.isArray(datos)).toBe(true);
  });
});
