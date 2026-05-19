import { redirect } from "next/navigation";

// /register is an alias for /signup — canonical page is /signup
export default function RegisterPage() {
  redirect("/signup");
}
