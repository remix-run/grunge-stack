import { createUser } from "./app/models/user.server";

(async () => {
  console.log('Seeding database...')
  await createUser('dev@dev', 'password');
  console.log('Database seeded')
})();
