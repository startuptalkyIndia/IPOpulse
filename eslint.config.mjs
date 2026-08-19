/**
 * ESLint flat config.
 *
 * `eslint-config-next@16` already ships flat-config ARRAYS from
 * `./core-web-vitals` and `./typescript`, so they are spread in directly.
 * They used to be loaded through `FlatCompat.extends()`, which is the shim for
 * OLD eslintrc-style configs — handed an already-flat config it failed schema
 * validation, and then the validator's own error formatter crashed on the
 * circular plugin object ("Converting circular structure to JSON"). The result
 * was that `npm run lint` and `npx eslint <any file>` both died before linting a
 * single line, so the lint gate silently was not running at all.
 */

import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "public/**",
      "prisma/generated/**",
      "next-env.d.ts",
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
];

export default eslintConfig;
