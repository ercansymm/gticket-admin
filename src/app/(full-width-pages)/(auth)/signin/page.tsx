import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ATABİLET Admin | Giriş",
  description: "ATABİLET Admin Panel giriş sayfası",
};

export default function SignIn() {
  return <SignInForm />;
}
