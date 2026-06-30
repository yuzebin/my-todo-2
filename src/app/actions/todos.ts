"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CreateTodoSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
});

export async function createTodo(formData: FormData) {
  const user = await requireUser();
  const parsed = CreateTodoSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
  });

  if (!parsed.success) return;

  await prisma.todo.create({
    data: {
      userId: user.id,
      title: parsed.data.title,
      description: parsed.data.description && parsed.data.description.length > 0 ? parsed.data.description : null,
    },
  });

  revalidatePath("/todos");
}

export async function toggleTodo(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const todo = await prisma.todo.findFirst({ where: { id, userId: user.id } });
  if (!todo) return;

  await prisma.todo.update({
    where: { id },
    data: { completed: !todo.completed },
  });

  revalidatePath("/todos");
}

export async function deleteTodo(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.todo.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/todos");
}
