import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "@/app/ui/LoginForm";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/todos");

  return (
    <main>
      <LoginForm />
    </main>
  );
}
