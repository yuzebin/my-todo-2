import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ marginTop: 0 }}>my-todo-2</h1>
      <p>Multi-user to-do list application.</p>
      <ul>
        <li>
          <Link href="/api/auth/signin">Sign in</Link>
        </li>
        <li>
          <Link href="/api/todos">Todos API</Link>
        </li>
      </ul>
    </main>
  );
}
