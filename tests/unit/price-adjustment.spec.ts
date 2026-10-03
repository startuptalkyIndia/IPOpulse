import { describe, it, expect } from "vitest";
import { cumulativeFactorAfter, type BonusSplitAction } from "@/lib/price";

describe("cumulativeFactorAfter", () => {
  it("returns 1 (no adjustment) when there are no actions", () => {
    expect(cumulativeFactorAfter([], new Date("2026-01-01"))).toBe(1);
  });

  it("returns 1 for a date AFTER the action's exDate (already comparable to today)", () => {
    const actions: BonusSplitAction[] = [{ exDate: new Date("2025-08-26"), factor: 0.5 }];
    expect(cumulativeFactorAfter(actions, new Date("2025-09-01"))).toBe(1);
  });

  it("applies the factor for a date BEFORE the action's exDate — IRB's real 2026-03-30 1:1 bonus", () => {
    const actions: BonusSplitAction[] = [{ exDate: new Date("2026-03-30"), factor: 0.5 }];
    // A raw close from before the bonus must be halved to compare to today's post-bonus terms.
    expect(cumulativeFactorAfter(actions, new Date("2026-01-15"))).toBe(0.5);
  });

  it("returns 1 exactly ON the exDate (the ex-date's own row is already the post-event price)", () => {
    const actions: BonusSplitAction[] = [{ exDate: new Date("2026-03-30"), factor: 0.5 }];
    expect(cumulativeFactorAfter(actions, new Date("2026-03-30"))).toBe(1);
  });

  it("compounds multiple actions for a date before both — e.g. IRB's 2023 10:1 split AND 2026 1:1 bonus", () => {
    const actions: BonusSplitAction[] = [
      { exDate: new Date("2023-02-22"), factor: 0.1 },
      { exDate: new Date("2026-03-30"), factor: 0.5 },
    ];
    // A price from before BOTH events needs both factors applied: 0.1 * 0.5 = 0.05
    expect(cumulativeFactorAfter(actions, new Date("2022-01-01"))).toBeCloseTo(0.05, 6);
    // A price between the two events only needs the later one: 0.5
    expect(cumulativeFactorAfter(actions, new Date("2024-01-01"))).toBe(0.5);
  });
});
