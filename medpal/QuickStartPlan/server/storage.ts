import {
  users,
  medications,
  appointments,
  reminderLogs,
  emergencyContacts,
  healthMetrics,
  familyShares,
  type User,
  type UpsertUser,
  type Medication,
  type InsertMedication,
  type Appointment,
  type InsertAppointment,
  type ReminderLog,
  type InsertReminderLog,
  type EmergencyContact,
  type InsertEmergencyContact,
  type HealthMetric,
  type InsertHealthMetric,
  type FamilyShare,
  type InsertFamilyShare,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, gte, lte, or } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Medication operations
  getMedications(userId: string): Promise<Medication[]>;
  getMedication(id: string, userId: string): Promise<Medication | undefined>;
  createMedication(medication: InsertMedication): Promise<Medication>;
  updateMedication(id: string, userId: string, medication: Partial<InsertMedication>): Promise<Medication | undefined>;
  deleteMedication(id: string, userId: string): Promise<boolean>;

  // Appointment operations
  getAppointments(userId: string): Promise<Appointment[]>;
  getAppointment(id: string, userId: string): Promise<Appointment | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: string, userId: string, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined>;
  deleteAppointment(id: string, userId: string): Promise<boolean>;

  // Reminder operations
  getReminderLogs(userId: string, startDate?: Date, endDate?: Date): Promise<ReminderLog[]>;
  createReminderLog(reminderLog: InsertReminderLog): Promise<ReminderLog>;
  updateReminderLog(id: string, userId: string, status: string, takenAt?: Date): Promise<ReminderLog | undefined>;

  // Emergency contact operations
  getEmergencyContacts(userId: string): Promise<EmergencyContact[]>;
  createEmergencyContact(contact: InsertEmergencyContact): Promise<EmergencyContact>;
  updateEmergencyContact(id: string, userId: string, contact: Partial<InsertEmergencyContact>): Promise<EmergencyContact | undefined>;
  deleteEmergencyContact(id: string, userId: string): Promise<boolean>;

  // Health metrics operations
  getHealthMetrics(userId: string, type?: string): Promise<HealthMetric[]>;
  createHealthMetric(metric: InsertHealthMetric): Promise<HealthMetric>;

  // Family sharing operations
  getFamilyShares(userId: string): Promise<FamilyShare[]>;
  createFamilyShare(share: InsertFamilyShare): Promise<FamilyShare>;
  updateFamilyShare(id: string, status: string): Promise<FamilyShare | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Medication operations
  async getMedications(userId: string): Promise<Medication[]> {
    return await db
      .select()
      .from(medications)
      .where(and(eq(medications.userId, userId), eq(medications.isActive, true)))
      .orderBy(asc(medications.name));
  }

  async getMedication(id: string, userId: string): Promise<Medication | undefined> {
    const [medication] = await db
      .select()
      .from(medications)
      .where(and(eq(medications.id, id), eq(medications.userId, userId)));
    return medication;
  }

  async createMedication(medication: InsertMedication): Promise<Medication> {
    const [newMedication] = await db
      .insert(medications)
      .values(medication)
      .returning();
    return newMedication;
  }

  async updateMedication(id: string, userId: string, medication: Partial<InsertMedication>): Promise<Medication | undefined> {
    const [updated] = await db
      .update(medications)
      .set({ ...medication, updatedAt: new Date() })
      .where(and(eq(medications.id, id), eq(medications.userId, userId)))
      .returning();
    return updated;
  }

  async deleteMedication(id: string, userId: string): Promise<boolean> {
    const [deleted] = await db
      .update(medications)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(eq(medications.id, id), eq(medications.userId, userId)))
      .returning();
    return !!deleted;
  }

  // Appointment operations
  async getAppointments(userId: string): Promise<Appointment[]> {
    return await db
      .select()
      .from(appointments)
      .where(eq(appointments.userId, userId))
      .orderBy(asc(appointments.datetime));
  }

  async getAppointment(id: string, userId: string): Promise<Appointment | undefined> {
    const [appointment] = await db
      .select()
      .from(appointments)
      .where(and(eq(appointments.id, id), eq(appointments.userId, userId)));
    return appointment;
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const [newAppointment] = await db
      .insert(appointments)
      .values(appointment)
      .returning();
    return newAppointment;
  }

  async updateAppointment(id: string, userId: string, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const [updated] = await db
      .update(appointments)
      .set({ ...appointment, updatedAt: new Date() })
      .where(and(eq(appointments.id, id), eq(appointments.userId, userId)))
      .returning();
    return updated;
  }

  async deleteAppointment(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(appointments)
      .where(and(eq(appointments.id, id), eq(appointments.userId, userId)))
      .returning();
    return result.length > 0;
  }

  // Reminder operations
  async getReminderLogs(userId: string, startDate?: Date, endDate?: Date): Promise<ReminderLog[]> {
    let whereConditions = [eq(reminderLogs.userId, userId)];

    if (startDate && endDate) {
      whereConditions.push(
        gte(reminderLogs.scheduledAt, startDate),
        lte(reminderLogs.scheduledAt, endDate)
      );
    }

    return await db
      .select()
      .from(reminderLogs)
      .where(and(...whereConditions))
      .orderBy(desc(reminderLogs.scheduledAt));
  }

  async createReminderLog(reminderLog: InsertReminderLog): Promise<ReminderLog> {
    const [newLog] = await db
      .insert(reminderLogs)
      .values(reminderLog)
      .returning();
    return newLog;
  }

  async updateReminderLog(id: string, userId: string, status: string, takenAt?: Date): Promise<ReminderLog | undefined> {
    const [updated] = await db
      .update(reminderLogs)
      .set({ status, takenAt })
      .where(and(eq(reminderLogs.id, id), eq(reminderLogs.userId, userId)))
      .returning();
    return updated;
  }

  // Emergency contact operations
  async getEmergencyContacts(userId: string): Promise<EmergencyContact[]> {
    return await db
      .select()
      .from(emergencyContacts)
      .where(eq(emergencyContacts.userId, userId))
      .orderBy(desc(emergencyContacts.isPrimary), asc(emergencyContacts.name));
  }

  async createEmergencyContact(contact: InsertEmergencyContact): Promise<EmergencyContact> {
    const [newContact] = await db
      .insert(emergencyContacts)
      .values(contact)
      .returning();
    return newContact;
  }

  async updateEmergencyContact(id: string, userId: string, contact: Partial<InsertEmergencyContact>): Promise<EmergencyContact | undefined> {
    const [updated] = await db
      .update(emergencyContacts)
      .set(contact)
      .where(and(eq(emergencyContacts.id, id), eq(emergencyContacts.userId, userId)))
      .returning();
    return updated;
  }

  async deleteEmergencyContact(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(emergencyContacts)
      .where(and(eq(emergencyContacts.id, id), eq(emergencyContacts.userId, userId)))
      .returning();
    return result.length > 0;
  }

  // Health metrics operations
  async getHealthMetrics(userId: string, type?: string): Promise<HealthMetric[]> {
    let whereConditions = [eq(healthMetrics.userId, userId)];

    if (type) {
      whereConditions.push(eq(healthMetrics.type, type));
    }

    return await db
      .select()
      .from(healthMetrics)
      .where(and(...whereConditions))
      .orderBy(desc(healthMetrics.recordedAt));
  }

  async createHealthMetric(metric: InsertHealthMetric): Promise<HealthMetric> {
    const [newMetric] = await db
      .insert(healthMetrics)
      .values(metric)
      .returning();
    return newMetric;
  }

  // Family sharing operations
  async getFamilyShares(userId: string): Promise<FamilyShare[]> {
    return await db
      .select()
      .from(familyShares)
      .where(or(eq(familyShares.ownerId, userId), eq(familyShares.memberId, userId)))
      .orderBy(desc(familyShares.createdAt));
  }

  async createFamilyShare(share: InsertFamilyShare): Promise<FamilyShare> {
    const [newShare] = await db
      .insert(familyShares)
      .values(share)
      .returning();
    return newShare;
  }

  async updateFamilyShare(id: string, status: string): Promise<FamilyShare | undefined> {
    const [updated] = await db
      .update(familyShares)
      .set({ status, updatedAt: new Date() })
      .where(eq(familyShares.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
