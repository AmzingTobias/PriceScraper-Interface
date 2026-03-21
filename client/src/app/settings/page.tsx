"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/toast";
import {
  getUserDetails,
  getNotificationSettings,
  updateNotificationSettings,
  getDiscordWebhook,
  createDiscordWebhook,
  updateDiscordWebhook,
  deleteDiscordWebhook,
  updatePassword,
} from "@/lib/api";
import PageShell from "@/components/ui/page-shell";
import { SkeletonBox } from "@/components/ui/skeleton";
import Btn from "@/components/ui/btn";
import Input from "@/components/ui/input";
import { LogOut, KeyRound } from "lucide-react";

const WEBHOOK_REGEX = /^https:\/\/discord\.com\/api\/webhooks\//;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{7,}$/;

export default function SettingsPage() {
  const { isLoggedIn, logout, token, mounted } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [username, setUsername] = useState("");
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Notification state
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [notifLoaded, setNotifLoaded] = useState(false);

  // Discord state
  const [webhookExists, setWebhookExists] = useState(false);
  const [webhookInput, setWebhookInput] = useState("");
  const [webhookLoaded, setWebhookLoaded] = useState(false);

  // Password state
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  useEffect(() => {
    if (mounted && !isLoggedIn) {
      router.push("/login");
    }
  }, [mounted, isLoggedIn, router]);

  useEffect(() => {
    if (!token) return;

    setLoadingSettings(true);

    Promise.all([
      getUserDetails().then((u) => {
        if (u) setUsername(u.Username);
      }),
      getNotificationSettings().then((s) => {
        setNotifEnabled(s.Enabled);
        setNotifLoaded(true);
      }),
      getDiscordWebhook().then((w) => {
        if (w !== undefined) {
          setWebhookExists(true);
          setWebhookInput(w);
        } else {
          setWebhookExists(false);
          setWebhookInput("");
        }
        setWebhookLoaded(true);
      }),
    ]).finally(() => setLoadingSettings(false));
  }, [token]);

  const saveNotif = async () => {
    const ok = await updateNotificationSettings(notifEnabled);
    toast(ok ? "Notification settings saved" : "Failed to save", ok ? "success" : "error");
  };

  const saveWebhook = async () => {
    if (!WEBHOOK_REGEX.test(webhookInput)) {
      toast("Invalid Discord webhook URL", "error");
      return;
    }
    if (webhookExists) {
      const ok = await updateDiscordWebhook(webhookInput);
      toast(ok ? "Webhook updated" : "Failed to update webhook", ok ? "success" : "error");
    } else {
      const ok = await createDiscordWebhook(webhookInput);
      if (ok) {
        setWebhookExists(true);
        toast("Webhook created", "success");
      } else {
        toast("Failed to create webhook", "error");
      }
    }
  };

  const removeWebhook = async () => {
    const ok = await deleteDiscordWebhook();
    if (ok) {
      setWebhookExists(false);
      setWebhookInput("");
      toast("Webhook deleted", "success");
    } else {
      toast("Failed to delete webhook", "error");
    }
  };

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentPw || !newPw || !confirmPw) {
      toast("Please fill in all password fields", "error");
      return;
    }
    if (newPw !== confirmPw) {
      toast("New passwords do not match", "error");
      return;
    }
    if (!PASSWORD_REGEX.test(newPw)) {
      toast("Password must be 7+ chars with upper, lower & number", "error");
      return;
    }
    const ok = await updatePassword(currentPw, newPw);
    if (ok) {
      toast("Password updated successfully", "success");
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    } else {
      toast("Failed to update password — check your current password", "error");
    }
  };

  if (!mounted || !isLoggedIn) return null;

  return (
    <PageShell
      title={`Settings${username ? `: ${username}` : ""}`}
      actions={
        <Btn
          variant="danger"
          onClick={() => {
            logout();
            router.push("/");
          }}
        >
          <span className="flex items-center gap-2">
            <LogOut size={14} />
            Logout
          </span>
        </Btn>
      }
    >
      {loadingSettings ? (
        <div className="space-y-6">
          <SkeletonBox className="h-6 w-40 rounded-md" />
          <SkeletonBox className="h-10 w-full rounded-xl" />
          <SkeletonBox className="h-6 w-40 rounded-md" />
          <SkeletonBox className="h-10 w-full rounded-xl" />
        </div>
      ) : (
        <>
          {/* Notification toggle */}
          <section className="mb-8">
            <h2 className="font-display text-lg font-bold mb-3">Notifications</h2>
            {notifLoaded ? (
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setNotifEnabled(!notifEnabled)}
                    role="switch"
                    aria-checked={notifEnabled}
                    aria-label="Toggle notifications"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setNotifEnabled(!notifEnabled); }}
                    className={`w-11 h-6 rounded-full relative transition-colors cursor-pointer ${
                      notifEnabled ? "bg-accent" : "bg-surface-600"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                        notifEnabled ? "translate-x-[22px]" : "translate-x-0.5"
                      }`}
                    />
                  </div>
                  <span className="text-sm text-text-secondary">
                    {notifEnabled ? "Enabled" : "Disabled"}
                  </span>
                </label>
                <Btn onClick={saveNotif}>Save</Btn>
              </div>
            ) : (
              <SkeletonBox className="h-10 w-48 rounded-xl" />
            )}
          </section>

          <div className="h-px bg-white/[0.06] mb-8" />

          {/* Discord webhook */}
          <section className="mb-8">
            <h2 className="font-display text-lg font-bold mb-3">Discord Webhook</h2>
            {webhookLoaded ? (
              <div className="space-y-3">
                <Input
                  placeholder="https://discord.com/api/webhooks/..."
                  value={webhookInput}
                  onChange={(e) => setWebhookInput(e.target.value)}
                  aria-label="Discord webhook URL"
                />
                <div className="flex flex-wrap items-center gap-3">
                  <Btn onClick={saveWebhook}>
                    {webhookExists ? "Update" : "Create"}
                  </Btn>
                  {webhookExists && (
                    <Btn variant="danger" onClick={removeWebhook}>
                      Delete
                    </Btn>
                  )}
                </div>
              </div>
            ) : (
              <SkeletonBox className="h-10 w-full rounded-xl" />
            )}
          </section>

          <div className="h-px bg-white/[0.06] mb-8" />

          {/* Password change */}
          <section>
            <h2 className="font-display text-lg font-bold mb-3">
              <span className="flex items-center gap-2">
                <KeyRound size={18} />
                Change Password
              </span>
            </h2>
            <div className="space-y-3 max-w-sm">
              <Input
                type="password"
                placeholder="Current password"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                autoComplete="current-password"
                aria-label="Current password"
              />
              <Input
                type="password"
                placeholder="New password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                autoComplete="new-password"
                aria-label="New password"
              />
              <Input
                type="password"
                placeholder="Confirm new password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                autoComplete="new-password"
                aria-label="Confirm new password"
              />
              <Btn onClick={handlePasswordChange}>Update Password</Btn>
            </div>
          </section>
        </>
      )}
    </PageShell>
  );
}
