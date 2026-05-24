"use client";

import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  message: string;

  onConfirm: () => void;

  onCancel: () => void;
}

export default function ConfirmModal({
  message,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/30
        backdrop-blur-sm
        p-4
      "
    >
      <div
        className="
          w-full
          max-w-sm
          rounded-2xl
          bg-white
          p-6
          shadow-2xl
        "
      >
        <div
          className="
            flex
            items-start
            gap-4
          "
        >
          <div
            className="
              flex
              h-10
              w-10
              flex-shrink-0
              items-center
              justify-center
              rounded-full
              bg-[#FEF3C7]
            "
          >
            <AlertTriangle
              className="
                h-5
                w-5
                text-[#F59E0B]
              "
            />
          </div>

          <div>
            <h3
              className="
                text-sm
                font-semibold
                text-[#2C2C2C]
              "
            >
              Xác nhận hành động
            </h3>

            <p
              className="
                mt-1
                text-sm
                text-[#6B7280]
              "
            >
              {message}
            </p>
          </div>
        </div>

        <div
          className="
            mt-5
            flex
            gap-3
          "
        >
          <button
            onClick={onCancel}
            className="
              flex-1
              rounded-xl
              border
              border-[#E5E7E1]
              py-2
              text-sm
              text-[#6B7280]
              transition-colors
              hover:bg-[#F6F7F2]
            "
          >
            Hủy
          </button>

          <button
            onClick={onConfirm}
            className="
              flex-1
              rounded-xl
              bg-[#9CAF88]
              py-2
              text-sm
              font-medium
              text-white
              transition-colors
              hover:bg-[#7C8C6B]
            "
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}