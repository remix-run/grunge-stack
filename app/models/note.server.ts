import cuid from "cuid";
import arc from "@architect/functions";

export type Note = {
  id: string;
  userId: string;
  title: string;
  body: string;
};

const skToId = (sk: string) => sk.replace(/^note#/, "");
const idToSk = (id: string) => `note#${id}`;

export async function getNote({
  userId,
  id,
}: {
  userId: string;
  id: string;
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
  userId: string;
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
  title: string;
  body: string;
  userId: string;
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
  id: string;
  userId: string;
}) {
  const db = await arc.tables();
  return db.note.delete({ pk: userId, sk: idToSk(id) });
}
