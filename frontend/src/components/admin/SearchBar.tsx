"use client";

import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;

  onChange: (
    value: string
  ) => void;

  placeholder: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder,
}: SearchBarProps) {
  return (
    <div className="relative">
      <Search
        className="
          absolute
          left-3
          top-1/2
          -translate-y-1/2
          w-4
          h-4
          text-[#9CA3AF]
        "
      />

      <input
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        className="
          w-full
          pl-9
          pr-4
          py-2
          text-sm
          bg-[#F6F7F2]
          border
          border-[#E5E7E1]
          rounded-xl
          transition-all
          placeholder:text-[#9CA3AF]
          focus:outline-none
          focus:ring-2
          focus:ring-[#9CAF88]/30
          focus:border-[#9CAF88]
        "
      />
    </div>
  );
}