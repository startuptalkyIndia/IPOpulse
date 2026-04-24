import { statusBadgeClass, statusLabel, type IpoStatus } from "@/lib/ipo";

export function IpoStatusBadge({ status }: { status: IpoStatus }) {
  return <span className={statusBadgeClass(status)}>{statusLabel(status)}</span>;
}
