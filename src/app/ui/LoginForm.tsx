"use client";

import Link from "next/link";
import { useActionState } from "react";

import { login } from "@/app/actions/auth";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action}>
      <h1>Log in</h1>

      <label>
        Email
        <input name="email" type="email" autoComplete="email" required />
      </label>
      {state?.fieldErrors?.email?.length ? <p>{state.fieldErrors.email[0]}</p> : null}

      <label>
        Password
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      {state?.fieldErrors?.password?.length ? <p>{state.fieldErrors.password[0]}</p> : null}

      {state?.error ? <p>{state.error}</p> : null}

      <button type="submit" disabled={pending}>
        Log in
      </button>

      <p>
        No account yet? <Link href="/register">Register</Link>
      </p>
    </form>
  );
}
