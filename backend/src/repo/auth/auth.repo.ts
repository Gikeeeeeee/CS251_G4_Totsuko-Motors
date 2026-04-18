import { eq, or } from 'drizzle-orm';
import { db } from '../../db';
import { userAccount } from '../../db/schema';

export async function findUserByEmail(email: string) {
  const users = await db.select().from(userAccount).where(eq(userAccount.email, email)).limit(1);
  return users[0];
}

export async function findUserByUserId(userId: string) {
  const users = await db.select().from(userAccount).where(eq(userAccount.userId, userId)).limit(1);
  return users[0];
}

export async function findExistingUser(email: string, username: string, userId: string) {
  const users = await db
    .select()
    .from(userAccount)
    .where(
      or(
        eq(userAccount.email, email),
        eq(userAccount.username, username),
        eq(userAccount.userId, userId),
      ),
    )
    .limit(1);

  return users[0];
}

export async function createUser(data: {
  userId: string;
  email: string;
  username: string;
  password: string;
}) {
  const users = await db
    .insert(userAccount)
    .values({
      ...data,
      role: 'user',
      status: 'Active',
    })
    .returning();

  return users[0];
}
