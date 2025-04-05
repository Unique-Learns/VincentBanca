import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model - for authentication and profile data
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  username: text("username").notNull(),
  avatar: text("avatar"),
  status: text("status").default("Hey, I'm using BancaMessenger!"),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  username: true,
  avatar: true,
  status: true,
  verified: true
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Contacts model - for user's contacts
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  contactId: integer("contact_id").notNull(),
  contactName: text("contact_name").notNull(), // Name as saved by the user
  createdAt: timestamp("created_at").defaultNow()
});

export const insertContactSchema = createInsertSchema(contacts).pick({
  userId: true,
  contactId: true,
  contactName: true
});

export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;

// Conversations model - to track conversations between users
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  participantA: integer("participant_a").notNull(),
  participantB: integer("participant_b").notNull(),
  lastMessageTime: timestamp("last_message_time").defaultNow(),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertConversationSchema = createInsertSchema(conversations).pick({
  participantA: true,
  participantB: true
});

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

// Messages model - for the actual messages in conversations
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  senderId: integer("sender_id").notNull(),
  content: text("content").notNull(),
  status: text("status").default("sent"), // sent, delivered, read
  timestamp: timestamp("timestamp").defaultNow()
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  conversationId: true,
  senderId: true,
  content: true,
  status: true
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Verification code model - for storing verification codes
export const verificationCodes = pgTable("verification_codes", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertVerificationCodeSchema = createInsertSchema(verificationCodes).pick({
  email: true,
  code: true,
  expiresAt: true
});

export type InsertVerificationCode = z.infer<typeof insertVerificationCodeSchema>;
export type VerificationCode = typeof verificationCodes.$inferSelect;
