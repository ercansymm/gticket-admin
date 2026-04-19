"use client";
import React, { useEffect, useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { useAuth } from "@/context/AuthContext";

const ROLE_LABELS: Record<string, string> = {
  SuperAdmin: "Süper Yönetici",
  DepartmentAdmin: "Departman Yöneticisi",
};

function getInitials(fullName: string | undefined | null): string {
  if (!fullName) return "?";
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function UserDropdown() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  function toggleDropdown(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  // Escape key closes the dropdown
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen]);

  async function handleSignOut() {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await signOut();
    } finally {
      setIsSigningOut(false);
    }
  }

  const initials = getInitials(user?.fullName);
  const roleLabel = user?.role ? ROLE_LABELS[user.role] ?? user.role : "";

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center text-gray-700 dark:text-gray-400 dropdown-toggle"
        aria-label="Kullanıcı menüsü"
        aria-expanded={isOpen}
      >
        <span className="mr-3 flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-sm font-semibold text-white">
          {initials}
        </span>

        <span className="mr-1 hidden text-left sm:block">
          <span className="block text-theme-sm font-medium text-gray-800 dark:text-white/90">
            {user?.fullName ?? "Kullanıcı"}
          </span>
          {roleLabel && (
            <span className="block text-theme-xs text-gray-500 dark:text-gray-400">
              {roleLabel}
            </span>
          )}
        </span>

        <svg
          className={`stroke-gray-500 transition-transform duration-200 dark:stroke-gray-400 ${
            isOpen ? "rotate-180" : ""
          }`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[280px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        {/* User info card */}
        <div className="flex items-center gap-3 px-2 pb-3">
          <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-base font-semibold text-white">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <span className="block truncate text-theme-sm font-semibold text-gray-800 dark:text-white/90">
              {user?.fullName ?? "Kullanıcı"}
            </span>
            <span className="block truncate text-theme-xs text-gray-500 dark:text-gray-400">
              {user?.email ?? ""}
            </span>
            {roleLabel && (
              <span className="mt-0.5 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                {roleLabel}
              </span>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800" />

        <ul className="flex flex-col gap-1 py-2">
          <li>
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="flex w-full cursor-not-allowed items-center justify-between gap-3 rounded-lg px-3 py-2 text-theme-sm font-medium text-gray-400 dark:text-gray-500"
            >
              <span className="flex items-center gap-3">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-3.31 0-8 1.66-8 5v1h16v-1c0-3.34-4.69-5-8-5z"
                    fill="currentColor"
                  />
                </svg>
                Profilim
              </span>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                yakında
              </span>
            </button>
          </li>
        </ul>

        <div className="border-t border-gray-200 dark:border-gray-800" />

        <ul className="flex flex-col gap-1 pt-2">
          <li>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-theme-sm font-medium text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60 dark:text-rose-400 dark:hover:bg-rose-500/10"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M15.1007 19.247C14.6865 19.247 14.3507 18.9112 14.3507 18.497L14.3507 14.245H12.8507V18.497C12.8507 19.7396 13.8581 20.747 15.1007 20.747H18.5007C19.7434 20.747 20.7507 19.7396 20.7507 18.497L20.7507 5.49609C20.7507 4.25345 19.7433 3.24609 18.5007 3.24609H15.1007C13.8581 3.24609 12.8507 4.25345 12.8507 5.49609V9.74501L14.3507 9.74501V5.49609C14.3507 5.08188 14.6865 4.74609 15.1007 4.74609L18.5007 4.74609C18.9149 4.74609 19.2507 5.08188 19.2507 5.49609L19.2507 18.497C19.2507 18.9112 18.9149 19.247 18.5007 19.247H15.1007ZM3.25073 11.9984C3.25073 12.2144 3.34204 12.4091 3.48817 12.546L8.09483 17.1556C8.38763 17.4485 8.86251 17.4487 9.15549 17.1559C9.44848 16.8631 9.44863 16.3882 9.15583 16.0952L5.81116 12.7484L16.0007 12.7484C16.4149 12.7484 16.7507 12.4127 16.7507 11.9984C16.7507 11.5842 16.4149 11.2484 16.0007 11.2484L5.81528 11.2484L9.15585 7.90554C9.44864 7.61255 9.44847 7.13767 9.15547 6.84488C8.86248 6.55209 8.3876 6.55226 8.09481 6.84525L3.52309 11.4202C3.35673 11.5577 3.25073 11.7657 3.25073 11.9984Z"
                  fill="currentColor"
                />
              </svg>
              {isSigningOut ? "Çıkış yapılıyor..." : "Çıkış Yap"}
            </button>
          </li>
        </ul>
      </Dropdown>
    </div>
  );
}
