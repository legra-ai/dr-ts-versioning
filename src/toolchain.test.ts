import { execFileSync } from "node:child_process"
import { ESLint } from "eslint"
import { getFileInfo } from "prettier"
import { describe, expect, it } from "vitest"

describe("repository toolchain", () => {
  it("lints the public entry point with the installed compiler", async () => {
    const results = await new ESLint().lintFiles(["src/index.ts"])
    expect(
      results.reduce((count, result) => count + result.errorCount, 0)
    ).toBe(0)
  })

  it("excludes pnpm artifacts from ESLint", async () => {
    expect(await new ESLint().isPathIgnored(".pnpm/cache-probe.js")).toBe(true)
  })

  it("excludes pnpm artifacts from formatting", async () => {
    const info = await getFileInfo(".pnpm/lock.yaml", {
      ignorePath: ".prettierignore",
    })
    expect(info.ignored).toBe(true)
  })

  it("keeps pnpm artifacts out of Git", () => {
    expect(
      execFileSync("git", ["check-ignore", ".pnpm/lock.yaml"], {
        encoding: "utf8",
      }).trim()
    ).toBe(".pnpm/lock.yaml")
  })
})
