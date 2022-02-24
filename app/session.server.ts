import type { Session } from "remix";
import { redirect } from "remix";
import { createArcTableSessionStorage } from "@remix-run/architect";
import invariant from "tiny-invariant";
import { User } from "./models/user.server";

invariant(process.env.SESSION_SECRET, "SESSION_SECRET must be set");

export const sessionStorage = createArcTableSessionStorage({
  table: "arc-sessions",
  ttl: "_ttl",
  idx: "_idx",
  cookie: {
    name: "__session",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});

const USER_SESSION_KEY = "userId";

export async function getSession(request: Request) {
  return sessionStorage.getSession(request.headers.get("Cookie"));
}

export async function getUserId(request: Request) {
  console.log(request.headers.get("Cookie"));
  const session = await getSession(request);
  console.log(session);
  const user = session.get(USER_SESSION_KEY);
  console.log({ user });
  if (!user) return null;
  return user;
}

export async function getUser(request: Request): Promise<User | null> {
  const userId = await getUserId(request);
  if (!userId) return null;
  return { id: userId };
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const userId = await getUserId(request);
  if (!userId) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
}

export async function requireUser(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
): Promise<User> {
  const userId = await requireUserId(request, redirectTo);
  return { id: userId };
}

export async function createUserSession(
  request: Request,
  userId: string,
  redirectTo: string
) {
  const session = await getSession(request);
  session.set(USER_SESSION_KEY, userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  });
}

export async function logout(request: Request) {
  const session = await getSession(request);
  return redirect("/login", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}
