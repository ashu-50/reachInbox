import { describe, it, expect, vi } from "vitest";
import request from "supertest";

// The health check itself has no DB dependency, but importing app.ts pulls
// in the full route tree (which does use Prisma). We mock Prisma here so
// this test doesn't require a live database connection.
vi.mock("../src/config/prisma.js", () => ({
  prisma: {}
}));

const { createApp } = await import("../src/app.js");

describe("GET /health", () => {
  it("returns the standard success envelope with status ok", async () => {
    const app = createApp();
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, data: { status: "ok" } });
  });
});

describe("unknown routes", () => {
  it("returns a 404 in the standard error envelope, never /api/api", async () => {
    const app = createApp();
    const res = await request(app).get("/api/this-does-not-exist");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("ROUTE_NOT_FOUND");
  });
});
