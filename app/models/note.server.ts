import cuid from "cuid";
import arc from "@architect/functions";

export type Note = {
  id: string;
  userId: string;
  title: string;
  body: string;
};

export async function getNotes(userId: string): Promise<Array<Note>> {
  const db = await arc.tables();

  const result = await db.note.query({
    KeyConditionExpression: "pk = :pk",
    ExpressionAttributeValues: { ":pk": userId },
  });

  return result.Items.map((n: any) => ({
    title: n.title,
    body: n.body,
    userId: n.pk,
    id: n.sk,
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
}) {
  const db = await arc.tables();

  return db.note.put({
    pk: userId,
    sk: `note#${cuid()}`,
    title: title,
    body: body,
  });
}

export async function deleteNote({
  id,
  userId,
}: {
  id: string;
  userId: string;
}) {
  const db = await arc.tables();
  return db.note.delete({ pk: userId, sk: id });
}
