import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertClientSchema, insertTruckSchema, insertDeliverySchema, insertRouteSchema, insertReportSchema, insertMaintenanceRecordSchema } from "@shared/schema";
import { z } from "zod";

// WebSocket connections for real-time updates
const wsConnections = new Set<WebSocket>();

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

  // Protected client routes
  app.get("/api/clients", isAuthenticated, async (req, res) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get("/api/clients/:id", isAuthenticated, async (req, res) => {
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

  app.post("/api/clients", isAuthenticated, async (req, res) => {
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

  app.delete("/api/clients/:id", isAuthenticated, async (req, res) => {
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

  // Protected truck routes
  app.get("/api/trucks", isAuthenticated, async (req, res) => {
    try {
      const trucks = await storage.getTrucksWithStats();
      res.json(trucks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trucks" });
    }
  });

  app.get("/api/trucks/:id", isAuthenticated, async (req, res) => {
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

  app.post("/api/trucks", isAuthenticated, async (req, res) => {
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

  // Protected delivery routes
  app.get("/api/deliveries", isAuthenticated, async (req, res) => {
    try {
      const deliveries = await storage.getDeliveriesWithClients();
      res.json(deliveries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch deliveries" });
    }
  });

  app.get("/api/deliveries/truck/:truckId", isAuthenticated, async (req, res) => {
    try {
      const truckId = parseInt(req.params.truckId);
      const deliveries = await storage.getDeliveriesByTruck(truckId);
      res.json(deliveries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch truck deliveries" });
    }
  });

  app.post("/api/deliveries", isAuthenticated, async (req, res) => {
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

  app.patch("/api/deliveries/:id", isAuthenticated, async (req, res) => {
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

  // Protected route optimization endpoint
  app.post("/api/routes/optimize", isAuthenticated, async (req, res) => {
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

  // Protected dashboard stats endpoint
  app.get("/api/dashboard/stats", isAuthenticated, async (req, res) => {
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

  // Protected reports and analytics endpoints
  app.get("/api/reports", isAuthenticated, async (req, res) => {
    try {
      const reports = await storage.getReports();
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  app.post("/api/reports/generate", isAuthenticated, async (req, res) => {
    try {
      const { type, date } = req.body;
      const report = await generateReport(type, new Date(date));
      res.json(report);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate report" });
    }
  });

  // Maintenance records endpoints
  app.get("/api/maintenance", async (req, res) => {
    try {
      const records = await storage.getMaintenanceRecords();
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch maintenance records" });
    }
  });

  app.get("/api/maintenance/truck/:truckId", async (req, res) => {
    try {
      const truckId = parseInt(req.params.truckId);
      const records = await storage.getMaintenanceRecordsByTruck(truckId);
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch truck maintenance records" });
    }
  });

  app.post("/api/maintenance", async (req, res) => {
    try {
      const maintenanceData = insertMaintenanceRecordSchema.parse(req.body);
      const record = await storage.createMaintenanceRecord(maintenanceData);
      
      // Update truck's next maintenance km
      if (maintenanceData.nextMaintenanceKm) {
        await storage.updateTruck(maintenanceData.truckId, {
          nextMaintenanceKm: maintenanceData.nextMaintenanceKm,
          lastMaintenanceDate: new Date()
        });
      }
      
      broadcastUpdate('maintenance_created', record);
      res.status(201).json(record);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid maintenance data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create maintenance record" });
    }
  });

  // Advanced analytics endpoints
  app.get("/api/analytics/performance", isAuthenticated, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const performance = await getPerformanceAnalytics(
        startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate ? new Date(endDate as string) : new Date()
      );
      res.json(performance);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch performance analytics" });
    }
  });

  app.get("/api/analytics/fuel", isAuthenticated, async (req, res) => {
    try {
      const fuelAnalytics = await getFuelAnalytics();
      res.json(fuelAnalytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch fuel analytics" });
    }
  });

  // PDF Export endpoint
  app.get("/api/export/manifest/:routeId", async (req, res) => {
    try {
      const routeId = parseInt(req.params.routeId);
      const pdfBuffer = await generateDeliveryManifestPDF(routeId);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="manifest-${routeId}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate delivery manifest PDF" });
    }
  });

  // Real-time truck location updates
  app.patch("/api/trucks/:id/location", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { latitude, longitude } = req.body;
      
      const truck = await storage.updateTruckLocation(id, latitude, longitude);
      if (!truck) {
        return res.status(404).json({ message: "Truck not found" });
      }
      
      // Broadcast real-time location update
      broadcastUpdate('truck_location_updated', truck);
      res.json(truck);
    } catch (error) {
      res.status(500).json({ message: "Failed to update truck location" });
    }
  });

  const httpServer = createServer(app);
  
  // Set up WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    wsConnections.add(ws);
    console.log('New WebSocket connection established');
    
    ws.on('close', () => {
      wsConnections.delete(ws);
      console.log('WebSocket connection closed');
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      wsConnections.delete(ws);
    });
  });
  
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

// Broadcast real-time updates to all connected clients
function broadcastUpdate(type: string, data: any) {
  const message = JSON.stringify({ type, data, timestamp: new Date().toISOString() });
  wsConnections.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  });
}

// Generate comprehensive reports
async function generateReport(type: 'daily' | 'weekly' | 'monthly', date: Date) {
  const deliveries = await storage.getDeliveries();
  const trucks = await storage.getTrucks();
  const routes = await storage.getRoutes();

  let startDate: Date;
  let endDate: Date = new Date(date);

  switch (type) {
    case 'daily':
      startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'weekly':
      startDate = new Date(date);
      startDate.setDate(date.getDate() - 7);
      break;
    case 'monthly':
      startDate = new Date(date);
      startDate.setMonth(date.getMonth() - 1);
      break;
  }

  const periodDeliveries = deliveries.filter(d => {
    if (!d.completedTime) return false;
    const completedDate = new Date(d.completedTime);
    return completedDate >= startDate && completedDate <= endDate;
  });

  const completedDeliveries = periodDeliveries.filter(d => d.status === 'delivered');
  const failedDeliveries = periodDeliveries.filter(d => d.status === 'failed');
  
  const totalDistance = routes
    .filter(r => r.createdAt && new Date(r.createdAt) >= startDate && new Date(r.createdAt) <= endDate)
    .reduce((sum, r) => sum + r.totalDistance, 0);

  const averageDeliveryTime = completedDeliveries.length > 0 
    ? completedDeliveries.reduce((sum, d) => sum + (d.actualTime || d.estimatedTime || 0), 0) / completedDeliveries.length
    : 0;

  const efficiency = periodDeliveries.length > 0 
    ? (completedDeliveries.length / periodDeliveries.length) * 100
    : 0;

  const fuelCost = completedDeliveries.reduce((sum, d) => sum + (d.fuelCost || 0), 0);

  const report = {
    type,
    date: endDate,
    totalDeliveries: periodDeliveries.length,
    completedDeliveries: completedDeliveries.length,
    failedDeliveries: failedDeliveries.length,
    totalDistance,
    totalFuelCost: fuelCost,
    averageDeliveryTime,
    overallEfficiency: efficiency
  };

  // Save report to database
  await storage.createReport(report);
  return report;
}

// Get performance analytics
async function getPerformanceAnalytics(startDate: Date, endDate: Date) {
  const deliveries = await storage.getDeliveries();
  const trucks = await storage.getTrucksWithStats();
  
  const periodDeliveries = deliveries.filter(d => {
    if (!d.completedTime) return false;
    const completedDate = new Date(d.completedTime);
    return completedDate >= startDate && completedDate <= endDate;
  });

  const truckPerformance = trucks.map(truck => {
    const truckDeliveries = periodDeliveries.filter(d => d.truckId === truck.id);
    const completedCount = truckDeliveries.filter(d => d.status === 'delivered').length;
    
    return {
      truckId: truck.id,
      identifier: truck.identifier,
      driver: truck.driver,
      totalDeliveries: truckDeliveries.length,
      completedDeliveries: completedCount,
      efficiency: truckDeliveries.length > 0 ? (completedCount / truckDeliveries.length) * 100 : 0,
      averageDeliveryTime: completedCount > 0 
        ? truckDeliveries.reduce((sum, d) => sum + (d.actualTime || d.estimatedTime || 0), 0) / completedCount
        : 0,
      driverRating: truck.driverRating || 5.0
    };
  });

  return {
    totalDeliveries: periodDeliveries.length,
    completedDeliveries: periodDeliveries.filter(d => d.status === 'delivered').length,
    averageEfficiency: truckPerformance.reduce((sum, t) => sum + t.efficiency, 0) / truckPerformance.length,
    topPerformers: truckPerformance.sort((a, b) => b.efficiency - a.efficiency).slice(0, 3),
    truckPerformance
  };
}

// Get fuel analytics
async function getFuelAnalytics() {
  const trucks = await storage.getTrucks();
  const routes = await storage.getRoutes();
  const deliveries = await storage.getDeliveries();

  const fuelData = trucks.map(truck => {
    const truckRoutes = routes.filter(r => r.truckId === truck.id && r.status === 'completed');
    const totalFuelUsed = truckRoutes.reduce((sum, r) => sum + (r.fuelUsed || 0), 0);
    const totalDistance = truckRoutes.reduce((sum, r) => sum + r.totalDistance, 0);
    const totalFuelCost = truckRoutes.reduce((sum, r) => sum + (r.totalFuelCost || 0), 0);
    
    return {
      truckId: truck.id,
      identifier: truck.identifier,
      fuelEfficiency: truck.fuelEfficiency || 8.5,
      totalFuelUsed,
      totalDistance,
      totalFuelCost,
      actualEfficiency: totalDistance > 0 ? totalDistance / totalFuelUsed : 0
    };
  });

  const totalFuelCost = fuelData.reduce((sum, t) => sum + t.totalFuelCost, 0);
  const averageEfficiency = fuelData.reduce((sum, t) => sum + t.actualEfficiency, 0) / fuelData.length;

  return {
    totalFuelCost,
    averageEfficiency,
    monthlyTrend: await getFuelTrend(),
    truckFuelData: fuelData
  };
}

// Get fuel consumption trend for the past 6 months
async function getFuelTrend() {
  const routes = await storage.getRoutes();
  const months = [];
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    const monthRoutes = routes.filter(r => {
      if (!r.completedAt) return false;
      const completedDate = new Date(r.completedAt);
      return completedDate >= monthStart && completedDate <= monthEnd;
    });
    
    const fuelUsed = monthRoutes.reduce((sum, r) => sum + (r.fuelUsed || 0), 0);
    const fuelCost = monthRoutes.reduce((sum, r) => sum + (r.totalFuelCost || 0), 0);
    
    months.push({
      month: date.toLocaleDateString('es-DO', { month: 'long', year: 'numeric' }),
      fuelUsed,
      fuelCost,
      routes: monthRoutes.length
    });
  }
  
  return months;
}

// Generate PDF delivery manifest
async function generateDeliveryManifestPDF(routeId: number): Promise<Buffer> {
  const route = await storage.getRouteWithDetails(routeId);
  if (!route) {
    throw new Error('Route not found');
  }

  // Simple PDF generation (in a real app, you'd use a library like PDFKit)
  const pdfContent = `
MANIFIESTO DE ENTREGA
===================

Ruta: ${route.id}
Camión: ${route.truck.identifier}
Conductor: ${route.truck.driver}
Fecha: ${new Date().toLocaleDateString('es-DO')}

ENTREGAS:
${route.deliveries.map(d => `
- Cliente: ${d.client.name}
  Dirección: ${d.client.address}
  Artículos: ${d.itemCount} ${d.itemType}
  Prioridad: ${d.priority}
  Estado: ${d.status}
`).join('')}

Distancia Total: ${route.totalDistance.toFixed(2)} km
Tiempo Estimado: ${route.estimatedTime} minutos

Firma del Conductor: _________________
Fecha de Completado: _________________
`;

  // Convert text to buffer (in a real app, use proper PDF library)
  return Buffer.from(pdfContent, 'utf-8');
}
