"use client";
import React, { useState } from "react";
import { IconButton } from "@/components/ui/icon-button";
import { Eye } from "lucide-react";

export default function PreviewContainer() {
  const [status, setStatus] = useState("online");

  return (
    <div className="pt-4 pb-6 flex justify-center w-full h-full bg-[#111]">
      <div className="relative">
        {/* Status Switcher */}
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/10 rounded-md h-9 p-0.5 flex items-center">
            {(["online", "offline"] as const).map((val) => (
              <button
                key={val}
                className={`px-3 h-8 rounded ${status === val ? 'bg-white text-black' : 'text-gray-200'}`}
                onClick={() => setStatus(val)}
              >
                <span className="inline-flex items-center gap-2 text-sm">
                  <span className={`inline-block w-2 h-2 rounded-full ${val === 'online' ? 'bg-green-500 shadow-[0_0_6px_#44e054]' : 'bg-gray-500'}`} />
                  {val[0].toUpperCase() + val.slice(1)}
                </span>
              </button>
            ))}
          </div>

          {/* Preview Eye Button */}
          <IconButton className="bg-white/10 hover:bg-white/20 text-gray-200">
            <Eye className="h-5 w-5" />
          </IconButton>
        </div>

        {/* Chat Window Preview */}
        <div className="w-[300px] max-h-[500px] border border-dashed border-white/20 rounded-xl mx-auto flex flex-col justify-center text-center py-6">
          <div className="text-xs text-gray-300">
            Widget closed <span className="text-gray-300">+ Preview bubble enabled</span>
          </div>
        </div>

        {/* Bubble Preview (floating at bottom) */}
        <div className="flex justify-end mt-2 w-[300px] mx-auto">
          <div className="w-[70px] h-[70px] rounded-full bg-[#2081E2] text-white flex items-center justify-center p-1">
            {/* Bubble Icon */}
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M13.2222 4H17.9333C20.6 4 23.2667 5.06669 25.1333 7.02224C27 8.88891 28.1556 11.5556 28.1556 14.2222C28.1556 19.5556 24.0667 24 18.7333 24.4444V28.3556C18.7333 28.7111 18.5556 28.9778 18.2889 29.1556C18.1111 29.1556 18.1111 29.1556 17.9333 29.1556C17.7556 29.1556 17.4889 28.9778 17.3111 28.8L13.2222 24.3556C10.5556 24.3556 7.88888 23.2889 6.02222 21.3333C4.15555 19.3778 3 16.8 3 14.1334C3 8.53335 7.62222 4 13.2222 4ZM21.8445 15.7333C22.8222 15.7333 23.4444 15.1111 23.4444 14.1334C23.4444 13.1556 22.8222 12.5334 21.8445 12.5334C20.8667 12.5334 20.2444 13.1556 20.2444 14.1334C20.3333 15.1111 20.9556 15.7333 21.8445 15.7333ZM15.6222 15.7333C16.6 15.7333 17.2222 15.1111 17.2222 14.1334C17.2222 13.1556 16.6 12.5334 15.6222 12.5334C14.6445 12.5334 14.0222 13.1556 14.0222 14.1334C14.0222 15.1111 14.6445 15.7333 15.6222 15.7333ZM9.31112 15.7333C10.2889 15.7333 10.9111 15.1111 10.9111 14.1334C10.9111 13.1556 10.2889 12.5334 9.31112 12.5334C8.33334 12.5334 7.71113 13.1556 7.71113 14.1334C7.71113 15.1111 8.33334 15.7333 9.31112 15.7333Z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
