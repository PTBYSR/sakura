"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface loginType {
  title?: string;
  subtitle?: React.ReactNode;
  subtext?: React.ReactNode;
}

const AuthLogin = ({ title, subtitle, subtext }: loginType) => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error: signInError } = await authClient.signIn.email({
        email,
        password,
        rememberMe,
        callbackURL: "/",
      }, {
        onSuccess: () => {
          router.push("/");
          router.refresh();
        },
        onError: (ctx) => {
          setError(ctx.error.message || "Failed to sign in");
          setLoading(false);
        },
      });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      // Better Auth social sign-in redirects automatically
      // The redirect URL is handled by Better Auth internally
      await authClient.signIn.social({
        provider: "google",
        callbackURL: window.location.origin + "/", // Redirect to home after successful sign-in
      });
      // Note: The browser will redirect automatically, so we don't need to handle navigation
      // The loading state will persist until redirect happens
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      setError(err.message || "Failed to sign in with Google");
      setLoading(false);
    }
  };

  return (
    <>
      {title && (
        <h2 className="text-3xl font-bold mb-2 text-white">
          {title}
        </h2>
      )}

      {subtext}

      {error && (
        <div className="mb-4 p-3 bg-red-600/20 border border-red-500 rounded-lg text-red-400 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => setError("")}
            className="text-red-400 hover:text-red-300 ml-2"
          >
            ×
          </button>
        </div>
      )}

      <form onSubmit={handleEmailSignIn} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-1">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
            disabled={loading}
            autoComplete="email"
            className="w-full"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-gray-300 mb-1">
            Password
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            required
            disabled={loading}
            autoComplete="current-password"
            className="w-full"
          />
        </div>
        <div className="flex items-center justify-between my-4">
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRememberMe(e.target.checked)}
              disabled={loading}
              className="w-4 h-4 rounded border-gray-600 bg-[#1e1e1e] text-[#EE66AA] focus:ring-[#EE66AA]"
            />
            <span>Remember this Device</span>
          </label>
          <Link
            href="/authentication/forgot-password"
            className="text-sm font-medium text-[#EE66AA] hover:underline"
          >
            Forgot Password ?
          </Link>
        </div>
        <Button
          variant="contained"
          color="primary"
          size="large"
          type="submit"
          disabled={loading}
          className="w-full"
        >
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <div className="my-6 flex items-center">
        <div className="flex-1 border-t border-gray-700"></div>
        <span className="px-4 text-sm text-gray-400">OR</span>
        <div className="flex-1 border-t border-gray-700"></div>
      </div>

      <Button
        variant="outlined"
        color="primary"
        size="large"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full mb-4"
      >
        Sign In with Google
      </Button>

      {subtitle}
    </>
  );
};

export default AuthLogin;
