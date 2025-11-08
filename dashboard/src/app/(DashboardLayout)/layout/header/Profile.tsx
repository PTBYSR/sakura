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
  const menuRef = useRef<HTMLDivElement>(null);
  const { data: session } = authClient.useSession();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

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

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative inline-flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
          isOpen ? "text-[#EE66AA]" : "text-gray-300"
        } hover:bg-gray-700`}
        aria-label="show user menu"
        aria-controls="msgs-menu"
        aria-haspopup="true"
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
        <div className="absolute right-0 top-full mt-2 w-[220px] bg-[#1e1e1e] border border-gray-700 rounded-lg shadow-lg z-[1300] overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-700">
            <p className="text-sm font-semibold text-white">{userName}</p>
            {userEmail && (
              <p className="text-xs text-gray-400 mt-1">{userEmail}</p>
            )}
          </div>

          <div className="py-1">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
            >
              <User className="w-5 h-5 mr-3" />
              My Profile
            </Link>
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
            >
              <Mail className="w-5 h-5 mr-3" />
              My Account
            </Link>
            <Link
              href="/tasks"
              onClick={() => setIsOpen(false)}
              className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
            >
              <ListChecks className="w-5 h-5 mr-3" />
              My Tasks
            </Link>
          </div>

          <div className="mt-1 py-2 px-4 border-t border-gray-700">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-sm font-medium text-[#EE66AA] border-2 border-[#EE66AA] rounded-lg hover:bg-[#EE66AA]/10 transition-colors"
            >
              <LogOut className="w-4 h-4 inline mr-2" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
