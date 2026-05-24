interface StatsCardProps {
  icon: any;
  label: string;
  value: number;
  sub: string;
  color: string;
}

export default function StatsCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E5E7E1] flex items-center gap-4">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}
      >
        <Icon className="w-5 h-5" />
      </div>

      <div>
        <p className="text-2xl font-bold text-[#2C2C2C]">
          {value.toLocaleString()}
        </p>

        <p className="text-xs text-[#6B7280] mt-0.5">
          {label}
        </p>

        <p className="text-xs text-[#9CAF88] mt-0.5">
          {sub}
        </p>
      </div>
    </div>
  );
}