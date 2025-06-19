import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertClientSchema, insertTruckSchema, insertDeliverySchema, insertRouteSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Client routes
  app.get("/api/clients", async (req, res) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const client = await storage.getClient(id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  app.post("/api/clients", async (req, res) => {
    try {
      const clientData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(clientData);
      res.status(201).json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid client data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create client" });
    }
  });

  app.patch("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = insertClientSchema.partial().parse(req.body);
      const client = await storage.updateClient(id, updateData);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid client data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update client" });
    }
  });

  app.delete("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteClient(id);
      if (!deleted) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete client" });
    }
  });

  // Truck routes
  app.get("/api/trucks", async (req, res) => {
    try {
      const trucks = await storage.getTrucksWithStats();
      res.json(trucks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trucks" });
    }
  });

  app.get("/api/trucks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const truck = await storage.getTruck(id);
      if (!truck) {
        return res.status(404).json({ message: "Truck not found" });
      }
      res.json(truck);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch truck" });
    }
  });

  app.post("/api/trucks", async (req, res) => {
    try {
      const truckData = insertTruckSchema.parse(req.body);
      const truck = await storage.createTruck(truckData);
      res.status(201).json(truck);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid truck data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create truck" });
    }
  });

  app.patch("/api/trucks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = insertTruckSchema.partial().parse(req.body);
      const truck = await storage.updateTruck(id, updateData);
      if (!truck) {
        return res.status(404).json({ message: "Truck not found" });
      }
      res.json(truck);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid truck data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update truck" });
    }
  });

  app.patch("/api/trucks/:id/location", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { latitude, longitude } = z.object({
        latitude: z.number(),
        longitude: z.number()
      }).parse(req.body);
      
      const truck = await storage.updateTruckLocation(id, latitude, longitude);
      if (!truck) {
        return res.status(404).json({ message: "Truck not found" });
      }
      res.json(truck);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid location data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update truck location" });
    }
  });

  // Delivery routes
  app.get("/api/deliveries", async (req, res) => {
    try {
      const deliveries = await storage.getDeliveriesWithClients();
      res.json(deliveries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch deliveries" });
    }
  });

  app.get("/api/deliveries/truck/:truckId", async (req, res) => {
    try {
      const truckId = parseInt(req.params.truckId);
      const deliveries = await storage.getDeliveriesByTruck(truckId);
      res.json(deliveries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch truck deliveries" });
    }
  });

  app.post("/api/deliveries", async (req, res) => {
    try {
      const deliveryData = insertDeliverySchema.parse(req.body);
      const delivery = await storage.createDelivery(deliveryData);
      res.status(201).json(delivery);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid delivery data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create delivery" });
    }
  });

  app.patch("/api/deliveries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = insertDeliverySchema.partial().parse(req.body);
      const delivery = await storage.updateDelivery(id, updateData);
      if (!delivery) {
        return res.status(404).json({ message: "Delivery not found" });
      }
      res.json(delivery);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid delivery data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update delivery" });
    }
  });

  // Route optimization endpoint
  app.post("/api/routes/optimize", async (req, res) => {
    try {
      const { truckId, deliveryIds } = z.object({
        truckId: z.number(),
        deliveryIds: z.array(z.number())
      }).parse(req.body);

      // Get deliveries with client locations
      const deliveries = await storage.getDeliveriesWithClients();
      const targetDeliveries = deliveries.filter(d => deliveryIds.includes(d.id));

      if (targetDeliveries.length === 0) {
        return res.status(400).json({ message: "No valid deliveries found" });
      }

      // Simple nearest-neighbor optimization
      const optimizedRoute = optimizeRoute(targetDeliveries);
      
      const routeData = {
        truckId,
        deliveryIds: optimizedRoute.map(d => d.id.toString()),
        totalDistance: optimizedRoute.reduce((sum, d) => sum + (d.distance || 0), 0),
        estimatedTime: optimizedRoute.reduce((sum, d) => sum + (d.estimatedTime || 0), 0),
        status: "planned" as const
      };

      const route = await storage.createRoute(routeData);
      res.json(route);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid route data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to optimize route" });
    }
  });

  app.get("/api/routes", async (req, res) => {
    try {
      const routes = await storage.getActiveRoutes();
      res.json(routes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch routes" });
    }
  });

  app.get("/api/routes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const route = await storage.getRouteWithDetails(id);
      if (!route) {
        return res.status(404).json({ message: "Route not found" });
      }
      res.json(route);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch route" });
    }
  });

  // Dashboard stats endpoint
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const trucks = await storage.getTrucksWithStats();
      const deliveries = await storage.getDeliveries();
      const routes = await storage.getActiveRoutes();

      const stats = {
        activeRoutes: routes.length,
        totalTrucks: trucks.length,
        activeTrucks: trucks.filter(t => ['in-transit', 'loading'].includes(t.status)).length,
        completedToday: deliveries.filter(d => {
          if (!d.completedTime) return false;
          const today = new Date();
          const completedDate = new Date(d.completedTime);
          return completedDate.toDateString() === today.toDateString();
        }).length,
        pendingDeliveries: deliveries.filter(d => d.status === 'pending').length,
        totalDistance: routes.reduce((sum, r) => sum + r.totalDistance, 0),
        estimatedTime: routes.reduce((sum, r) => sum + r.estimatedTime, 0)
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Simple nearest-neighbor route optimization
function optimizeRoute(deliveries: any[]): any[] {
  if (deliveries.length <= 1) return deliveries;

  // Start with the first delivery
  const optimized = [deliveries[0]];
  const remaining = deliveries.slice(1);

  while (remaining.length > 0) {
    const current = optimized[optimized.length - 1];
    let nearestIndex = 0;
    let nearestDistance = calculateDistance(
      current.client.latitude, current.client.longitude,
      remaining[0].client.latitude, remaining[0].client.longitude
    );

    // Find nearest remaining delivery
    for (let i = 1; i < remaining.length; i++) {
      const distance = calculateDistance(
        current.client.latitude, current.client.longitude,
        remaining[i].client.latitude, remaining[i].client.longitude
      );
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = i;
      }
    }

    optimized.push(remaining[nearestIndex]);
    remaining.splice(nearestIndex, 1);
  }

  return optimized;
}

// Calculate distance between two points (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
