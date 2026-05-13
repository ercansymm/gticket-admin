import type { Metadata } from "next";
import BookingDetailClient from "./BookingDetailClient";

export const metadata: Metadata = {
  title: "Rezervasyon Detayı | ATABİLET Admin",
};

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BookingDetailClient bookingId={id} />;
}
