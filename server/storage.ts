import { 
  clients, trucks, deliveries, routes, reports, maintenanceRecords,
  type Client, type InsertClient,
  type Truck, type InsertTruck,
  type Delivery, type InsertDelivery,
  type Route, type InsertRoute,
  type Report, type InsertReport,
  type MaintenanceRecord, type InsertMaintenanceRecord,
  type DeliveryWithClient, type TruckWithStats, type RouteWithDetails
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Client operations
  getClients(): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<boolean>;

  // Truck operations
  getTrucks(): Promise<Truck[]>;
  getTruck(id: number): Promise<Truck | undefined>;
  getTruckByIdentifier(identifier: string): Promise<Truck | undefined>;
  createTruck(truck: InsertTruck): Promise<Truck>;
  updateTruck(id: number, truck: Partial<InsertTruck>): Promise<Truck | undefined>;
  updateTruckLocation(id: number, latitude: number, longitude: number): Promise<Truck | undefined>;
  deleteTruck(id: number): Promise<boolean>;
  getTrucksWithStats(): Promise<TruckWithStats[]>;

  // Delivery operations
  getDeliveries(): Promise<Delivery[]>;
  getDelivery(id: number): Promise<Delivery | undefined>;
  getDeliveriesWithClients(): Promise<DeliveryWithClient[]>;
  getDeliveriesByTruck(truckId: number): Promise<DeliveryWithClient[]>;
  createDelivery(delivery: InsertDelivery): Promise<Delivery>;
  updateDelivery(id: number, delivery: Partial<InsertDelivery>): Promise<Delivery | undefined>;
  deleteDelivery(id: number): Promise<boolean>;

  // Route operations
  getRoutes(): Promise<Route[]>;
  getRoute(id: number): Promise<Route | undefined>;
  getRouteWithDetails(id: number): Promise<RouteWithDetails | undefined>;
  getActiveRoutes(): Promise<RouteWithDetails[]>;
  createRoute(route: InsertRoute): Promise<Route>;
  updateRoute(id: number, route: Partial<InsertRoute>): Promise<Route | undefined>;
  deleteRoute(id: number): Promise<boolean>;

  // Report operations
  getReports(): Promise<Report[]>;
  getReport(id: number): Promise<Report | undefined>;
  createReport(report: InsertReport): Promise<Report>;
  deleteReport(id: number): Promise<boolean>;

  // Maintenance record operations
  getMaintenanceRecords(): Promise<MaintenanceRecord[]>;
  getMaintenanceRecord(id: number): Promise<MaintenanceRecord | undefined>;
  getMaintenanceRecordsByTruck(truckId: number): Promise<MaintenanceRecord[]>;
  createMaintenanceRecord(record: InsertMaintenanceRecord): Promise<MaintenanceRecord>;
  updateMaintenanceRecord(id: number, record: Partial<InsertMaintenanceRecord>): Promise<MaintenanceRecord | undefined>;
  deleteMaintenanceRecord(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getClients(): Promise<Client[]> {
    return await db.select().from(clients);
  }

  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client || undefined;
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const [client] = await db
      .insert(clients)
      .values(insertClient)
      .returning();
    return client;
  }

  async updateClient(id: number, updateData: Partial<InsertClient>): Promise<Client | undefined> {
    const [client] = await db
      .update(clients)
      .set(updateData)
      .where(eq(clients.id, id))
      .returning();
    return client || undefined;
  }

  async deleteClient(id: number): Promise<boolean> {
    const result = await db.delete(clients).where(eq(clients.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getTrucks(): Promise<Truck[]> {
    return await db.select().from(trucks);
  }

  async getTruck(id: number): Promise<Truck | undefined> {
    const [truck] = await db.select().from(trucks).where(eq(trucks.id, id));
    return truck || undefined;
  }

  async getTruckByIdentifier(identifier: string): Promise<Truck | undefined> {
    const [truck] = await db.select().from(trucks).where(eq(trucks.identifier, identifier));
    return truck || undefined;
  }

  async createTruck(insertTruck: InsertTruck): Promise<Truck> {
    const [truck] = await db
      .insert(trucks)
      .values({
        ...insertTruck,
        status: insertTruck.status || "idle",
        currentLatitude: insertTruck.currentLatitude || null,
        currentLongitude: insertTruck.currentLongitude || null,
      })
      .returning();
    return truck;
  }

  async updateTruck(id: number, updateData: Partial<InsertTruck>): Promise<Truck | undefined> {
    const [truck] = await db
      .update(trucks)
      .set({
        ...updateData,
        lastUpdated: new Date()
      })
      .where(eq(trucks.id, id))
      .returning();
    return truck || undefined;
  }

  async updateTruckLocation(id: number, latitude: number, longitude: number): Promise<Truck | undefined> {
    return this.updateTruck(id, {
      currentLatitude: latitude,
      currentLongitude: longitude
    });
  }

  async deleteTruck(id: number): Promise<boolean> {
    const result = await db.delete(trucks).where(eq(trucks.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getTrucksWithStats(): Promise<TruckWithStats[]> {
    const allTrucks = await this.getTrucks();
    const allDeliveries = await this.getDeliveries();
    
    return allTrucks.map(truck => {
      const truckDeliveries = allDeliveries.filter(d => d.truckId === truck.id);
      const activeDeliveries = truckDeliveries.filter(d => ['pending', 'in-transit'].includes(d.status)).length;
      const completedDeliveries = truckDeliveries.filter(d => d.status === 'delivered').length;
      
      return {
        ...truck,
        activeDeliveries,
        completedDeliveries
      };
    });
  }

  async getDeliveries(): Promise<Delivery[]> {
    return await db.select().from(deliveries);
  }

  async getDelivery(id: number): Promise<Delivery | undefined> {
    const [delivery] = await db.select().from(deliveries).where(eq(deliveries.id, id));
    return delivery || undefined;
  }

  async getDeliveriesWithClients(): Promise<DeliveryWithClient[]> {
    const result = await db
      .select()
      .from(deliveries)
      .leftJoin(clients, eq(deliveries.clientId, clients.id));
    
    return result.map(row => ({
      ...row.deliveries,
      client: row.clients!
    }));
  }

  async getDeliveriesByTruck(truckId: number): Promise<DeliveryWithClient[]> {
    const result = await db
      .select()
      .from(deliveries)
      .leftJoin(clients, eq(deliveries.clientId, clients.id))
      .where(eq(deliveries.truckId, truckId));
    
    return result.map(row => ({
      ...row.deliveries,
      client: row.clients!
    }));
  }

  async createDelivery(insertDelivery: InsertDelivery): Promise<Delivery> {
    const [delivery] = await db
      .insert(deliveries)
      .values({
        ...insertDelivery,
        priority: insertDelivery.priority || "medium",
        status: insertDelivery.status || "pending",
        truckId: insertDelivery.truckId || null,
        scheduledTime: insertDelivery.scheduledTime || null,
        completedTime: insertDelivery.completedTime || null,
        distance: insertDelivery.distance || null,
        estimatedTime: insertDelivery.estimatedTime || null,
        specialInstructions: insertDelivery.specialInstructions || null
      })
      .returning();
    return delivery;
  }

  async updateDelivery(id: number, updateData: Partial<InsertDelivery>): Promise<Delivery | undefined> {
    const [delivery] = await db
      .update(deliveries)
      .set(updateData)
      .where(eq(deliveries.id, id))
      .returning();
    return delivery || undefined;
  }

  async deleteDelivery(id: number): Promise<boolean> {
    const result = await db.delete(deliveries).where(eq(deliveries.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getRoutes(): Promise<Route[]> {
    return await db.select().from(routes);
  }

  async getRoute(id: number): Promise<Route | undefined> {
    const [route] = await db.select().from(routes).where(eq(routes.id, id));
    return route || undefined;
  }

  async getRouteWithDetails(id: number): Promise<RouteWithDetails | undefined> {
    const route = await this.getRoute(id);
    if (!route) return undefined;

    const truck = await this.getTruck(route.truckId);
    if (!truck) return undefined;

    const deliveriesWithClients = await this.getDeliveriesWithClients();
    const routeDeliveries = deliveriesWithClients.filter(d => 
      route.deliveryIds.includes(d.id.toString())
    );

    return {
      ...route,
      truck,
      deliveries: routeDeliveries
    };
  }

  async getActiveRoutes(): Promise<RouteWithDetails[]> {
    const allRoutes = await db.select().from(routes).where(eq(routes.status, 'active'));
    
    const routesWithDetails = await Promise.all(
      allRoutes.map(r => this.getRouteWithDetails(r.id))
    );
    
    return routesWithDetails.filter(r => r !== undefined) as RouteWithDetails[];
  }

  async createRoute(insertRoute: InsertRoute): Promise<Route> {
    const [route] = await db
      .insert(routes)
      .values({
        ...insertRoute,
        status: insertRoute.status || "planned"
      })
      .returning();
    return route;
  }

  async updateRoute(id: number, updateData: Partial<InsertRoute>): Promise<Route | undefined> {
    const [route] = await db
      .update(routes)
      .set(updateData)
      .where(eq(routes.id, id))
      .returning();
    return route || undefined;
  }

  async deleteRoute(id: number): Promise<boolean> {
    const result = await db.delete(routes).where(eq(routes.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Report operations
  async getReports(): Promise<Report[]> {
    return await db.select().from(reports);
  }

  async getReport(id: number): Promise<Report | undefined> {
    const [report] = await db.select().from(reports).where(eq(reports.id, id));
    return report || undefined;
  }

  async createReport(insertReport: InsertReport): Promise<Report> {
    const [report] = await db
      .insert(reports)
      .values(insertReport)
      .returning();
    return report;
  }

  async deleteReport(id: number): Promise<boolean> {
    const result = await db.delete(reports).where(eq(reports.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Maintenance record operations
  async getMaintenanceRecords(): Promise<MaintenanceRecord[]> {
    return await db.select().from(maintenanceRecords);
  }

  async getMaintenanceRecord(id: number): Promise<MaintenanceRecord | undefined> {
    const [record] = await db.select().from(maintenanceRecords).where(eq(maintenanceRecords.id, id));
    return record || undefined;
  }

  async getMaintenanceRecordsByTruck(truckId: number): Promise<MaintenanceRecord[]> {
    return await db.select().from(maintenanceRecords).where(eq(maintenanceRecords.truckId, truckId));
  }

  async createMaintenanceRecord(insertRecord: InsertMaintenanceRecord): Promise<MaintenanceRecord> {
    const [record] = await db
      .insert(maintenanceRecords)
      .values(insertRecord)
      .returning();
    return record;
  }

  async updateMaintenanceRecord(id: number, updateData: Partial<InsertMaintenanceRecord>): Promise<MaintenanceRecord | undefined> {
    const [record] = await db
      .update(maintenanceRecords)
      .set(updateData)
      .where(eq(maintenanceRecords.id, id))
      .returning();
    return record || undefined;
  }

  async deleteMaintenanceRecord(id: number): Promise<boolean> {
    const result = await db.delete(maintenanceRecords).where(eq(maintenanceRecords.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}

export class MemStorage implements IStorage {
  private clients: Map<number, Client> = new Map();
  private trucks: Map<number, Truck> = new Map();
  private deliveries: Map<number, Delivery> = new Map();
  private routes: Map<number, Route> = new Map();
  private currentId = {
    clients: 1,
    trucks: 1,
    deliveries: 1,
    routes: 1
  };

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed data for Dominican Republic logistics operation
    const sampleClients: InsertClient[] = [
      { name: "Supermercados La Cadena", address: "Av. Winston Churchill, Piantini, Santo Domingo", latitude: 18.4861, longitude: -69.9312 },
      { name: "Farmacia Carol", address: "Calle El Conde 253, Zona Colonial, Santo Domingo", latitude: 18.4735, longitude: -69.8849 },
      { name: "Restaurant El Mesón", address: "Av. George Washington 367, Malecón, Santo Domingo", latitude: 18.4648, longitude: -69.8932 },
      { name: "Hotel Casa Colonial", address: "Calle Arzobispo Meriño 106, Zona Colonial", latitude: 18.4728, longitude: -69.8835 },
      { name: "Ferretería Dominicana", address: "Av. 27 de Febrero 1762, Ensanche Naco", latitude: 18.4789, longitude: -69.9156 }
    ];

    const sampleTrucks: InsertTruck[] = [
      { identifier: "CAM-001", driver: "Carlos Martínez", currentLatitude: 18.4861, currentLongitude: -69.9312, status: "in-transit" },
      { identifier: "CAM-002", driver: "María González", currentLatitude: 18.4735, currentLongitude: -69.8849, status: "loading" },
      { identifier: "CAM-003", driver: "José Rodríguez", currentLatitude: 18.4648, currentLongitude: -69.8932, status: "completed" }
    ];

    sampleClients.forEach(client => this.createClient(client));
    sampleTrucks.forEach(truck => this.createTruck(truck));

    // Create sample deliveries for Dominican Republic
    this.createDelivery({
      clientId: 1,
      truckId: 1,
      itemType: "cajas",
      itemCount: 5,
      priority: "high",
      status: "in-transit",
      distance: 8.5,
      estimatedTime: 35,
      specialInstructions: "Entrega en horario matutino preferiblemente"
    });

    this.createDelivery({
      clientId: 2,
      truckId: 1,
      itemType: "medicamentos",
      itemCount: 2,
      priority: "urgent",
      status: "delivered",
      distance: 3.2,
      estimatedTime: 15,
      completedTime: new Date(),
      specialInstructions: "Requiere refrigeración"
    });

    this.createDelivery({
      clientId: 3,
      truckId: 2,
      itemType: "suministros",
      itemCount: 8,
      priority: "medium",
      status: "pending",
      distance: 12.8,
      estimatedTime: 50,
      specialInstructions: "Coordinar con gerente de recepción"
    });

    this.createDelivery({
      clientId: 4,
      truckId: 3,
      itemType: "equipos",
      itemCount: 1,
      priority: "low",
      status: "delivered",
      distance: 4.7,
      estimatedTime: 20,
      completedTime: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    });
  }

  // Client operations
  async getClients(): Promise<Client[]> {
    return Array.from(this.clients.values());
  }

  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const id = this.currentId.clients++;
    const client: Client = { ...insertClient, id };
    this.clients.set(id, client);
    return client;
  }

  async updateClient(id: number, updateData: Partial<InsertClient>): Promise<Client | undefined> {
    const client = this.clients.get(id);
    if (!client) return undefined;
    
    const updatedClient = { ...client, ...updateData };
    this.clients.set(id, updatedClient);
    return updatedClient;
  }

  async deleteClient(id: number): Promise<boolean> {
    return this.clients.delete(id);
  }

  // Truck operations
  async getTrucks(): Promise<Truck[]> {
    return Array.from(this.trucks.values());
  }

  async getTruck(id: number): Promise<Truck | undefined> {
    return this.trucks.get(id);
  }

  async getTruckByIdentifier(identifier: string): Promise<Truck | undefined> {
    return Array.from(this.trucks.values()).find(truck => truck.identifier === identifier);
  }

  async createTruck(insertTruck: InsertTruck): Promise<Truck> {
    const id = this.currentId.trucks++;
    const truck: Truck = { 
      id,
      identifier: insertTruck.identifier,
      driver: insertTruck.driver,
      currentLatitude: insertTruck.currentLatitude || null,
      currentLongitude: insertTruck.currentLongitude || null,
      status: insertTruck.status || "idle",
      lastUpdated: new Date()
    };
    this.trucks.set(id, truck);
    return truck;
  }

  async updateTruck(id: number, updateData: Partial<InsertTruck>): Promise<Truck | undefined> {
    const truck = this.trucks.get(id);
    if (!truck) return undefined;
    
    const updatedTruck = { 
      ...truck, 
      ...updateData,
      lastUpdated: new Date()
    };
    this.trucks.set(id, updatedTruck);
    return updatedTruck;
  }

  async updateTruckLocation(id: number, latitude: number, longitude: number): Promise<Truck | undefined> {
    return this.updateTruck(id, {
      currentLatitude: latitude,
      currentLongitude: longitude
    });
  }

  async deleteTruck(id: number): Promise<boolean> {
    return this.trucks.delete(id);
  }

  async getTrucksWithStats(): Promise<TruckWithStats[]> {
    const trucks = await this.getTrucks();
    const allDeliveries = await this.getDeliveries();
    
    return trucks.map(truck => {
      const truckDeliveries = allDeliveries.filter(d => d.truckId === truck.id);
      const activeDeliveries = truckDeliveries.filter(d => ['pending', 'in-transit'].includes(d.status)).length;
      const completedDeliveries = truckDeliveries.filter(d => d.status === 'delivered').length;
      
      return {
        ...truck,
        activeDeliveries,
        completedDeliveries
      };
    });
  }

  // Delivery operations
  async getDeliveries(): Promise<Delivery[]> {
    return Array.from(this.deliveries.values());
  }

  async getDelivery(id: number): Promise<Delivery | undefined> {
    return this.deliveries.get(id);
  }

  async getDeliveriesWithClients(): Promise<DeliveryWithClient[]> {
    const deliveries = await this.getDeliveries();
    const clients = await this.getClients();
    
    return deliveries.map(delivery => {
      const client = clients.find(c => c.id === delivery.clientId);
      return {
        ...delivery,
        client: client!
      };
    });
  }

  async getDeliveriesByTruck(truckId: number): Promise<DeliveryWithClient[]> {
    const deliveriesWithClients = await this.getDeliveriesWithClients();
    return deliveriesWithClients.filter(d => d.truckId === truckId);
  }

  async createDelivery(insertDelivery: InsertDelivery): Promise<Delivery> {
    const id = this.currentId.deliveries++;
    const delivery: Delivery = { 
      id,
      clientId: insertDelivery.clientId,
      truckId: insertDelivery.truckId || null,
      itemType: insertDelivery.itemType,
      itemCount: insertDelivery.itemCount,
      priority: insertDelivery.priority || "medium",
      status: insertDelivery.status || "pending",
      scheduledTime: insertDelivery.scheduledTime || null,
      completedTime: insertDelivery.completedTime || null,
      distance: insertDelivery.distance || null,
      estimatedTime: insertDelivery.estimatedTime || null,
      specialInstructions: insertDelivery.specialInstructions || null
    };
    this.deliveries.set(id, delivery);
    return delivery;
  }

  async updateDelivery(id: number, updateData: Partial<InsertDelivery>): Promise<Delivery | undefined> {
    const delivery = this.deliveries.get(id);
    if (!delivery) return undefined;
    
    const updatedDelivery = { ...delivery, ...updateData };
    this.deliveries.set(id, updatedDelivery);
    return updatedDelivery;
  }

  async deleteDelivery(id: number): Promise<boolean> {
    return this.deliveries.delete(id);
  }

  // Route operations
  async getRoutes(): Promise<Route[]> {
    return Array.from(this.routes.values());
  }

  async getRoute(id: number): Promise<Route | undefined> {
    return this.routes.get(id);
  }

  async getRouteWithDetails(id: number): Promise<RouteWithDetails | undefined> {
    const route = this.routes.get(id);
    if (!route) return undefined;

    const truck = await this.getTruck(route.truckId);
    if (!truck) return undefined;

    const deliveries = await this.getDeliveriesWithClients();
    const routeDeliveries = deliveries.filter(d => 
      route.deliveryIds.includes(d.id.toString())
    );

    return {
      ...route,
      truck,
      deliveries: routeDeliveries
    };
  }

  async getActiveRoutes(): Promise<RouteWithDetails[]> {
    const routes = await this.getRoutes();
    const activeRoutes = routes.filter(r => r.status === 'active');
    
    const routesWithDetails = await Promise.all(
      activeRoutes.map(r => this.getRouteWithDetails(r.id))
    );
    
    return routesWithDetails.filter(r => r !== undefined) as RouteWithDetails[];
  }

  async createRoute(insertRoute: InsertRoute): Promise<Route> {
    const id = this.currentId.routes++;
    const route: Route = { 
      id,
      truckId: insertRoute.truckId,
      deliveryIds: insertRoute.deliveryIds,
      totalDistance: insertRoute.totalDistance,
      estimatedTime: insertRoute.estimatedTime,
      status: insertRoute.status || "planned",
      createdAt: new Date()
    };
    this.routes.set(id, route);
    return route;
  }

  async updateRoute(id: number, updateData: Partial<InsertRoute>): Promise<Route | undefined> {
    const route = this.routes.get(id);
    if (!route) return undefined;
    
    const updatedRoute = { ...route, ...updateData };
    this.routes.set(id, updatedRoute);
    return updatedRoute;
  }

  async deleteRoute(id: number): Promise<boolean> {
    return this.routes.delete(id);
  }
}

// Use DatabaseStorage for persistent storage
export const storage = new DatabaseStorage();

// Seed function for initial data
export async function seedDatabase() {
  try {
    // Check if data already exists
    const existingClients = await storage.getClients();
    if (existingClients.length > 0) {
      console.log("Database already seeded, skipping...");
      return;
    }

    // Seed data for Dominican Republic logistics operation
    const sampleClients = [
      { name: "Supermercados La Cadena", address: "Av. Winston Churchill, Piantini, Santo Domingo", latitude: 18.4861, longitude: -69.9312 },
      { name: "Farmacia Carol", address: "Calle El Conde 253, Zona Colonial, Santo Domingo", latitude: 18.4735, longitude: -69.8849 },
      { name: "Restaurant El Mesón", address: "Av. George Washington 367, Malecón, Santo Domingo", latitude: 18.4648, longitude: -69.8932 },
      { name: "Hotel Casa Colonial", address: "Calle Arzobispo Meriño 106, Zona Colonial", latitude: 18.4728, longitude: -69.8835 },
      { name: "Ferretería Dominicana", address: "Av. 27 de Febrero 1762, Ensanche Naco", latitude: 18.4789, longitude: -69.9156 }
    ];

    const sampleTrucks = [
      { identifier: "CAM-001", driver: "Carlos Martínez", currentLatitude: 18.4861, currentLongitude: -69.9312, status: "in-transit" },
      { identifier: "CAM-002", driver: "María González", currentLatitude: 18.4735, currentLongitude: -69.8849, status: "loading" },
      { identifier: "CAM-003", driver: "José Rodríguez", currentLatitude: 18.4648, currentLongitude: -69.8932, status: "completed" }
    ];

    // Create clients and trucks
    const createdClients = await Promise.all(
      sampleClients.map(client => storage.createClient(client))
    );
    
    const createdTrucks = await Promise.all(
      sampleTrucks.map(truck => storage.createTruck(truck))
    );

    // Create sample deliveries
    const sampleDeliveries = [
      {
        clientId: createdClients[0].id,
        truckId: createdTrucks[0].id,
        itemType: "cajas",
        itemCount: 5,
        priority: "high",
        status: "in-transit",
        distance: 8.5,
        estimatedTime: 35,
        specialInstructions: "Entrega en horario matutino preferiblemente"
      },
      {
        clientId: createdClients[1].id,
        truckId: createdTrucks[0].id,
        itemType: "medicamentos",
        itemCount: 2,
        priority: "urgent",
        status: "delivered",
        distance: 3.2,
        estimatedTime: 15,
        completedTime: new Date(),
        specialInstructions: "Requiere refrigeración"
      },
      {
        clientId: createdClients[2].id,
        truckId: createdTrucks[1].id,
        itemType: "suministros",
        itemCount: 8,
        priority: "medium",
        status: "pending",
        distance: 12.8,
        estimatedTime: 50,
        specialInstructions: "Coordinar con gerente de recepción"
      },
      {
        clientId: createdClients[3].id,
        truckId: createdTrucks[2].id,
        itemType: "equipos",
        itemCount: 1,
        priority: "low",
        status: "delivered",
        distance: 4.7,
        estimatedTime: 20,
        completedTime: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      }
    ];

    await Promise.all(
      sampleDeliveries.map(delivery => storage.createDelivery(delivery))
    );

    console.log("Database seeded successfully with Dominican Republic logistics data");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
