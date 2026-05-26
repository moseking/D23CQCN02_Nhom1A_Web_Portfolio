"use client";

import { useState } from "react";

import { X } from "lucide-react";

import type { Category } from "../../types/admin";

interface CategoryModalProps {
  initial?: Category;

  onSave: (
    name: string,
    slug: string
  ) => void;

  onClose: () => void;
}

export default function CategoryModal({
  initial,
  onSave,
  onClose,
}: CategoryModalProps) {
  const [name, setName] =
    useState(
      initial?.name || ""
    );

  const [slug, setSlug] =
    useState(
      initial?.slug || ""
    );

  const handleNameChange = (
    value: string
  ) => {
    setName(value);

    if (!initial) {
      setSlug(
        value
          .toLowerCase()
          .trim()
          .replace(/\s+/g, "-")
          .replace(
            /[^a-z0-9-]/g,
            ""
          )
      );
    }
  };

  const handleSave = () => {
    if (!name || !slug) {
      return;
    }

    onSave(name, slug);
  };

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/40
        backdrop-blur-sm
        p-4
      "
    >
      <div
        className="
          w-full
          max-w-md
          rounded-2xl
          border
          border-[#E5E7E1]
          bg-white
          p-6
          shadow-2xl
        "
      >
        <div
          className="
            mb-5
            flex
            items-center
            justify-between
          "
        >
          <div>
            <h2
              className="
                text-lg
                font-semibold
                text-[#2C2C2C]
              "
            >
              {initial
                ? "Edit Category"
                : "Add Category"}
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-[#6B7280]
              "
            >
              Manage category information
            </p>
          </div>

          <button
            onClick={onClose}
            className="
              rounded-lg
              p-2
              transition-colors
              hover:bg-[#F6F7F2]
            "
          >
            <X
              className="
                h-4
                w-4
                text-[#6B7280]
              "
            />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label
              className="
                mb-1.5
                block
                text-sm
                font-medium
                text-[#4B5563]
              "
            >
              Category Name
            </label>

            <input
              value={name}
              onChange={(e) =>
                handleNameChange(
                  e.target.value
                )
              }
              placeholder="UI Design"
              className="
                w-full
                rounded-xl
                border
                border-[#E5E7E1]
                bg-white
                px-3
                py-2.5
                text-sm
                transition-all
                placeholder:text-[#9CA3AF]
                focus:border-[#9CAF88]
                focus:outline-none
                focus:ring-2
                focus:ring-[#9CAF88]/30
              "
            />
          </div>

          <div>
            <label
              className="
                mb-1.5
                block
                text-sm
                font-medium
                text-[#4B5563]
              "
            >
              Slug
            </label>

            <input
              value={slug}
              onChange={(e) =>
                setSlug(
                  e.target.value
                )
              }
              placeholder="ui-design"
              className="
                w-full
                rounded-xl
                border
                border-[#E5E7E1]
                bg-white
                px-3
                py-2.5
                text-sm
                font-mono
                transition-all
                placeholder:text-[#9CA3AF]
                focus:border-[#9CAF88]
                focus:outline-none
                focus:ring-2
                focus:ring-[#9CAF88]/30
              "
            />
          </div>
        </div>

        <div
          className="
            mt-6
            flex
            items-center
            gap-3
          "
        >
          <button
            onClick={onClose}
            className="
              flex-1
              rounded-xl
              border
              border-[#E5E7E1]
              py-2.5
              text-sm
              font-medium
              text-[#6B7280]
              transition-colors
              hover:bg-[#F6F7F2]
            "
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="
              flex-1
              rounded-xl
              bg-[#9CAF88]
              py-2.5
              text-sm
              font-medium
              text-white
              transition-colors
              hover:bg-[#7C8C6B]
            "
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}