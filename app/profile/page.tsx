"use client";

import { useEffect, useRef, useState } from "react";
import AppShell from "@/components/AppShell";
import { Badge, Button, Card, Input } from "@/components/ui";
import { useAuth } from "@/components/AuthProvider";
import { supabaseClient } from "@/lib/supabase";
import {
  analyzeResumeIdentity,
  extractReadablePdfText,
  ResumeIdentity,
} from "@/lib/resume-identity";

const STORAGE_KEY = "digital-identity-resume-profile";

function normalizeProfileUrl(value: string, type: "linkedin" | "github") {
  const clean = value.trim();
  if (!clean) return "";
  if (clean.startsWith("http://") || clean.startsWith("https://")) return clean;
  if (type === "linkedin") return `https://www.linkedin.com/in/${clean}`;
  return `https://github.com/${clean.replace(/^@/, "")}`;
}

function EmptyValue({ label }: { label: string }) {
  return <span className="text-slate-500">Not found in uploaded resume {label}</span>;
}

function ChipList({ items }: { items: string[] }) {
  if (!items.length) {
    return <p className="text-sm text-slate-500">Nothing detected yet.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-full border border-primary-500/20 bg-primary-500/10 px-3 py-1 text-xs font-medium text-primary-200"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [identity, setIdentity] = useState<ResumeIdentity | null>(null);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.user_metadata) {
      setName(user.user_metadata.full_name || "");
      setPhone(user.user_metadata.phone || "");
      setBio(user.user_metadata.bio || "");
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as ResumeIdentity;
      setIdentity(parsed);
      setLinkedin(parsed.links.linkedin);
      setGithub(parsed.links.github);
    }
  }, [user]);

  const persistIdentity = (nextIdentity: ResumeIdentity) => {
    setIdentity(nextIdentity);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextIdentity));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const { error: updateError } = await supabaseClient.auth.updateUser({
        data: { full_name: name, phone, bio, linkedin, github },
      });
      if (updateError) throw updateError;
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleResume = async (file: File) => {
    setError(null);
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please upload a resume PDF.");
      return;
    }

    setAnalyzing(true);
    try {
      const text = await extractReadablePdfText(file);
      if (text.length < 80) {
        throw new Error(
          "Could not read enough text from this PDF. Try a text-based PDF instead of a scanned image."
        );
      }

      const nextIdentity = analyzeResumeIdentity(text, file.name, {
        linkedin: normalizeProfileUrl(linkedin, "linkedin"),
        github: normalizeProfileUrl(github, "github"),
      });
      setLinkedin(nextIdentity.links.linkedin);
      setGithub(nextIdentity.links.github);
      persistIdentity(nextIdentity);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not analyze the resume.");
    } finally {
      setAnalyzing(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const updateLinksInIdentity = () => {
    if (!identity) {
      setError("Upload and evaluate a resume first, then attach LinkedIn and GitHub.");
      return;
    }

    const nextIdentity = analyzeResumeIdentity(identity.textPreview, identity.resumeFileName, {
      linkedin: normalizeProfileUrl(linkedin, "linkedin"),
      github: normalizeProfileUrl(github, "github"),
    });
    persistIdentity({
      ...nextIdentity,
      textPreview: identity.textPreview,
      analyzedAt: identity.analyzedAt,
    });
    setLinkedin(nextIdentity.links.linkedin);
    setGithub(nextIdentity.links.github);
  };

  return (
    <AppShell title="Profile">
      <div className="mx-auto max-w-6xl space-y-6 animate-fade-in">
        <div>
          <h2 className="text-2xl font-semibold text-white">
            Resume-based Digital Identity
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Upload a resume PDF and add your LinkedIn/GitHub IDs. The website
            will build an identity view from extracted resume content only.
          </p>
        </div>

        {saved && (
          <div className="rounded-lg border border-accent-500/20 bg-accent-500/10 p-3 text-sm text-accent-400">
            Profile updated successfully.
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-error-500/20 bg-error-500/10 p-3 text-sm text-error-400">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="space-y-6">
            <Card>
              <h3 className="font-display text-lg font-semibold text-white">
                Add Resume and Public IDs
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                LinkedIn and GitHub can be pasted as full URLs or profile IDs.
              </p>

              <div className="mt-6 space-y-4">
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) handleResume(file);
                  }}
                />

                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={analyzing}
                  className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary-500/30 bg-primary-500/5 px-5 py-8 text-center transition hover:border-primary-400 hover:bg-primary-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="text-sm font-semibold text-primary-200">
                    {analyzing ? "Evaluating resume..." : "Upload Resume PDF"}
                  </span>
                  <span className="mt-2 text-xs text-slate-500">
                    Text-based PDFs work best for extraction.
                  </span>
                </button>

                <Input
                  label="LinkedIn ID or URL"
                  value={linkedin}
                  onChange={setLinkedin}
                  placeholder="linkedin.com/in/your-profile or your-profile"
                />
                <Input
                  label="GitHub ID or URL"
                  value={github}
                  onChange={setGithub}
                  placeholder="github.com/username or username"
                />

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button onClick={updateLinksInIdentity} variant="secondary">
                    Add LinkedIn and GitHub
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : "Save Profile"}
                  </Button>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="font-display text-lg font-semibold text-white">
                Basic Profile
              </h3>
              <div className="mt-5 space-y-4">
                <Input label="Full Name" value={name} onChange={setName} placeholder="Your name" />
                <Input label="Email" type="email" value={user?.email || ""} onChange={() => {}} />
                <Input label="Phone" value={phone} onChange={setPhone} placeholder="+1 555 000 0000" />
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">
                    Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(event) => setBio(event.target.value)}
                    rows={4}
                    placeholder="Short introduction based on your real profile..."
                    className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-white placeholder-slate-500 transition-colors focus:border-primary-500 focus:outline-none"
                  />
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-primary-500/20 bg-primary-500/5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm text-slate-400">Generated Identity</p>
                  <h3 className="mt-1 font-display text-2xl font-semibold text-white">
                    {identity?.contact.name || name || "Upload a resume to generate identity"}
                  </h3>
                  <p className="mt-2 text-sm text-slate-400">
                    {identity
                      ? `Source: ${identity.resumeFileName}`
                      : "No resume has been evaluated yet."}
                  </p>
                </div>
                <Badge color={identity ? "accent" : "warning"}>
                  {identity ? `${identity.score}% complete` : "Waiting for resume"}
                </Badge>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">Email</p>
                  <p className="mt-1 text-sm text-white">
                    {identity?.contact.email || user?.email || <EmptyValue label="" />}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">Phone</p>
                  <p className="mt-1 text-sm text-white">
                    {identity?.contact.phone || phone || <EmptyValue label="" />}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">LinkedIn</p>
                  <p className="mt-1 break-all text-sm text-white">
                    {identity?.links.linkedin || linkedin || "Not added yet"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">GitHub</p>
                  <p className="mt-1 break-all text-sm text-white">
                    {identity?.links.github || github || "Not added yet"}
                  </p>
                </div>
              </div>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <h3 className="font-display text-lg font-semibold text-white">Skills Detected</h3>
                <div className="mt-4">
                  <ChipList items={identity?.skills ?? []} />
                </div>
              </Card>

              <Card>
                <h3 className="font-display text-lg font-semibold text-white">Sections Found</h3>
                <div className="mt-4">
                  <ChipList items={identity?.sectionsFound ?? []} />
                </div>
              </Card>
            </div>

            <Card>
              <h3 className="font-display text-lg font-semibold text-white">
                Relationship Map
              </h3>
              <div className="mt-4 space-y-3">
                {(identity?.relationshipMap ?? []).length ? (
                  identity?.relationshipMap.map((item) => (
                    <div
                      key={item}
                      className="rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300"
                    >
                      {item}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    Upload a resume to generate relationships from actual resume evidence.
                  </p>
                )}
              </div>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <h3 className="font-display text-lg font-semibold text-white">
                  Timeline Evidence
                </h3>
                <div className="mt-4 space-y-3">
                  {(identity?.timeline ?? []).length ? (
                    identity?.timeline.map((item) => (
                      <p key={item} className="text-sm leading-6 text-slate-300">
                        {item}
                      </p>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">
                      No year-based timeline events detected yet.
                    </p>
                  )}
                </div>
              </Card>

              <Card>
                <h3 className="font-display text-lg font-semibold text-white">
                  Resume Evaluation
                </h3>
                <div className="mt-4 space-y-3">
                  {(identity?.recommendations ?? []).length ? (
                    identity?.recommendations.map((item) => (
                      <p key={item} className="text-sm leading-6 text-slate-300">
                        {item}
                      </p>
                    ))
                  ) : identity ? (
                    <p className="text-sm text-accent-400">
                      No major missing items detected by the rule-based evaluator.
                    </p>
                  ) : (
                    <p className="text-sm text-slate-500">
                      Upload a resume PDF to see evaluation feedback.
                    </p>
                  )}
                </div>
              </Card>
            </div>

            <Card>
              <h3 className="font-display text-lg font-semibold text-white">
                Extracted Resume Preview
              </h3>
              <p className="mt-4 max-h-48 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950 p-4 text-sm leading-6 text-slate-400">
                {identity?.textPreview ||
                  "Resume text preview will appear here after upload. This section helps verify that the identity is based on extracted resume content."}
              </p>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
