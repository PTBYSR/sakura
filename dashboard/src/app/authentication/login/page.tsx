"use client";
import Link from "next/link";
import Logo from "@/app/(DashboardLayout)/layout/shared/logo/Logo";
import AuthLogin from "../auth/AuthLogin";

const Login2 = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#121212]">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: "radial-gradient(#d2f1df, #d3d7fa, #bad8f4)",
          backgroundSize: "400% 400%",
          animation: "gradient 15s ease infinite",
        }}
      />
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-[#1e1e1e] rounded-lg shadow-2xl p-8 w-full border border-gray-700">
          <div className="flex items-center justify-center mb-6">
            <Logo />
          </div>
          <AuthLogin
            subtext={<div className="text-center text-gray-400 mb-2"></div>}
            subtitle={
              <div className="flex items-center justify-center gap-2 mt-6">
                <p className="text-gray-400 text-base font-medium">
                  New to Sakura?
                </p>
                <Link
                  href="/authentication/register"
                  className="text-sakura-500 font-medium hover:text-sakura-600 hover:underline no-underline transition-colors"
                >
                  Create an account
                </Link>
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
};
export default Login2;
