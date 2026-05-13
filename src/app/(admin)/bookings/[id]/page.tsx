import type { Metadata } from "next";
import BookingDetailClient from "./BookingDetailClient";

export const metadata: Metadata = {
  title: "Rezervasyon Detayı | ATABİLET Admin",
};

export default function BookingDetailPage({ params }: { params: { id: string } }) {
  return <BookingDetailClient bookingId={params.id} />;
}
