import { spawnSync } from "node:child_process";
import { chmodSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const SCRIPT = join(__dirname, "prisma-migrate-deploy.sh");
const FIJA = "postgresql://user:secreto@ep-fija.example.com/db";
const RAMA = "postgresql://user:secreto@ep-rama.example.com/db";

let stubDir: string;

beforeAll(() => {
  // `npx` falso: imprime el DIRECT_URL que recibiria prisma migrate deploy.
  stubDir = mkdtempSync(join(tmpdir(), "migrate-stub-"));
  const npx = join(stubDir, "npx");
  writeFileSync(npx, '#!/usr/bin/env bash\necho "DIRECT_URL_USADO=$DIRECT_URL"\n');
  chmodSync(npx, 0o755);
});

afterAll(() => {
  rmSync(stubDir, { recursive: true, force: true });
});

function correr(env: Record<string, string>) {
  const r = spawnSync("bash", [SCRIPT], {
    env: { NODE_ENV: "test", PATH: `${stubDir}${delimiter}${process.env.PATH ?? ""}`, ...env },
    encoding: "utf8",
  });
  const usado = /DIRECT_URL_USADO=(.*)/.exec(r.stdout)?.[1]?.trim();
  return { status: r.status, usado, stdout: r.stdout };
}

describe("prisma-migrate-deploy.sh", () => {
  it("en preview con DATABASE_URL_UNPOOLED migra contra esa rama", () => {
    const r = correr({ VERCEL_ENV: "preview", DIRECT_URL: FIJA, DATABASE_URL_UNPOOLED: RAMA });
    expect(r.status).toBe(0);
    expect(r.usado).toBe(RAMA);
  });

  it("en production no cambia DIRECT_URL", () => {
    const r = correr({ VERCEL_ENV: "production", DIRECT_URL: FIJA, DATABASE_URL_UNPOOLED: RAMA });
    expect(r.status).toBe(0);
    expect(r.usado).toBe(FIJA);
  });

  it("en preview sin DATABASE_URL_UNPOOLED no cambia DIRECT_URL", () => {
    const r = correr({ VERCEL_ENV: "preview", DIRECT_URL: FIJA });
    expect(r.usado).toBe(FIJA);
  });

  it("en preview con DATABASE_URL_UNPOOLED vacia no cambia DIRECT_URL", () => {
    const r = correr({ VERCEL_ENV: "preview", DIRECT_URL: FIJA, DATABASE_URL_UNPOOLED: "" });
    expect(r.usado).toBe(FIJA);
  });

  it("fuera de Vercel (sin VERCEL_ENV) no cambia DIRECT_URL", () => {
    const r = correr({ DIRECT_URL: FIJA, DATABASE_URL_UNPOOLED: RAMA });
    expect(r.usado).toBe(FIJA);
  });

  it("registra solo el host, nunca usuario ni contrasena", () => {
    const r = correr({ VERCEL_ENV: "preview", DIRECT_URL: FIJA, DATABASE_URL_UNPOOLED: RAMA });
    // El npx falso imprime la URL completa; se revisa solo la linea que escribe el script.
    const linea = r.stdout.split(/\r?\n/).find((l) => l.startsWith("prisma migrate deploy contra:"));
    expect(linea).toBe("prisma migrate deploy contra: ep-rama.example.com");
  });
});
