import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  dateOfBirth: timestamp("date_of_birth"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Medications table
export const medications = pgTable("medications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(),
  brand: varchar("brand"),
  form: varchar("form"), // tablet, capsule, syrup, etc.
  color: varchar("color"), // for pill card visualization
  shape: varchar("shape"), // circle, oval, rectangle
  dosage: varchar("dosage").notNull(),
  schedule: jsonb("schedule").notNull(), // structured schedule data
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  notes: text("notes"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reminder logs for tracking medication adherence
export const reminderLogs = pgTable("reminder_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  medicationId: varchar("medication_id").notNull().references(() => medications.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  scheduledAt: timestamp("scheduled_at").notNull(),
  takenAt: timestamp("taken_at"),
  status: varchar("status").notNull().default("scheduled"), // scheduled, taken, missed, snoozed
  createdAt: timestamp("created_at").defaultNow(),
});

// Appointments table
export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  doctorName: varchar("doctor_name"),
  specialty: varchar("specialty"),
  clinic: varchar("clinic"),
  location: varchar("location"),
  datetime: timestamp("datetime").notNull(),
  notes: text("notes"),
  type: varchar("type").default("checkup"), // checkup, lab, consultation, etc.
  status: varchar("status").default("scheduled"), // scheduled, completed, cancelled
  attachments: jsonb("attachments"), // file URLs and metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Family sharing relationships
export const familyShares = pgTable("family_shares", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ownerId: varchar("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  memberId: varchar("member_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role").notNull().default("viewer"), // viewer, manager
  status: varchar("status").default("pending"), // pending, accepted, declined
  inviteToken: varchar("invite_token"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Emergency contacts
export const emergencyContacts = pgTable("emergency_contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(),
  relation: varchar("relation"),
  phone: varchar("phone").notNull(),
  email: varchar("email"),
  isPrimary: boolean("is_primary").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Health metrics/vitals (optional for wearable integration)
export const healthMetrics = pgTable("health_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type").notNull(), // blood_pressure, blood_sugar, weight, heart_rate, etc.
  value: jsonb("value").notNull(), // structured data for the metric
  unit: varchar("unit"),
  recordedAt: timestamp("recorded_at").notNull(),
  source: varchar("source").default("manual"), // manual, device, import
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  medications: many(medications),
  appointments: many(appointments),
  reminderLogs: many(reminderLogs),
  emergencyContacts: many(emergencyContacts),
  healthMetrics: many(healthMetrics),
  ownedShares: many(familyShares, { relationName: "owner" }),
  memberShares: many(familyShares, { relationName: "member" }),
}));

export const medicationsRelations = relations(medications, ({ one, many }) => ({
  user: one(users, {
    fields: [medications.userId],
    references: [users.id],
  }),
  reminderLogs: many(reminderLogs),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  user: one(users, {
    fields: [appointments.userId],
    references: [users.id],
  }),
}));

export const reminderLogsRelations = relations(reminderLogs, ({ one }) => ({
  medication: one(medications, {
    fields: [reminderLogs.medicationId],
    references: [medications.id],
  }),
  user: one(users, {
    fields: [reminderLogs.userId],
    references: [users.id],
  }),
}));

export const familySharesRelations = relations(familyShares, ({ one }) => ({
  owner: one(users, {
    fields: [familyShares.ownerId],
    references: [users.id],
    relationName: "owner",
  }),
  member: one(users, {
    fields: [familyShares.memberId],
    references: [users.id],
    relationName: "member",
  }),
}));

export const emergencyContactsRelations = relations(emergencyContacts, ({ one }) => ({
  user: one(users, {
    fields: [emergencyContacts.userId],
    references: [users.id],
  }),
}));

export const healthMetricsRelations = relations(healthMetrics, ({ one }) => ({
  user: one(users, {
    fields: [healthMetrics.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMedicationSchema = createInsertSchema(medications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReminderLogSchema = createInsertSchema(reminderLogs).omit({
  id: true,
  createdAt: true,
});

export const insertEmergencyContactSchema = createInsertSchema(emergencyContacts).omit({
  id: true,
  createdAt: true,
});

export const insertHealthMetricSchema = createInsertSchema(healthMetrics).omit({
  id: true,
  createdAt: true,
});

export const insertFamilyShareSchema = createInsertSchema(familyShares).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertMedication = z.infer<typeof insertMedicationSchema>;
export type Medication = typeof medications.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertReminderLog = z.infer<typeof insertReminderLogSchema>;
export type ReminderLog = typeof reminderLogs.$inferSelect;
export type InsertEmergencyContact = z.infer<typeof insertEmergencyContactSchema>;
export type EmergencyContact = typeof emergencyContacts.$inferSelect;
export type InsertHealthMetric = z.infer<typeof insertHealthMetricSchema>;
export type HealthMetric = typeof healthMetrics.$inferSelect;
export type InsertFamilyShare = z.infer<typeof insertFamilyShareSchema>;
export type FamilyShare = typeof familyShares.$inferSelect;
