type Props = {
  title: string;
  value: number | string;
};

export function StatCard({ title, value }: Props) {
  return (
    <div className="rounded border border-line bg-white p-4">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-2 text-3xl font-semibold">{value}</div>
    </div>
  );
}

