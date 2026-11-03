/* Calculator math, split by topic into ./math-modules (pure move, no logic change).
   This file stays as the single import path for the registry and tests. */
export * from "./math-modules/investment";
export * from "./math-modules/loan";
export * from "./math-modules/tax";
export * from "./math-modules/trading";
export * from "./math-modules/global";
