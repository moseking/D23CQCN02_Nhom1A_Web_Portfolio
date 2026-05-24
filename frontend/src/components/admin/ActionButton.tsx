interface ActionButtonProps {
  icon: any;
  label: string;
  onClick: () => void;
  variant?: "default" | "danger";
}

export default function ActionButton({
  icon: Icon,
  label,
  onClick,
  variant = "default",
}: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`p-1.5 rounded-lg transition-all ${
        variant === "danger"
          ? "hover:bg-[#FFEBEB] text-[#9B9B9B] hover:text-[#C62828]"
          : "hover:bg-[#F0F4EC] text-[#9B9B9B] hover:text-[#7C8C6B]"
      }`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}