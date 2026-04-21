import { pgTable, varchar, text, date } from 'drizzle-orm/pg-core';

export const userAccount = pgTable('UserAccount', {
  userId: varchar('user_id', { length: 10 }).primaryKey(),
  employeeId: varchar('employee_id', { length: 10 }).unique().notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 100 }).unique().notNull(),
  username: varchar('username', { length: 50 }).unique().notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  phone: text('phone').array(),
  address: varchar('address', { length: 255 }),
  role: varchar('role', { length: 20 }).notNull(),
  status: varchar('status', { length: 20 }).default('Active'),
  hireDate: date('hire_date').notNull(),
});
