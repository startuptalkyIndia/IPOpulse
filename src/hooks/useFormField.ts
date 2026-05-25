// Source: _shared/templates/hooks/useFormField.ts — do not edit here, edit in _shared/ and re-propagate.
// _shared/templates/hooks/useFormField.ts
// Lightweight Zod-aware form field state — pairs with FormField.tsx.
//
// Copy to: src/hooks/useFormField.ts
//
// Deps: react, zod

"use client";

import * as React from "react";
import type { ZodType } from "zod";

export interface UseFormFieldOptions<T> {
  /** Initial value. */
  initial: T;
  /** Zod schema to validate against on blur (and on demand). */
  schema?: ZodType<T>;
  /** Validate on every change instead of only on blur. Default: false. */
  validateOnChange?: boolean;
}

export interface UseFormFieldReturn<T> {
  value: T;
  setValue: (v: T) => void;
  error: string | null;
  touched: boolean;
  /** Bind directly to <input>/<textarea>: onChange + onBlur. */
  bind: {
    value: T extends string ? string : T;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onBlur: () => void;
  };
  /** Re-run validation (e.g. on submit). Returns true if valid. */
  validate: () => boolean;
  reset: (v?: T) => void;
}

/**
 * useFormField — single-field Zod-aware controlled state.
 *
 * @example
 *   import { z } from "zod";
 *   const emailSchema = z.string().email("Enter a valid email");
 *   const email = useFormField({ initial: "", schema: emailSchema });
 *   <FormField label="Email" name="email" {...email.bind} error={email.error} />
 */
export function useFormField<T>(
  options: UseFormFieldOptions<T>,
): UseFormFieldReturn<T> {
  const { initial, schema, validateOnChange = false } = options;
  const [value, setValueState] = React.useState<T>(initial);
  const [error, setError] = React.useState<string | null>(null);
  const [touched, setTouched] = React.useState(false);

  const runValidation = React.useCallback(
    (val: T): boolean => {
      if (!schema) {
        setError(null);
        return true;
      }
      const parsed = schema.safeParse(val);
      if (parsed.success) {
        setError(null);
        return true;
      }
      setError(parsed.error.issues[0]?.message ?? "Invalid value");
      return false;
    },
    [schema],
  );

  const setValue = React.useCallback(
    (v: T) => {
      setValueState(v);
      if (validateOnChange && touched) runValidation(v);
    },
    [validateOnChange, touched, runValidation],
  );

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setValue(e.target.value as unknown as T);
  };

  const onBlur = () => {
    setTouched(true);
    runValidation(value);
  };

  const validate = () => {
    setTouched(true);
    return runValidation(value);
  };

  const reset = (v: T = initial) => {
    setValueState(v);
    setError(null);
    setTouched(false);
  };

  return {
    value,
    setValue,
    error,
    touched,
    bind: {
      value: value as UseFormFieldReturn<T>["bind"]["value"],
      onChange,
      onBlur,
    },
    validate,
    reset,
  };
}
