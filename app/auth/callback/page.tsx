"use client"

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-auth';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState('Completing sign-in...');

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        // Supabase magic links put tokens in the URL fragment (#access_token=...)
        const hash = typeof window !== 'undefined' ? window.location.hash : '';
        const params = new URLSearchParams(hash.replace('#', '?'));
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');

        if (access_token) {
          // Exchange tokens into the client session
          const { data, error } = await supabase.auth.setSession({
            access_token: access_token,
            refresh_token: refresh_token || undefined,
          } as any);

          if (error) {
            console.warn('Auth callback setSession error:', error);
            if (mounted) setMessage('Sign-in failed. Redirecting...');
            setTimeout(() => router.replace('/'), 1200);
            return;
          }

          if (data?.session) {
            // Check if user profile exists, create if not
            const userId = data.session.user.id;
            const userEmail = data.session.user.email || '';

            try {
              // Check if profile exists
              const { data: profile } = await supabase
                .from('users')
                .select('id')
                .eq('auth_id', userId)
                .single();

              // Create profile if it doesn't exist
              if (!profile) {
                await supabase.from('users').insert({
                  auth_id: userId,
                  email: userEmail,
                  username: userEmail.split('@')[0],
                  age_verified: true,
                  xp: 0,
                  level: 1,
                  coins: 0,
                  votes_count: 0,
                  voting_power: 100,
                  streak: 0,
                  global_rank: 0
                });
              }
            } catch (err) {
              console.error('Error checking/creating profile:', err);
            }

            if (mounted) setMessage('Sign-in successful. Redirecting...');
            setTimeout(() => router.replace('/'), 600);
            return;
          }
        }

        // Fallback: try to get current user; if found redirect home.
        const { data: userData, error: userErr } = await supabase.auth.getUser();
        if (!userErr && userData?.user) {
          if (mounted) setMessage('Signed in. Redirecting...');
          setTimeout(() => router.replace('/'), 600);
          return;
        }

        if (mounted) setMessage('No session found. Redirecting to login...');
        setTimeout(() => router.replace('/'), 800);
      } catch (err) {
        console.error('Unexpected error handling auth callback', err);
        if (mounted) setMessage('Unexpected error. Redirecting...');
        setTimeout(() => router.replace('/'), 1200);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <p className="mb-2">{message}</p>
        <p className="text-sm opacity-70">If you are not redirected, <a href="/" className="underline">click here</a>.</p>
      </div>
    </div>
  );
}
