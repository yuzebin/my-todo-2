import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { SignupForm } from "@/app/ui/SignupForm";

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/todos");

  return (
    <main>
      <SignupForm />
    </main>
  );
}
