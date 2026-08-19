/**
 * Unit tests for isDeadSymbol — the classifier that decides whether a Yahoo
 * fetch failure is permanent (ticker renamed/demerged/delisted) or transient.
 *
 * Why it matters: a failed fetch never stamps `fundamentalsAt`, so a dead
 * symbol requeues every day forever. Counting those as errors made the whole
 * job report FAILED on any day the queue held nothing else — which is how a
 * healthy job looked broken for months and hid real failures.
 */

import { describe, it, expect } from "vitest";
import { isDeadSymbol } from "@/crons/jobs/yahoo-fundamentals";

describe("isDeadSymbol", () => {
  it("treats a missing quote as dead (the real message is lower-case)", () => {
    // The old filter tested for the string "Not Found", which never matched
    // Yahoo's actual "Quote not found for symbol: X" — so the suppression it
    // was written for never worked.
    expect(isDeadSymbol("Quote not found for symbol: TATAMOTORS.NS")).toBe(true);
  });

  it("treats a schema-validation failure as dead", () => {
    // What a renamed ticker returns: ZOMATO.NS after the Eternal rename fails
    // validation rather than 404-ing, but it is just as permanently gone.
    expect(isDeadSymbol("Failed Yahoo Schema validation")).toBe(true);
  });

  it("treats a missing-fundamentals response as dead", () => {
    expect(isDeadSymbol("No fundamentals data available")).toBe(true);
  });

  it("treats network and rate-limit failures as transient, so they still fail the run", () => {
    expect(isDeadSymbol("fetch failed")).toBe(false);
    expect(isDeadSymbol("Too Many Requests")).toBe(false);
    expect(isDeadSymbol("The operation was aborted due to timeout")).toBe(false);
    expect(isDeadSymbol("socket hang up")).toBe(false);
  });
});
