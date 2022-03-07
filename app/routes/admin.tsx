import type { LoaderFunction } from "remix";
import { json, useLoaderData } from "remix";
import arc from "@architect/functions";

type LoaderData = {};

export const loader: LoaderFunction = async () => {
  const db = await arc.tables();
  return json<LoaderData>({
    notes: await db.note.scan({}),
    users: await db.user.scan({}),
    password: await db.password.scan({}),
  });
};
