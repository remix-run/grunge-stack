// Use this to delete a user by their email
// Simply call this with:
// node --require esbuild-register ./cypress/support/delete-user.ts username@example.com
// and that user will get deleted

import { installGlobals } from "@remix-run/node/globals";
import { deleteUser } from "~/models/user.server";

installGlobals();

async function deleteTestUser(email: string) {
  if (!email) {
    throw new Error("email required for delete");
  }
  if (!email.endsWith("@example.com")) {
    throw new Error("All test emails must end in @example.com");
  }

  await deleteUser(email);
}

deleteTestUser(process.argv[2]);
