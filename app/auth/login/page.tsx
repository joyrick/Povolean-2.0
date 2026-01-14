"use client";

import type { FormEvent, ReactElement } from "react";
import { useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";

export default function LoginPage(): ReactElement {
  const router = useRouter();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (result?.error) {
      setError("Nesprávny email alebo heslo.");
      return;
    }

    router.push("/");
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Header – will have no actions because user is not logged in */}
      <div className="px-6 pt-4">
        <PageHeader title="Povolean" subtitle="Stavebné povolenia jednoducho" />
      </div>

      {/* Centered login card */}
      <main className="flex flex-1 items-center justify-center px-4 pb-10">
        <Card className="w-full max-w-md rounded-2xl border-slate-200 bg-white shadow-xl shadow-slate-200/80">
          <CardContent className="px-10 py-10">
            {/* Logo + heading */}
            <div className="flex flex-col items-center text-center">
              <Image
                src="/img/logo_2.png"
                alt="Povolean logo"
                width={56}
                height={56}
                className="mb-2"
              />
              <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
                Prihláste sa do svojho účtu
              </h1>
            </div>

            {/* Form */}
            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5 text-left">
                <label className="text-sm font-medium text-slate-700">
                  Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="h-10 rounded-xl border-slate-200 text-sm"
                  placeholder="jozko@gmail.com"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-sm font-medium text-slate-700">
                  Heslo
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="h-10 rounded-xl border-slate-200 text-sm"
                  placeholder="••••••••"
                />
              </div>

              {error !== null && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <Button
                type="submit"
                className="mt-2 w-full rounded-full bg-black py-2 text-sm font-semibold text-white hover:bg-black/90"
                disabled={loading}
              >
                {loading ? "Prihlasujem..." : "Prihlásiť sa"}
              </Button>

              {/* Demo accounts */}
              <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-600">
                <div className="mb-1 font-semibold text-slate-700">
                  Testovacie účty
                </div>
                <ul className="space-y-1 font-mono">
                  <li>
                    admin@example.com /{" "}
                    <span className="font-normal">admin123</span>
                  </li>
                  <li>
                    dev@example.com /{" "}
                    <span className="font-normal">dev123</span>
                  </li>
                  <li>
                    authority@example.com /{" "}
                    <span className="font-normal">authority123</span>
                  </li>
                </ul>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
