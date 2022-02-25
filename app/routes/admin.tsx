import arc from "@architect/functions";
import type { LoaderFunction } from "remix";

export const loader: LoaderFunction = async () => {
  const db = await arc.tables();
  return {
    users: await db.user.scan({}),
    passwords: await db.password.scan({}),
    notes: await db.note.scan({}),
  };
};
