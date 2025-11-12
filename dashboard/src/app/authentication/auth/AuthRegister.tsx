"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { IconEye, IconEyeOff } from '@tabler/icons-react';

import CustomTextField from '@/app/(DashboardLayout)/components/forms/theme-elements/CustomTextField';
import { Button } from '@/components/ui/button';

interface registerType {
    title?: string;
    subtitle?: React.ReactNode;
    subtext?: React.ReactNode;
}

const AuthRegister = ({ title, subtitle, subtext }: registerType) => {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleEmailSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validate passwords match
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        // Validate password length
        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            setLoading(false);
            return;
        }

        try {
            const { error: signUpError } = await authClient.signUp.email({
                name,
                email,
                password,
                callbackURL: '/',
            }, {
                onSuccess: () => {
                    router.push('/');
                    router.refresh();
                },
                onError: (ctx) => {
                    setError(ctx.error.message || 'Failed to create account');
                    setLoading(false);
                },
            });
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
            setLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
        setError('');
        setLoading(true);
        try {
            // Better Auth social sign-in redirects automatically
            // The redirect URL is handled by Better Auth internally
            await authClient.signIn.social({
                provider: 'google',
                callbackURL: typeof window !== 'undefined' ? window.location.origin + '/' : '/',
            });
            // Note: The browser will redirect automatically, so we don't need to handle navigation
            // The loading state will persist until redirect happens
        } catch (err: any) {
            console.error('Google sign-up error:', err);
            setError(err.message || 'Failed to sign up with Google');
            setLoading(false);
        }
    };

    return (
        <>
            {title ? (
                <h2 className="text-2xl font-bold mb-2">{title}</h2>
            ) : null}

            {subtext}

            {error && (
                <div className="mb-2 rounded-md border border-red-800/40 bg-red-900/30 text-red-200 p-3">
                    <div className="flex items-start justify-between gap-2">
                        <p className="text-sm">{error}</p>
                        <button
                          type="button"
                          className="text-red-300 hover:text-red-200"
                          onClick={() => setError('')}
                          aria-label="Dismiss error"
                        >
                          ×
                        </button>
                    </div>
                </div>
            )}

            <form onSubmit={handleEmailSignUp}>
                <div>
                    <div className="mb-6 space-y-6">
                        <label htmlFor="name" className="block text-sm font-semibold text-gray-100 mb-1">Name</label>
                        <CustomTextField
                            id="name"
                            fullWidth
                            value={name}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                            required
                            disabled={loading}
                            autoComplete="name"
                            placeholder="Your full name"
                        />

                        <label htmlFor="email" className="block text-sm font-semibold text-gray-100 mb-1">Email Address</label>
                        <CustomTextField
                            id="email"
                            fullWidth
                            type="email"
                            value={email}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                            autoComplete="email"
                            placeholder="you@example.com"
                        />

                        <label htmlFor="password" className="block text-sm font-semibold text-gray-100 mb-1">Password</label>
                        <div className="relative">
                          <CustomTextField
                              id="password"
                              type={showPassword ? 'text' : 'password'}
                              fullWidth
                              value={password}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                              required
                              disabled={loading}
                              autoComplete="new-password"
                              placeholder="At least 8 characters"
                              className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={loading}
                            className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-300 disabled:opacity-50"
                            aria-label="Toggle password visibility"
                          >
                            {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                          </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Must be at least 8 characters</p>

                        <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-100 mb-1">Confirm Password</label>
                        <div className="relative">
                          <CustomTextField
                              id="confirmPassword"
                              type={showConfirmPassword ? 'text' : 'password'}
                              fullWidth
                              value={confirmPassword}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                              required
                              disabled={loading}
                              autoComplete="new-password"
                              className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            disabled={loading}
                            className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-300 disabled:opacity-50"
                            aria-label="Toggle confirm password visibility"
                          >
                            {showConfirmPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                          </button>
                        </div>
                    </div>
                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        className="w-full bg-gradient-to-r from-sakura-400 to-sakura-500 shadow-lg shadow-sakura-500/40 hover:from-sakura-500 hover:to-sakura-600 hover:shadow-sakura-500/60 focus:ring-4 focus:ring-sakura-400/50"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </Button>
                </div>
            </form>

            <div className="my-6">
                <div className="relative text-center">
                  <hr className="border-gray-700" />
                  <span className="absolute -translate-x-1/2 left-1/2 -top-3 bg-transparent px-2 text-gray-400 text-xs">OR</span>
                </div>
            </div>

            <div>
                <Button
                    variant="default"
                    color="primary"
                    size="large"
                    className="w-full bg-white !text-gray-800 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:!text-gray-900 focus:ring-[#4285F4] disabled:bg-gray-100 disabled:!text-gray-400"
                    onClick={handleGoogleSignUp}
                    disabled={loading}
                >
                    <span className="flex items-center justify-center gap-3">
                        <svg
                            className="h-5 w-5"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path
                                fill="#4285F4"
                                d="M23.49 12.27c0-.78-.07-1.53-.18-2.27H12v4.3h6.43c-.27 1.38-1.07 2.54-2.29 3.31v2.74h3.7c2.17-2 3.42-4.95 3.42-8.08z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 24c3.09 0 5.68-1.03 7.57-2.79l-3.7-2.74c-1.03.69-2.35 1.1-3.87 1.1-2.97 0-5.48-2.01-6.38-4.72H2.79v2.96A12 12 0 0012 24z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.62 14.85a7.17 7.17 0 010-4.7V7.19H2.79a12 12 0 000 9.62l2.83-2.96z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 4.75c1.68 0 3.19.58 4.38 1.72l3.27-3.27C17.68 1.04 15.09 0 12 0 7.31 0 3.26 2.69 1.09 6.63l2.83 2.96C4.52 6.64 7.03 4.75 12 4.75z"
                            />
                        </svg>
                        <span>Sign Up with Google</span>
                    </span>
                </Button>
            </div>

            {subtitle}
        </>
    );
}

export default AuthRegister;
