export function StatusBadge({ status }: { status: "online" | "offline" }) {
  return (
    <span
      className={`inline-flex h-6 items-center rounded px-2 text-xs font-medium ${
        status === "online" ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"
      }`}
    >
      {status}
    </span>
  );
}

