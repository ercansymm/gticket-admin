import type { Metadata } from "next";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import RecentBookings from "@/components/ecommerce/RecentBookings";


export const metadata: Metadata = {
  title: "Dashboard | ATABİLET Admin",
  description: "ATABİLET Admin Panel - Genel Bakış",
};

import DashboardClient from "./DashboardClient";

export default function Dashboard() {
  return <DashboardClient />;
}