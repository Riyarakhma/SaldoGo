import { supabase } from './supabaseClient';

export async function signUp(email, password, options = {}) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  }, options);
  return { data, error };
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase. auth.signOut();
  return { error };
}

export async function getUser() {
  const { data } = await supabase.auth.getUser();
  return data?.user ?? null;
}

export function onAuthStateChange(callback) {
  const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
  return () => {
    subscription?.subscription?.unsubscribe?.();
  };
}