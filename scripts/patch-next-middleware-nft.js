#!/usr/bin/env node
/**
 * Workaround for Next.js 16.2.6 bug:
 *   `output: "standalone"` + root `middleware.ts` build crashes with
 *   `ENOENT: no such file or directory, open '.../middleware.js.nft.json'`.
 *
 * Why: in Next 16 the build code (build/index.js) renames proxy.js.nft.json ->
 * middleware.js.nft.json for the new `proxy.ts` convention. With Turbopack or
 * with legacy `middleware.ts` no NFT trace file is produced, but the rename /
 * readFile path can still execute and throw.
 *
 * This script patches:
 *   - node_modules/next/dist/build/index.js — wraps the rename + readFile block
 *     in a try/catch that swallows ENOENT.
 *   - node_modules/next/dist/build/utils.js — makes `handleTraceFiles` return
 *     early when the trace file is missing (defence-in-depth).
 *
 * Idempotent. Safe to re-run. Logs are prefixed for grep-ability.
 *
 * Invoke from project root:
 *   node scripts/patch-next-middleware-nft.js
 */

const fs = require("fs");
const path = require("path");

const TAG_INDEX = "IPOPULSE_NFT_PATCH";
const TAG_UTILS = "IPOPULSE_TRACE_PATCH";

function patchIndexJs() {
  const p = path.join("node_modules", "next", "dist", "build", "index.js");
  if (!fs.existsSync(p)) {
    console.error(`[${TAG_INDEX}] not found: ${p} — skipping`);
    return;
  }
  let s = fs.readFileSync(p, "utf8");
  if (s.indexOf(TAG_INDEX) !== -1) {
    console.log(`[${TAG_INDEX}] already applied`);
    return;
  }
  const needle = "if (proxyFilePath && bundler !== _bundler.Bundler.Turbopack) {";
  const idx = s.indexOf(needle);
  if (idx === -1) {
    console.error(`[${TAG_INDEX}] needle not found — skipping (Next.js internals may have moved)`);
    return;
  }
  const rest = s.slice(idx);
  const closeMarker = "\n            }";
  const closeIdx = rest.indexOf(closeMarker);
  if (closeIdx === -1) {
    console.error(`[${TAG_INDEX}] close brace not found — skipping`);
    return;
  }
  const before = s.slice(0, idx) + `/* ${TAG_INDEX} */ try { `;
  const patched =
    before +
    rest.slice(0, closeIdx + closeMarker.length) +
    " } catch (e) { if (e && e.code !== 'ENOENT') throw e; }" +
    rest.slice(closeIdx + closeMarker.length);
  fs.writeFileSync(p, patched);
  console.log(`[${TAG_INDEX}] applied to ${p}`);
}

function patchUtilsJs() {
  const p = path.join("node_modules", "next", "dist", "build", "utils.js");
  if (!fs.existsSync(p)) {
    console.error(`[${TAG_UTILS}] not found: ${p} — skipping`);
    return;
  }
  let s = fs.readFileSync(p, "utf8");
  if (s.indexOf(TAG_UTILS) !== -1) {
    console.log(`[${TAG_UTILS}] already applied`);
    return;
  }
  const needle = "async function handleTraceFiles(traceFilePath) {";
  const idx = s.indexOf(needle);
  if (idx === -1) {
    console.error(`[${TAG_UTILS}] needle not found — skipping`);
    return;
  }
  const insertAt = idx + needle.length;
  const patched =
    s.slice(0, insertAt) +
    ` /* ${TAG_UTILS} */ if (!require('fs').existsSync(traceFilePath)) { return; }` +
    s.slice(insertAt);
  fs.writeFileSync(p, patched);
  console.log(`[${TAG_UTILS}] applied to ${p}`);
}

patchIndexJs();
patchUtilsJs();
