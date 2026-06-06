"use client";

/**
 * AsyncErrorBoundary — wraps async/client UI; shows a plain-English retry card
 * instead of a stack trace when data fetching fails.
 *
 * Usage:
 *   <AsyncErrorBoundary>
 *     <SomeClientComponentThatFetches />
 *   </AsyncErrorBoundary>
 */

import { Component, type ReactNode } from "react";
import { RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  /** Optional section name shown in the error copy e.g. "news feed". */
  section?: string;
}

interface State {
  error: Error | null;
}

export class AsyncErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    // Log to console in dev; in prod this would go to Sentry.
    console.error("[AsyncErrorBoundary]", error);
  }

  render() {
    if (this.state.error) {
      const { section = "this section" } = this.props;
      return (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-6 py-8 text-center">
          <p className="text-sm font-medium text-rose-800">
            We couldn't load {section}. This is usually a temporary glitch.
          </p>
          <button
            type="button"
            onClick={() => this.setState({ error: null })}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-rose-700 shadow-sm ring-1 ring-rose-200 hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-400"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AsyncErrorBoundary;
