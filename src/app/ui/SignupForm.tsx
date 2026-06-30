"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signup } from "@/app/actions/auth";

export function SignupForm() {
  const [state, action, pending] = useActionState(signup, undefined);

  return (
    <form action={action}>
      <h1>Create account</h1>

      <label>
        Name
        <input name="name" autoComplete="name" />
      </label>
      {state?.fieldErrors?.name?.length ? <p>{state.fieldErrors.name[0]}</p> : null}

      <label>
        Email
        <input name="email" type="email" autoComplete="email" required />
      </label>
      {state?.fieldErrors?.email?.length ? <p>{state.fieldErrors.email[0]}</p> : null}

      <label>
        Password
        <input name="password" type="password" autoComplete="new-password" required />
      </label>
      {state?.fieldErrors?.password?.length ? <p>{state.fieldErrors.password[0]}</p> : null}

      {state?.error ? <p>{state.error}</p> : null}

      <button type="submit" disabled={pending}>
        Sign up
      </button>

      <p>
        Already have an account? <Link href="/login">Log in</Link>
      </p>
    </form>
  );
}
