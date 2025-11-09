"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { User, Mail, ListChecks, LogOut } from "lucide-react";

const Profile = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { data: session } = authClient.useSession();

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/authentication/login");
          router.refresh();
        },
      },
    });
    setIsOpen(false);
  };

  const user = session?.user;
  const userName = user?.name || user?.email?.split("@")[0] || "User";
  const userEmail = user?.email || "";
  const userImage = user?.image || "/images/profile/user-1.jpg";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const openTooltip = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsOpen(true);
  };

  const closeTooltip = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 120);
  };

  return (
    <div
      className="relative"
      onMouseEnter={openTooltip}
      onMouseLeave={closeTooltip}
      onFocus={openTooltip}
      onBlur={() => setIsOpen(false)}
    >
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`relative inline-flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
          isOpen ? "text-[#EE66AA]" : "text-gray-300"
        } hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EE66AA]`}
        aria-label="Show user menu"
        aria-haspopup="true"
        aria-expanded={isOpen}
        type="button"
      >
        {userImage ? (
          <Image
            src={userImage}
            alt={userName}
            width={35}
            height={35}
            className="rounded-full"
          />
        ) : (
          <div className="w-[35px] h-[35px] rounded-full bg-[#EE66AA] flex items-center justify-center text-white text-sm font-semibold">
            {userInitials}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-[110%] w-[240px] bg-[#1f1f1f] border border-gray-700 rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.45)] z-[1300] overflow-hidden">
          <div className="px-4 py-3">
            <p className="text-sm font-semibold text-white">{userName}</p>
            {userEmail && (
              <p className="text-xs text-gray-400 mt-1">{userEmail}</p>
            )}
          </div>

          <div className="px-4 py-3 border-t border-gray-700">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-[#EE66AA] rounded-lg hover:bg-[#f17ab3] transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
;

export default Profile;
