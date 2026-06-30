import { createTodo, deleteTodo, toggleTodo } from "@/app/actions/todos";
import { signout } from "@/app/actions/auth";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function TodosPage() {
  const user = await requireUser();
  const todos = await prisma.todo.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main>
      <header>
        <h1>Your todos</h1>
        <form action={signout}>
          <button type="submit">Log out</button>
        </form>
      </header>

      <section>
        <form action={createTodo}>
          <input name="title" placeholder="New todo" required />
          <input name="description" placeholder="Description (optional)" />
          <button type="submit">Add</button>
        </form>
      </section>

      <section>
        {todos.length === 0 ? (
          <p>No todos yet</p>
        ) : (
          <ul>
            {todos.map((t) => (
              <li key={t.id}>
                <form action={toggleTodo}>
                  <input type="hidden" name="id" value={t.id} />
                  <button type="submit">{t.completed ? "Undo" : "Done"}</button>
                </form>

                <span>{t.completed ? <s>{t.title}</s> : t.title}</span>

                <form action={deleteTodo}>
                  <input type="hidden" name="id" value={t.id} />
                  <button type="submit">Delete</button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
