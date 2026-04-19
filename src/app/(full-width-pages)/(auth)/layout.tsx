import GridShape from "@/components/common/GridShape";
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";

import { ThemeProvider } from "@/context/ThemeContext";
import Image from "next/image";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <ThemeProvider>
        <div className="relative flex lg:flex-row w-full h-screen justify-center flex-col dark:bg-gray-900 sm:p-0">
          {children}

          {/* Right brand panel */}
          <div className="relative lg:w-1/2 w-full h-full hidden lg:flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#0a1628] via-[#0f2540] to-[#047857] dark:from-gray-950 dark:via-gray-900 dark:to-[#064e3b]">
            <div className="absolute inset-0 opacity-30">
              <GridShape />
            </div>

            <div className="relative z-10 flex flex-col items-center max-w-sm px-6 text-center">
              <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-white shadow-2xl shadow-emerald-900/40 ring-1 ring-white/20">
                <Image
                  src="/images/logo/atabilet-icon.svg"
                  alt="ATABİLET"
                  width={64}
                  height={64}
                  priority
                />
              </div>

              <h2 className="mb-3 text-3xl font-bold tracking-tight text-white">
                ATABİLET
              </h2>
              <p className="mb-2 text-base font-medium text-emerald-300">
                Yönetim Paneli
              </p>
              <p className="text-sm leading-relaxed text-white/60">
                Uçuş satışlarınızı, rezervasyonlarınızı ve müşterilerinizi
                tek bir noktadan yönetin.
              </p>

              <div className="mt-10 flex items-center gap-6 text-xs text-white/40">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>Güvenli Bağlantı</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>2FA Destekli</span>
                </div>
              </div>
            </div>
          </div>

          <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
            <ThemeTogglerTwo />
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
}
