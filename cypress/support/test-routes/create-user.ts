import type { ActionFunction } from "remix";
import { redirect } from "remix";
import { createUser } from "~/models/user.server";
import { createUserSession } from "~/session.server";

export const action: ActionFunction = async ({ request }) => {
  if (
    process.env.ENABLE_TEST_ROUTES !== "true" ||
    process.env.NODE_ENV === "production"
  ) {
    // test routes should not be enabled in production or without
    // enable test routes... Just in case this somehow slips through
    // we'll redirect :)
    return redirect("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  }

  const { email } = await request.json();
  if (!email) {
    throw new Error("email required for login");
  }
  if (!email.endsWith("@example.com")) {
    throw new Error("All test emails must end in @example.com");
  }

  const user = await createUser(email, "myreallystrongpassword");

  return createUserSession({
    request,
    userId: user.id,
    remember: true,
    redirectTo: "/",
  });
};
