"use client";

import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import { ApiError } from "@/lib/api";
import { authApi } from "@/lib/auth";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";

function mapErrorToMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.isNetworkError) {
      return "Sunucuya ulaşılamadı. Backend çalışıyor mu?";
    }
    if (err.status === 400) return "Kullanıcı adı ve parola gerekli.";
    if (err.status === 401) return "Kullanıcı adı veya parola hatalı.";
    if (err.status === 423)
      return "Hesap kilitli. 15 dakika sonra tekrar deneyin.";
    if (err.status === 429)
      return "Çok fazla deneme yaptınız. 15 dakika sonra tekrar deneyin.";
    if (err.status >= 500 && err.status <= 503) {
      return "Sunucu şu an yanıt vermiyor, birazdan tekrar deneyin.";
    }
    return err.message || "Bir hata oluştu.";
  }
  return "Beklenmedik bir hata oluştu.";
}

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("from") || "/";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canSubmit =
    username.trim().length > 0 && password.length > 0 && !isSubmitting;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await authApi.login({
        username: username.trim(),
        password,
      });

      if (response.requiresTwoFactor && response.twoFactorToken) {
        sessionStorage.setItem("atabilet_2fa_token", response.twoFactorToken);
        sessionStorage.setItem("atabilet_2fa_redirect", redirectTo);
        router.push("/verify-2fa");
        return;
      }

      if (response.user) {
        router.push(redirectTo);
        router.refresh();
        return;
      }

      setErrorMessage("Beklenmedik yanıt alındı, tekrar deneyin.");
    } catch (err) {
      setErrorMessage(mapErrorToMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto px-4 sm:px-0">
        <div>
          {/* Brand header */}
          <div className="mb-8 flex flex-col items-center text-center sm:items-start sm:text-left">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white ring-1 ring-gray-200 shadow-sm dark:bg-gray-800 dark:ring-gray-700">
                <Image
                  src="/images/logo/atabilet-icon.svg"
                  alt="ATABİLET"
                  width={28}
                  height={28}
                  priority
                />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  ATABİLET
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Yönetim Paneli
                </p>
              </div>
            </div>

            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Tekrar hoş geldiniz
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Devam etmek için hesabınıza giriş yapın.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-5">
              <div>
                <Label>
                  Kullanıcı Adı <span className="text-error-500">*</span>
                </Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  placeholder="kullanici.adi"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label>
                  Parola <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Parolayı gizle" : "Parolayı göster"}
                    tabIndex={-1}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  >
                    {showPassword ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400"
                >
                  <svg
                    className="mt-0.5 h-4 w-4 shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                className="group relative inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:from-emerald-700 hover:to-emerald-800 hover:shadow-emerald-700/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60 dark:focus:ring-offset-gray-900"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"
                      />
                    </svg>
                    Giriş yapılıyor…
                  </>
                ) : (
                  <>
                    Giriş Yap
                    <svg
                      className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 4.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L11.586 10 7.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 border-t border-gray-200 pt-5 dark:border-gray-800">
            <p className="text-center text-xs text-gray-500 dark:text-gray-400">
              Hesap oluşturmak için sistem yöneticinizle iletişime geçin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}