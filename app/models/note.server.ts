import arc from "@architect/functions";
import cuid from "cuid";

import type { User } from "./user.server";

export type Note = {
  id: ReturnType<typeof cuid>;
  userId: User["id"];
  title: string;
  body: string;
};

type NoteItem = {
  pk: User["id"];
  sk: `note#${Note["id"]}`;
};

const skToId = (sk: NoteItem["sk"]): Note["id"] => sk.replace(/^note#/, "");
const idToSk = (id: Note["id"]): NoteItem["sk"] => `note#${id}`;

export async function getNote({
  id,
  userId,
}: Pick<Note, "id" | "userId">): Promise<Note | null> {
  const db = await arc.tables();

  const result = await db.note.get({ pk: userId, sk: idToSk(id) });

  if (result) {
    return {
      userId: result.pk,
      id: result.sk,
      title: result.title,
      body: result.body,
    };
  }
  return null;
}

export async function getNoteListItems({
  userId,
}: Pick<Note, "userId">): Promise<Array<Pick<Note, "id" | "title">>> {
  const db = await arc.tables();

  const result = await db.note.query({
    KeyConditionExpression: "pk = :pk",
    ExpressionAttributeValues: { ":pk": userId },
  });

  return result.Items.map((n: any) => ({
    title: n.title,
    id: skToId(n.sk),
  }));
}

export async function createNote({
  body,
  title,
  userId,
}: Pick<Note, "body" | "title" | "userId">): Promise<Note> {
  const db = await arc.tables();

  const result = await db.note.put({
    pk: userId,
    sk: idToSk(cuid()),
    title: title,
    body: body,
  });
  return {
    id: skToId(result.sk),
    userId: result.pk,
    title: result.title,
    body: result.body,
  };
}

export async function deleteNote({ id, userId }: Pick<Note, "id" | "userId">) {
  const db = await arc.tables();
  return db.note.delete({ pk: userId, sk: idToSk(id) });
}
