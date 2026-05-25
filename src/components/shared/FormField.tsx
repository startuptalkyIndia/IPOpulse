// Source: _shared/templates/components/FormField.tsx — do not edit here, edit in _shared/ and re-propagate.
// _shared/templates/components/FormField.tsx
// Zod-aware input with inline validation error display.
// Pairs with hooks/useFormField.ts.
//
// Copy to: src/components/shared/FormField.tsx
//
// Deps: react, zod

"use client";

import * as React from "react";
import type { ZodType } from "zod";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;
type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export interface FormFieldProps
  extends Omit<InputProps, "onChange" | "value" | "name"> {
  /** Field name (also used as input id when none provided). */
  name: string;
  /** Visible label. */
  label: string;
  /** Helper text shown below input when no error. */
  hint?: string;
  /** Externally controlled value. */
  value: string;
  /** Change handler — fires on every keystroke. */
  onChange: (value: string) => void;
  /** Optional Zod schema. Auto-runs on blur. */
  schema?: ZodType<string>;
  /** Externally controlled error (overrides internal). */
  error?: string | null;
  /** Render as <textarea> instead of <input>. */
  multiline?: boolean;
  /** Rows when multiline. */
  rows?: number;
  /** Mark as required (adds * + aria-required). */
  required?: boolean;
}

const cx = (...classes: Array<string | undefined | false>) =>
  classes.filter(Boolean).join(" ");

/**
 * FormField — controlled input + inline Zod error display.
 *
 * @example
 *   const [email, setEmail] = useState("");
 *   <FormField
 *     name="email"
 *     label="Email"
 *     value={email}
 *     onChange={setEmail}
 *     schema={z.string().email("Enter a valid email")}
 *     required
 *   />
 */
export function FormField({
  name,
  label,
  hint,
  value,
  onChange,
  schema,
  error: externalError,
  multiline = false,
  rows = 4,
  required = false,
  className,
  id,
  type = "text",
  ...rest
}: FormFieldProps) {
  const [internalError, setInternalError] = React.useState<string | null>(null);
  const [touched, setTouched] = React.useState(false);
  const inputId = id ?? name;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  const error = externalError ?? internalError;

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setTouched(true);
    if (schema) {
      const parsed = schema.safeParse(e.target.value);
      setInternalError(parsed.success ? null : parsed.error.issues[0]?.message ?? "Invalid value");
    }
    rest.onBlur?.(e as React.FocusEvent<HTMLInputElement>);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    onChange(e.target.value);
    // Clear stale error as soon as user edits.
    if (touched && internalError) setInternalError(null);
  };

  const inputClass = cx(
    "block w-full rounded-xl border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0",
    error
      ? "border-red-400 focus:border-red-500 focus:ring-red-500/30"
      : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/30",
    className,
  );

  return (
    <div className="space-y-1">
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-slate-700"
      >
        {label}
        {required ? <span className="ml-0.5 text-red-500">*</span> : null}
      </label>
      {multiline ? (
        <textarea
          {...(rest as unknown as TextareaProps)}
          id={inputId}
          name={name}
          value={value}
          rows={rows}
          required={required}
          aria-invalid={!!error}
          aria-required={required || undefined}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          onChange={handleChange}
          onBlur={handleBlur}
          className={inputClass}
        />
      ) : (
        <input
          {...rest}
          id={inputId}
          name={name}
          type={type}
          value={value}
          required={required}
          aria-invalid={!!error}
          aria-required={required || undefined}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          onChange={handleChange}
          onBlur={handleBlur}
          className={inputClass}
        />
      )}
      {error ? (
        <p id={errorId} role="alert" className="text-xs text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export default FormField;
