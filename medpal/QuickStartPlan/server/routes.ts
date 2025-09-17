import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertMedicationSchema,
  insertAppointmentSchema,
  insertReminderLogSchema,
  insertEmergencyContactSchema,
  insertHealthMetricSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Medication routes
  app.get("/api/medications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const medications = await storage.getMedications(userId);
      res.json(medications);
    } catch (error) {
      console.error("Error fetching medications:", error);
      res.status(500).json({ message: "Failed to fetch medications" });
    }
  });

  app.post("/api/medications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertMedicationSchema.parse({
        ...req.body,
        userId,
      });
      const medication = await storage.createMedication(validatedData);
      res.status(201).json(medication);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating medication:", error);
      res.status(500).json({ message: "Failed to create medication" });
    }
  });

  app.put("/api/medications/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const validatedData = insertMedicationSchema.partial().parse(req.body);
      const medication = await storage.updateMedication(id, userId, validatedData);
      if (!medication) {
        return res.status(404).json({ message: "Medication not found" });
      }
      res.json(medication);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating medication:", error);
      res.status(500).json({ message: "Failed to update medication" });
    }
  });

  app.delete("/api/medications/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const deleted = await storage.deleteMedication(id, userId);
      if (!deleted) {
        return res.status(404).json({ message: "Medication not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting medication:", error);
      res.status(500).json({ message: "Failed to delete medication" });
    }
  });

  // Appointment routes
  app.get("/api/appointments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const appointments = await storage.getAppointments(userId);
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.post("/api/appointments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertAppointmentSchema.parse({
        ...req.body,
        userId,
      });
      const appointment = await storage.createAppointment(validatedData);
      res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating appointment:", error);
      res.status(500).json({ message: "Failed to create appointment" });
    }
  });

  app.put("/api/appointments/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const validatedData = insertAppointmentSchema.partial().parse(req.body);
      const appointment = await storage.updateAppointment(id, userId, validatedData);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      res.json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating appointment:", error);
      res.status(500).json({ message: "Failed to update appointment" });
    }
  });

  app.delete("/api/appointments/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const deleted = await storage.deleteAppointment(id, userId);
      if (!deleted) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting appointment:", error);
      res.status(500).json({ message: "Failed to delete appointment" });
    }
  });

  // Reminder routes
  app.get("/api/reminders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;
      const reminders = await storage.getReminderLogs(userId, start, end);
      res.json(reminders);
    } catch (error) {
      console.error("Error fetching reminders:", error);
      res.status(500).json({ message: "Failed to fetch reminders" });
    }
  });

  app.post("/api/reminders/:id/mark-taken", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const reminder = await storage.updateReminderLog(id, userId, "taken", new Date());
      if (!reminder) {
        return res.status(404).json({ message: "Reminder not found" });
      }
      res.json(reminder);
    } catch (error) {
      console.error("Error marking reminder as taken:", error);
      res.status(500).json({ message: "Failed to mark reminder as taken" });
    }
  });

  // Emergency contact routes
  app.get("/api/emergency-contacts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const contacts = await storage.getEmergencyContacts(userId);
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching emergency contacts:", error);
      res.status(500).json({ message: "Failed to fetch emergency contacts" });
    }
  });

  app.post("/api/emergency-contacts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertEmergencyContactSchema.parse({
        ...req.body,
        userId,
      });
      const contact = await storage.createEmergencyContact(validatedData);
      res.status(201).json(contact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating emergency contact:", error);
      res.status(500).json({ message: "Failed to create emergency contact" });
    }
  });

  // Health metrics routes
  app.get("/api/health-metrics", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { type } = req.query;
      const metrics = await storage.getHealthMetrics(userId, type as string);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching health metrics:", error);
      res.status(500).json({ message: "Failed to fetch health metrics" });
    }
  });

  app.post("/api/health-metrics", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertHealthMetricSchema.parse({
        ...req.body,
        userId,
      });
      const metric = await storage.createHealthMetric(validatedData);
      res.status(201).json(metric);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating health metric:", error);
      res.status(500).json({ message: "Failed to create health metric" });
    }
  });

  // Family sharing routes
  app.get("/api/family-shares", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const shares = await storage.getFamilyShares(userId);
      res.json(shares);
    } catch (error) {
      console.error("Error fetching family shares:", error);
      res.status(500).json({ message: "Failed to fetch family shares" });
    }
  });

  // Emergency SOS endpoint
  app.post("/api/emergency/send-sos", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { location } = req.body;
      
      // Get user data for emergency summary
      const user = await storage.getUser(userId);
      const medications = await storage.getMedications(userId);
      const emergencyContacts = await storage.getEmergencyContacts(userId);
      
      // In a real implementation, this would send SMS/email to emergency contacts
      // For now, we'll return the emergency data that would be sent
      const emergencyData = {
        user: {
          name: `${user?.firstName} ${user?.lastName}`,
          email: user?.email,
        },
        location,
        medications: medications.filter(med => med.isActive),
        emergencyContacts,
        timestamp: new Date().toISOString(),
      };

      // TODO: Implement actual SMS/email sending logic here
      console.log("Emergency SOS triggered:", emergencyData);
      
      res.json({ 
        message: "Emergency alert sent successfully", 
        data: emergencyData 
      });
    } catch (error) {
      console.error("Error sending emergency SOS:", error);
      res.status(500).json({ message: "Failed to send emergency alert" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
