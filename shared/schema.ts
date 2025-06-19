import { pgTable, text, serial, integer, real, timestamp, boolean, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  rating: real("rating").default(5.0), // Client rating based on delivery success
  preferredDeliveryTime: text("preferred_delivery_time"), // e.g., "morning", "afternoon", "evening"
  specialRequirements: text("special_requirements"), // Client-specific delivery notes
  contactPhone: text("contact_phone"),
  contactEmail: text("contact_email"),
});

export const trucks = pgTable("trucks", {
  id: serial("id").primaryKey(),
  identifier: text("identifier").notNull().unique(),
  driver: text("driver").notNull(),
  currentLatitude: real("current_latitude"),
  currentLongitude: real("current_longitude"),
  status: text("status").notNull().default("idle"), // idle, loading, in-transit, completed
  lastUpdated: timestamp("last_updated").defaultNow(),
  capacity: real("capacity").default(1000), // kg capacity
  fuelEfficiency: real("fuel_efficiency").default(8.5), // km per liter
  lastMaintenanceDate: timestamp("last_maintenance_date"),
  nextMaintenanceKm: integer("next_maintenance_km"),
  totalKmDriven: real("total_km_driven").default(0),
  driverPhone: text("driver_phone"),
  driverRating: real("driver_rating").default(5.0),
});

export const deliveries = pgTable("deliveries", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  truckId: integer("truck_id").references(() => trucks.id),
  itemType: text("item_type").notNull(), // "boxes" or "tanks"
  itemCount: integer("item_count").notNull(),
  itemWeight: real("item_weight"), // total weight in kg
  priority: text("priority").notNull().default("medium"), // low, medium, high, urgent
  status: text("status").notNull().default("pending"), // pending, in-transit, delivered, failed
  scheduledTime: timestamp("scheduled_time"),
  completedTime: timestamp("completed_time"),
  distance: real("distance"), // in kilometers
  estimatedTime: integer("estimated_time"), // in minutes
  actualTime: integer("actual_time"), // actual delivery time in minutes
  specialInstructions: text("special_instructions"),
  deliveryWindow: text("delivery_window"), // e.g., "9:00-12:00"
  fuelCost: real("fuel_cost"), // calculated fuel cost for this delivery
  deliveryRating: real("delivery_rating"), // 1-5 rating from client
  deliveryNotes: text("delivery_notes"), // driver notes after completion
});

export const routes = pgTable("routes", {
  id: serial("id").primaryKey(),
  truckId: integer("truck_id").references(() => trucks.id).notNull(),
  deliveryIds: text("delivery_ids").array().notNull(), // Array of delivery IDs
  totalDistance: real("total_distance").notNull(),
  estimatedTime: integer("estimated_time").notNull(), // in minutes
  actualTime: integer("actual_time"), // actual completion time in minutes
  status: text("status").notNull().default("planned"), // planned, active, completed
  createdAt: timestamp("created_at").defaultNow(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  fuelUsed: real("fuel_used"), // liters of fuel consumed
  totalFuelCost: real("total_fuel_cost"), // total fuel cost for route
  efficiency: real("efficiency"), // route efficiency percentage
});

// New table for performance reports
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // "daily", "weekly", "monthly"
  date: timestamp("date").notNull(),
  totalDeliveries: integer("total_deliveries").notNull(),
  completedDeliveries: integer("completed_deliveries").notNull(),
  failedDeliveries: integer("failed_deliveries").notNull(),
  totalDistance: real("total_distance").notNull(),
  totalFuelCost: real("total_fuel_cost").notNull(),
  averageDeliveryTime: real("average_delivery_time").notNull(),
  overallEfficiency: real("overall_efficiency").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// New table for maintenance records
export const maintenanceRecords = pgTable("maintenance_records", {
  id: serial("id").primaryKey(),
  truckId: integer("truck_id").references(() => trucks.id).notNull(),
  type: text("type").notNull(), // "scheduled", "emergency", "preventive"
  description: text("description").notNull(),
  cost: real("cost").notNull(),
  performedAt: timestamp("performed_at").notNull(),
  nextMaintenanceKm: integer("next_maintenance_km"),
  mechanic: text("mechanic"),
  notes: text("notes"),
});

// Define relations
export const clientsRelations = relations(clients, ({ many }) => ({
  deliveries: many(deliveries),
}));

export const trucksRelations = relations(trucks, ({ many }) => ({
  deliveries: many(deliveries),
  routes: many(routes),
}));

export const deliveriesRelations = relations(deliveries, ({ one }) => ({
  client: one(clients, {
    fields: [deliveries.clientId],
    references: [clients.id],
  }),
  truck: one(trucks, {
    fields: [deliveries.truckId],
    references: [trucks.id],
  }),
}));

export const routesRelations = relations(routes, ({ one }) => ({
  truck: one(trucks, {
    fields: [routes.truckId],
    references: [trucks.id],
  }),
}));

export const reportsRelations = relations(reports, ({ many }) => ({
  // No direct relations needed for reports
}));

export const maintenanceRecordsRelations = relations(maintenanceRecords, ({ one }) => ({
  truck: one(trucks, {
    fields: [maintenanceRecords.truckId],
    references: [trucks.id],
  }),
}));

// Insert schemas
export const insertClientSchema = createInsertSchema(clients).omit({ id: true });
export const insertTruckSchema = createInsertSchema(trucks).omit({ id: true, lastUpdated: true });
export const insertDeliverySchema = createInsertSchema(deliveries).omit({ id: true });
export const insertRouteSchema = createInsertSchema(routes).omit({ id: true, createdAt: true });
export const insertReportSchema = createInsertSchema(reports).omit({ id: true, createdAt: true });
export const insertMaintenanceRecordSchema = createInsertSchema(maintenanceRecords).omit({ id: true });

// Auth schemas
export const insertUserSchema = createInsertSchema(users).omit({ createdAt: true, updatedAt: true });

// Types
export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Truck = typeof trucks.$inferSelect;
export type InsertTruck = z.infer<typeof insertTruckSchema>;
export type Delivery = typeof deliveries.$inferSelect;
export type InsertDelivery = z.infer<typeof insertDeliverySchema>;
export type Route = typeof routes.$inferSelect;
export type InsertRoute = z.infer<typeof insertRouteSchema>;
export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type MaintenanceRecord = typeof maintenanceRecords.$inferSelect;
export type InsertMaintenanceRecord = z.infer<typeof insertMaintenanceRecordSchema>;

// Extended types for API responses
export interface DeliveryWithClient extends Delivery {
  client: Client;
}

export interface TruckWithStats extends Truck {
  activeDeliveries: number;
  completedDeliveries: number;
  currentRoute?: Route;
}

export interface RouteWithDetails extends Route {
  truck: Truck;
  deliveries: DeliveryWithClient[];
}
