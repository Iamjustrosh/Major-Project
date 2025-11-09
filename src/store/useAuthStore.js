import { create } from 'zustand';
import { supabase } from '../services/supabaseClient';

export const useAuthStore = create((set) => ({
  user: null,
  session: null,
  loading: true,
  setUser: (u) => set({ user: u }),
  setSession: (s) => set({ session: s }),
  setLoading: (v) => set({ loading: v }),

  init: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    set({ session, user: session?.user ?? null, loading: false });

    // subscribe to changes
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null });
    });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  }
}));
