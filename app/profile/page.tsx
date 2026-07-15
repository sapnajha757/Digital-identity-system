"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { Card, Button, Input } from "@/components/ui";
import { useAuth } from "@/components/AuthProvider";
import { supabaseClient } from "@/lib/supabase";

export default function ProfilePage() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user?.user_metadata) {
      setName(user.user_metadata.full_name || "");
      setPhone(user.user_metadata.phone || "");
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabaseClient.auth.updateUser({
        data: { full_name: name, phone, bio },
      });
      if (error) throw error;
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // ignore for now
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell title="Profile">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <Card>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-primary-600 flex items-center justify-center text-white text-2xl font-bold">
              {name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-white">{name || "User"}</h2>
              <p className="text-slate-400 text-sm">{user?.email}</p>
            </div>
          </div>

          {saved && (
            <div className="mb-4 p-3 rounded-lg bg-accent-500/10 border border-accent-500/20 text-sm text-accent-400">
              Profile updated successfully!
            </div>
          )}

          <div className="space-y-4">
            <Input label="Full Name" value={name} onChange={setName} placeholder="John Doe" />
            <Input label="Email" type="email" value={user?.email || ""} onChange={() => {}} />
            <Input label="Phone" value={phone} onChange={setPhone} placeholder="+1 555 000 0000" />
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                placeholder="Tell us about yourself..."
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 transition-colors resize-none"
              />
            </div>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
