import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export type ScanType = "url" | "text" | "pdf";
export type ScanHistoryEntry = {
  id: string;
  user_id: string;
  scan_type: ScanType;
  target: string;
  score: number;
  risk: string;
  created_at: string;
};

export async function recordScan(entry: {
  scan_type: ScanType;
  target: string;
  score: number;
  risk: string;
}) {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return;
  await supabase.from("scan_history").insert({
    user_id: user.id,
    scan_type: entry.scan_type,
    target: entry.target.slice(0, 240),
    score: Math.round(entry.score),
    risk: entry.risk,
  });
}

export function useScanHistory(limit = 12) {
  const { user } = useAuth();
  const [items, setItems] = useState<ScanHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("scan_history")
      .select("id, user_id, scan_type, target, score, risk, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);
    setItems((data ?? []) as ScanHistoryEntry[]);
    setLoading(false);
  }, [user, limit]);

  useEffect(() => {
    load();
  }, [load]);

  return { items, loading, reload: load };
}
