import { pgTable, text, serial, integer, real, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
});

export const trucks = pgTable("trucks", {
  id: serial("id").primaryKey(),
  identifier: text("identifier").notNull().unique(),
  driver: text("driver").notNull(),
  currentLatitude: real("current_latitude"),
  currentLongitude: real("current_longitude"),
  status: text("status").notNull().default("idle"), // idle, loading, in-transit, completed
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const deliveries = pgTable("deliveries", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  truckId: integer("truck_id").references(() => trucks.id),
  itemType: text("item_type").notNull(), // "boxes" or "tanks"
  itemCount: integer("item_count").notNull(),
  priority: text("priority").notNull().default("medium"), // low, medium, high, urgent
  status: text("status").notNull().default("pending"), // pending, in-transit, delivered, failed
  scheduledTime: timestamp("scheduled_time"),
  completedTime: timestamp("completed_time"),
  distance: real("distance"), // in kilometers
  estimatedTime: integer("estimated_time"), // in minutes
  specialInstructions: text("special_instructions"),
});

export const routes = pgTable("routes", {
  id: serial("id").primaryKey(),
  truckId: integer("truck_id").references(() => trucks.id).notNull(),
  deliveryIds: text("delivery_ids").array().notNull(), // Array of delivery IDs
  totalDistance: real("total_distance").notNull(),
  estimatedTime: integer("estimated_time").notNull(), // in minutes
  status: text("status").notNull().default("planned"), // planned, active, completed
  createdAt: timestamp("created_at").defaultNow(),
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

// Insert schemas
export const insertClientSchema = createInsertSchema(clients).omit({ id: true });
export const insertTruckSchema = createInsertSchema(trucks).omit({ id: true, lastUpdated: true });
export const insertDeliverySchema = createInsertSchema(deliveries).omit({ id: true });
export const insertRouteSchema = createInsertSchema(routes).omit({ id: true, createdAt: true });

// Types
export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Truck = typeof trucks.$inferSelect;
export type InsertTruck = z.infer<typeof insertTruckSchema>;
export type Delivery = typeof deliveries.$inferSelect;
export type InsertDelivery = z.infer<typeof insertDeliverySchema>;
export type Route = typeof routes.$inferSelect;
export type InsertRoute = z.infer<typeof insertRouteSchema>;

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
