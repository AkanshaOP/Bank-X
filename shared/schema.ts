import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  aadhaarNumber: text("aadhaar_number").notNull().unique(),
  mobileNumber: text("mobile_number").notNull(),
  balance: integer("balance").notNull().default(10000), // Starting with $100.00
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: integer("amount").notNull(), // In cents
  type: text("type").notNull(), // 'credit' or 'debit'
  description: text("description").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users)
  .pick({
    username: true,
    password: true,
    fullName: true,
    aadhaarNumber: true,
    mobileNumber: true,
  })
  .extend({
    aadhaarNumber: z.string().length(12, "Aadhaar number must be 12 digits"),
    mobileNumber: z.string().length(10, "Mobile number must be 10 digits"),
  });

export const insertTransactionSchema = createInsertSchema(transactions);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;