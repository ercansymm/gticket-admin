"use client";

import { useCallback, useEffect, useState } from "react";
import { adminUsersApi } from "@/lib/adminUsers";
import type { AdminUserDetail } from "@/types/adminUser";
import { ROLE_LABELS } from "@/types/adminUser";
import Badge from "../ui/badge/Badge";

interface Props {
  userId: string;
  onClose: () => void;
  onUpdated: () => void;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type ActionMode = "none" | "reset-password" | "toggle-status";

function roleBadgeColor(
  role: string
): "error" | "info" | "light" {
  switch (role) {
    case "SuperAdmin":
      return "error";
    case "CallCenter":
      return "info";
    case "ReadOnly":
      return "light";
    default:
      return "light";
  }
}

export default function AdminUserDetailModal({
  userId,
  onClose,
  onUpdated,
}: Props) {
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [mode, setMode] = useState<ActionMode>("none");
  const [newPassword, setNewPassword] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch detail
  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminUsersApi.getById(userId);
      setDetail(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Detay yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  // ESC key handling
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Reset password action
  const handleResetPassword = async () => {
    if (newPassword.length < 8) {
      setActionError("Parola en az 8 karakter olmalıdır.");
      return;
    }
    if (!/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setActionError("Parola en az bir büyük harf ve bir rakam içermelidir.");
      return;
    }

    setActionLoading(true);
    setActionError(null);
    try {
      await adminUsersApi.resetPassword(userId, { newPassword });
      setSuccessMessage("Parola başarıyla sıfırlandı.");
      setMode("none");
      setNewPassword("");
      onUpdated();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (e: unknown) {
      setActionError(e instanceof Error ? e.message : "Parola sıfırlanamadı");
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle status action
  const handleToggleStatus = async () => {
    if (!detail) return;

    setActionLoading(true);
    setActionError(null);
    try {
      await adminUsersApi.updateStatus(userId, {
        isActive: !detail.isActive,
      });
      setSuccessMessage(
        detail.isActive
          ? "Kullanıcı pasife çekildi."
          : "Kullanıcı aktifleştirildi."
      );
      setMode("none");
      await fetchDetail();
      onUpdated();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (e: unknown) {
      setActionError(e instanceof Error ? e.message : "Durum güncellenemedi");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelAction = () => {
    setMode("none");
    setNewPassword("");
    setActionError(null);
  };

  return (
    <div
      className="fixed inset-0 z-999999 flex items-start justify-center overflow-y-auto bg-black/50 pt-10 pb-10"
      onClick={handleBackdropClick}
    >
      <div className="mx-4 w-full max-w-2xl rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Admin Detayı
            </h2>
            {detail && (
              <>
                <Badge size="sm" color={roleBadgeColor(detail.role)}>
                  {ROLE_LABELS[detail.role] ?? detail.role}
                </Badge>
                <Badge
                  size="sm"
                  color={detail.isActive ? "success" : "light"}
                >
                  {detail.isActive ? "Aktif" : "Pasif"}
                </Badge>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          {detail && !loading && (
            <div className="space-y-6">
              {/* Kimlik Bilgileri */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-500 dark:text-gray-400">
                  Kimlik Bilgileri
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem label="Kullanıcı Adı" value={detail.username} mono />
                  <InfoItem label="Ad Soyad" value={detail.fullName} />
                  <InfoItem label="Email" value={detail.email} />
                  <InfoItem
                    label="İki Faktörlü Kimlik Doğrulama"
                    value={detail.twoFactorEnabled ? "Açık" : "Kapalı"}
                  />
                </div>
              </div>

              {/* Oturum Bilgileri */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-500 dark:text-gray-400">
                  Oturum Bilgileri
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem
                    label="Son Giriş"
                    value={formatDate(detail.lastLoginAt)}
                  />
                  <InfoItem
                    label="Başarısız Deneme"
                    value={detail.failedLoginAttempts.toString()}
                  />
                  <InfoItem
                    label="Kilitleme Durumu"
                    value={
                      detail.lockedUntil
                        ? `Kilitli — ${formatDate(detail.lockedUntil)}`
                        : "Kilitli değil"
                    }
                  />
                </div>
              </div>

              {/* Sistem Bilgileri */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-500 dark:text-gray-400">
                  Sistem Bilgileri
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem
                    label="Oluşturulma"
                    value={formatDate(detail.createdAt)}
                  />
                  <InfoItem
                    label="Son Güncelleme"
                    value={formatDate(detail.updatedAt)}
                  />
                </div>
              </div>

              {/* Success toast */}
              {successMessage && (
                <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                  ✓ {successMessage}
                </div>
              )}

              {/* Actions */}
              <div className="border-t border-gray-100 pt-5 dark:border-gray-800">
                <h3 className="mb-3 text-sm font-semibold text-gray-500 dark:text-gray-400">
                  İşlemler
                </h3>

                {mode === "none" && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setMode("reset-password")}
                      className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600"
                    >
                      Parola Sıfırla
                    </button>
                    <button
                      onClick={() => setMode("toggle-status")}
                      className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition ${
                        detail.isActive
                          ? "bg-red-500 hover:bg-red-600"
                          : "bg-emerald-500 hover:bg-emerald-600"
                      }`}
                    >
                      {detail.isActive ? "Pasife Çek" : "Aktifleştir"}
                    </button>
                  </div>
                )}

                {mode === "reset-password" && (
                  <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-white/[0.02]">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Yeni Parola
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      autoFocus
                      className="h-10 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-gray-700 dark:bg-white/[0.03] dark:text-white/90"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      En az 8 karakter, 1 büyük harf ve 1 rakam içermeli.
                    </p>

                    {actionError && (
                      <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                        {actionError}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={handleResetPassword}
                        disabled={actionLoading}
                        className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600 disabled:opacity-50"
                      >
                        {actionLoading ? "Sıfırlanıyor..." : "Onayla"}
                      </button>
                      <button
                        onClick={handleCancelAction}
                        disabled={actionLoading}
                        className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-300 disabled:opacity-50 dark:bg-white/[0.05] dark:text-gray-300 dark:hover:bg-white/[0.08]"
                      >
                        İptal
                      </button>
                    </div>
                  </div>
                )}

                {mode === "toggle-status" && (
                  <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-white/[0.02]">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>{detail.fullName}</strong> kullanıcısını{" "}
                      {detail.isActive ? (
                        <span className="text-red-600 dark:text-red-400">
                          pasife çekmek
                        </span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400">
                          aktifleştirmek
                        </span>
                      )}{" "}
                      istediğinize emin misiniz?
                    </p>

                    {actionError && (
                      <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                        {actionError}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={handleToggleStatus}
                        disabled={actionLoading}
                        className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition disabled:opacity-50 ${
                          detail.isActive
                            ? "bg-red-500 hover:bg-red-600"
                            : "bg-emerald-500 hover:bg-emerald-600"
                        }`}
                      >
                        {actionLoading
                          ? "İşleniyor..."
                          : detail.isActive
                          ? "Evet, Pasife Çek"
                          : "Evet, Aktifleştir"}
                      </button>
                      <button
                        onClick={handleCancelAction}
                        disabled={actionLoading}
                        className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-300 disabled:opacity-50 dark:bg-white/[0.05] dark:text-gray-300 dark:hover:bg-white/[0.08]"
                      >
                        İptal
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs text-gray-500 dark:text-gray-400">{label}</dt>
      <dd
        className={`mt-0.5 text-sm font-medium text-gray-800 dark:text-white/90 ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </dd>
    </div>
  );
}