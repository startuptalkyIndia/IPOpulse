/**
 * Unit tests for lib/feature-flags.ts — pure logic paths.
 * DB-dependent functions (loadFlags, isFeatureEnabled, seedFlagDefinitions)
 * are not tested here to avoid requiring a real DB in unit tests.
 * The FLAG_DEFINITIONS array and clearFeatureFlagCache are tested.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { FLAG_DEFINITIONS, clearFeatureFlagCache } from "@/lib/feature-flags";

describe("FLAG_DEFINITIONS", () => {
  it("contains at least 10 flags", () => {
    expect(FLAG_DEFINITIONS.length).toBeGreaterThanOrEqual(10);
  });

  it("every flag has a non-empty key", () => {
    for (const def of FLAG_DEFINITIONS) {
      expect(def.key.trim()).not.toBe("");
    }
  });

  it("every flag key is unique", () => {
    const keys = FLAG_DEFINITIONS.map((d) => d.key);
    const unique = new Set(keys);
    expect(unique.size).toBe(keys.length);
  });

  it("every flag has a valid category", () => {
    const validCategories = new Set(["community", "revenue", "seo", "ai", "data", "ux"]);
    for (const def of FLAG_DEFINITIONS) {
      expect(validCategories.has(def.category), `unknown category: ${def.category}`).toBe(true);
    }
  });

  it("every flag has a non-empty label and description", () => {
    for (const def of FLAG_DEFINITIONS) {
      expect(def.label.trim()).not.toBe("");
      expect(def.description.trim()).not.toBe("");
    }
  });

  it("defaultEnabled is a boolean for every flag", () => {
    for (const def of FLAG_DEFINITIONS) {
      expect(typeof def.defaultEnabled).toBe("boolean");
    }
  });

  it("has expected flags for core features", () => {
    const keys = new Set(FLAG_DEFINITIONS.map((d) => d.key));
    expect(keys.has("community.discussion")).toBe(true);
    expect(keys.has("ai.drhp_search")).toBe(true);
    expect(keys.has("ux.search_palette")).toBe(true);
  });
});

describe("clearFeatureFlagCache", () => {
  it("executes without error", () => {
    expect(() => clearFeatureFlagCache()).not.toThrow();
  });

  it("is idempotent — can be called multiple times", () => {
    expect(() => {
      clearFeatureFlagCache();
      clearFeatureFlagCache();
    }).not.toThrow();
  });
});
