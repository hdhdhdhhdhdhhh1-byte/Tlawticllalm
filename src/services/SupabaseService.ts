/**
 * Supabase client and service for web preview and live data synchronization.
 * Uses public anon key and project URL.
 */

export const SUPABASE_CONFIG = {
  url: 'https://ixkganrxtkywypvqkqkn.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4a2dhbnJ4dGt5d3lwdnFrcWtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQwNjcyMDAsImV4cCI6MjAyNTY0MzIwMH0.placeholder',
  restBaseUrl: 'https://ixkganrxtkywypvqkqkn.supabase.co/rest/v1',
  storageBaseUrl: 'https://ixkganrxtkywypvqkqkn.supabase.co/storage/v1'
};

export class SupabaseService {
  private static headers = {
    'apikey': SUPABASE_CONFIG.anonKey,
    'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  static async fetchPublicReciters() {
    try {
      const res = await fetch(`${SUPABASE_CONFIG.restBaseUrl}/public_reciters_view?select=*&order=created_at.desc`, {
        headers: this.headers
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn('Supabase fetchPublicReciters fallback to local', e);
      return null;
    }
  }

  static async fetchPublicRecitations(reciterId?: string) {
    try {
      let url = `${SUPABASE_CONFIG.restBaseUrl}/public_recitations_view?select=*&order=published_at.desc`;
      if (reciterId) {
        url += `&reciter_id=eq.${encodeURIComponent(reciterId)}`;
      }
      const res = await fetch(url, { headers: this.headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn('Supabase fetchPublicRecitations fallback to local', e);
      return null;
    }
  }

  static async toggleLike(recitationId: string, installationId: string) {
    try {
      const res = await fetch(`${SUPABASE_CONFIG.restBaseUrl}/rpc/toggle_recitation_like`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          p_recitation_id: recitationId,
          p_anonymous_installation_id: installationId
        })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data[0] || null;
    } catch (e) {
      console.warn('Supabase toggleLike fallback to local', e);
      return null;
    }
  }

  static async recordListenEvent(recitationId: string, installationId: string, durationSeconds: number, completed: boolean) {
    try {
      await fetch(`${SUPABASE_CONFIG.restBaseUrl}/rpc/record_listen_event`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          p_recitation_id: recitationId,
          p_anonymous_installation_id: installationId,
          p_listened_seconds: durationSeconds,
          p_completed: completed
        })
      });
    } catch (e) {
      console.warn('Supabase recordListenEvent fallback', e);
    }
  }

  static async submitRecitation(payload: Record<string, unknown>) {
    try {
      const res = await fetch(`${SUPABASE_CONFIG.restBaseUrl}/recitation_submissions`, {
        method: 'POST',
        headers: {
          ...this.headers,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn('Supabase submitRecitation fallback', e);
      return null;
    }
  }
}
