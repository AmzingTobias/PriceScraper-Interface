"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { login as apiLogin, signup as apiSignup } from "@/lib/api";
import Btn from "@/components/ui/btn";
import Input from "@/components/ui/input";

type FormMode = "login" | "signup";

function validatePassword(pw: string): boolean {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{7,}$/.test(pw);
}

export default function LoginPage() {
  const { setToken } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<FormMode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [warning, setWarning] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setWarning("");

    if (submitting) return;

    if (!username || !password) {
      setWarning("Please fill in all fields.");
      return;
    }

    if (mode === "signup" && !validatePassword(password)) {
      setWarning("Password must be 7+ chars with upper, lower & number.");
      return;
    }

    setSubmitting(true);
    const fn = mode === "login" ? apiLogin : apiSignup;
    const token = await fn(username, password);

    if (token) {
      setToken(token);
      router.push("/");
    } else {
      setWarning(mode === "login" ? "Invalid credentials." : "Signup failed — username may be taken.");
      // Cooldown after failed attempt to slow brute force
      setTimeout(() => setSubmitting(false), 2000);
      return;
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="bg-surface-800 border border-white/[0.04] rounded-2xl overflow-hidden shadow-card">
          {/* Tab toggle */}
          <div className="flex">
            {(["login", "signup"] as FormMode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setWarning(""); }}
                className={`flex-1 py-4 text-center font-display text-lg font-bold capitalize transition-colors cursor-pointer ${
                  mode === m
                    ? "text-text-primary border-b-2 border-accent"
                    : "text-text-muted bg-surface-900/50 hover:text-text-secondary"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="p-6">
            <div className="space-y-4">
              <Input
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
              <Input
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />

              {warning && (
                <p className="text-danger text-sm font-medium">{warning}</p>
              )}

              <Btn fullWidth onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Please wait..." : mode === "login" ? "Login" : "Create Account"}
              </Btn>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
