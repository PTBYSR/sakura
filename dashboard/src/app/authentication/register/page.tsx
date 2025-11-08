"use client";
import Link from "next/link";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import Logo from "@/app/(DashboardLayout)/layout/shared/logo/Logo";
import AuthRegister from "../auth/AuthRegister";

const Register2 = () => (
  <PageContainer title="Register" description="this is Register page">
    <div className="relative min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#d2f1df,#d3d7fa,#bad8f4)] animate-[gradient_15s_ease_infinite]" />
      <div className="relative z-10 w-full max-w-[500px] rounded-lg border border-gray-800 bg-[#1e1e1e] p-6 shadow-xl">
        <div className="flex items-center justify-center mb-4">
          <Logo />
        </div>
        <AuthRegister
          subtext={<p className="text-center text-sm text-gray-400 mb-1"></p>}
          subtitle={
            <div className="flex items-center justify-center gap-2 mt-3 text-sm">
              <span className="text-gray-400">Already have an Account?</span>
              <Link className="font-medium text-[#EE66AA] hover:underline" href="/authentication/login">
                Sign In
              </Link>
            </div>
          }
        />
      </div>
    </div>
  </PageContainer>
);

export default Register2;
