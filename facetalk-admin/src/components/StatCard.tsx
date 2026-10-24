import type { IconType } from "react-icons";
import Skeleton from "./Skeleton";

type StatCardProps = {
  label: string;
  value?: number; // undefined while loading
  icon: IconType;
  accent: string; // colour classes for the icon circle
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${accent}`}
        >
          <Icon size={20} />
        </span>
      </div>

      {value === undefined ? (
        <Skeleton className="mt-4 h-9 w-16" />
      ) : (
        <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
      )}
    </div>
  );
}