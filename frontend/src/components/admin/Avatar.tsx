interface AvatarProps {
  initials: string;
  size?: "sm" | "md";
}

export default function Avatar({
  initials,
  size = "sm",
}: AvatarProps) {
  const s =
    size === "sm"
      ? "w-8 h-8 text-xs"
      : "w-10 h-10 text-sm";

  return (
    <div
      className={`${s} rounded-full bg-gradient-to-br from-[#9CAF88] to-[#7C8C6B] flex items-center justify-center text-white font-semibold flex-shrink-0`}
    >
      {initials}
    </div>
  );
}