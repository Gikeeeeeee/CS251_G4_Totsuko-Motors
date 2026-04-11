import { pgTable, varchar } from 'drizzle-orm/pg-core';

export const userAccount = pgTable('UserAccount', {
  userId: varchar('user_id', { length: 10 }).primaryKey(),
  email: varchar('email', { length: 100 }).unique().notNull(),
  username: varchar('username', { length: 50 }).unique().notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  role: varchar('role', { length: 20 }),
  status: varchar('status', { length: 20 }).default('Active'),
});