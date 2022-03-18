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
  userId,
  id,
}: {
  userId: Note["userId"];
  id: Note["id"];
}): Promise<Note | null> {
  const db = await arc.tables();

  const result = await await db.note.get({ pk: userId, sk: idToSk(id) });

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
}: {
  userId: Note["userId"];
}): Promise<Array<Pick<Note, "id" | "title">>> {
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
  title,
  body,
  userId,
}: {
  title: Note["title"];
  body: Note["body"];
  userId: Note["userId"];
}): Promise<Note> {
  const db = await arc.tables();

  const result = await db.note.put({
    pk: userId,
    sk: `note#${cuid()}`,
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

export async function deleteNote({
  id,
  userId,
}: {
  id: Note["id"];
  userId: Note["userId"];
}) {
  const db = await arc.tables();
  return db.note.delete({ pk: userId, sk: idToSk(id) });
}
