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
    try {
      // ✅ Restore session from localStorage on app launch
      const { data: { session } } = await supabase.auth.getSession();
      set({ session, user: session?.user ?? null, loading: false });

      // ✅ Listen for login / logout / token refresh events
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          set({ session, user: session?.user ?? null });
        }
      );

      // ✅ Save unsubscribe fn for cleanup
      set({ _unsubscribe: subscription.unsubscribe });

    } catch (error) {
      console.error('Auth init error:', error);
      set({ user: null, session: null, loading: false });
    }
  },

  // ✅ Call on app unmount to prevent memory leaks
  destroy: () => {
    const state = useAuthStore.getState();
    state._unsubscribe?.();
    set({ _unsubscribe: null });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },
}));