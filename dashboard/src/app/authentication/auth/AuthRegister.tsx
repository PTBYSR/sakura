"use client";

import React, { useState } from 'react';
import { Box, Typography, Button, Stack, Alert, Divider, InputAdornment, IconButton } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { IconEye, IconEyeOff } from '@tabler/icons-react';

import CustomTextField from '@/app/(DashboardLayout)/components/forms/theme-elements/CustomTextField';

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
            await authClient.signIn.social({
                provider: 'google',
            });
        } catch (err: any) {
            setError(err.message || 'Failed to sign up with Google');
            setLoading(false);
        }
    };

    return (
        <>
            {title ? (
                <Typography fontWeight="700" variant="h2" mb={1}>
                    {title}
                </Typography>
            ) : null}

            {subtext}

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            <form onSubmit={handleEmailSignUp}>
                <Box>
                    <Stack mb={3}>
                        <Typography variant="subtitle1"
                            fontWeight={600} component="label" htmlFor='name' mb="5px">Name</Typography>
                        <CustomTextField
                            id="name"
                            variant="outlined"
                            fullWidth
                            value={name}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                            required
                            disabled={loading}
                            autoComplete="name"
                        />

                        <Typography variant="subtitle1"
                            fontWeight={600} component="label" htmlFor='email' mb="5px" mt="25px">Email Address</Typography>
                        <CustomTextField
                            id="email"
                            variant="outlined"
                            fullWidth
                            type="email"
                            value={email}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                            autoComplete="email"
                        />

                        <Typography variant="subtitle1"
                            fontWeight={600} component="label" htmlFor='password' mb="5px" mt="25px">Password</Typography>
                        <CustomTextField
                            id="password"
                            type={showPassword ? "text" : "password"}
                            variant="outlined"
                            fullWidth
                            value={password}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                            helperText="Must be at least 8 characters"
                            autoComplete="new-password"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                            disabled={loading}
                                            sx={{ color: 'text.secondary' }}
                                        >
                                            {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Typography variant="subtitle1"
                            fontWeight={600} component="label" htmlFor='confirmPassword' mb="5px" mt="25px">Confirm Password</Typography>
                        <CustomTextField
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            variant="outlined"
                            fullWidth
                            value={confirmPassword}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                            required
                            disabled={loading}
                            autoComplete="new-password"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle confirm password visibility"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            edge="end"
                                            disabled={loading}
                                            sx={{ color: 'text.secondary' }}
                                        >
                                            {showConfirmPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Stack>
                    <Button
                        color="primary"
                        variant="contained"
                        size="large"
                        fullWidth
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </Button>
                </Box>
            </form>

            <Box sx={{ my: 3 }}>
                <Divider>
                    <Typography variant="body2" color="textSecondary">
                        OR
                    </Typography>
                </Divider>
            </Box>

            <Box>
                <Button
                    color="primary"
                    variant="outlined"
                    size="large"
                    fullWidth
                    onClick={handleGoogleSignUp}
                    disabled={loading}
                >
                    Sign Up with Google
                </Button>
            </Box>

            {subtitle}
        </>
    );
};

export default AuthRegister;
