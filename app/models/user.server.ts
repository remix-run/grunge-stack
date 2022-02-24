import arc from "@architect/functions";
import bcrypt from "bcryptjs";

export type User = { id: string };
export type Password = { password: string };

async function getUserByEmail(email: string) {
  const db = await arc.tables();
  const result = await db.people.query({
    KeyConditionExpression: "pk = :pk",
    ExpressionAttributeValues: { ":pk": `email#${email}` },
  });

  return result.Items[0] as User;
}

async function getUserPasswordByEmail(email: string) {
  const db = await arc.tables();
  const result = await db.password.query({
    KeyConditionExpression: "pk = :pk",
    ExpressionAttributeValues: { ":pk": `email#${email}` },
  });

  return result.Items[0] as Password;
}

async function createUser(email: string, password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const db = await arc.tables();
  await db.password.put({
    pk: `email#${email}`,
    password: hashedPassword,
  });

  await db.people.put({
    pk: `email#${email}`,
  });

  const user = await getUserByEmail(email);

  return user;
}

async function verifyLogin(email: string, password: string) {
  const userPassword = await getUserPasswordByEmail(email);

  if (!userPassword) {
    return undefined;
  }

  const isValid = await bcrypt.compare(password, userPassword.password);
  if (!isValid) {
    return undefined;
  }

  return getUserByEmail(email);
}

export { getUserByEmail, createUser, verifyLogin };
