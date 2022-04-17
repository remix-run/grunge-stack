// This script will seed the database in your local development environment.
// It doesn't run by default. The script needs to be enabled. See the
// prefs.arc.example file for more details.

import { createUser } from "./app/models/user.server";

(async () => {
  console.log('Seeding database...')
  await createUser('dev@dev', 'password');
  console.log('Database seeded')
})();
