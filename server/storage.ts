import { 
  clients, trucks, deliveries, routes,
  type Client, type InsertClient,
  type Truck, type InsertTruck,
  type Delivery, type InsertDelivery,
  type Route, type InsertRoute,
  type DeliveryWithClient, type TruckWithStats, type RouteWithDetails
} from "@shared/schema";

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
    // Seed some initial data
    const sampleClients: InsertClient[] = [
      { name: "Acme Corp", address: "1234 Business St, Downtown", latitude: 40.7128, longitude: -74.0060 },
      { name: "TechStart Inc", address: "5678 Innovation Ave, Tech Park", latitude: 40.7589, longitude: -73.9851 },
      { name: "Global Manufacturing", address: "9999 Industrial Way, Factory District", latitude: 40.6892, longitude: -74.0445 }
    ];

    const sampleTrucks: InsertTruck[] = [
      { identifier: "TRK-001", driver: "Mike Johnson", currentLatitude: 40.7300, currentLongitude: -73.9950, status: "in-transit" },
      { identifier: "TRK-002", driver: "Sarah Chen", currentLatitude: 40.7500, currentLongitude: -73.9800, status: "loading" },
      { identifier: "TRK-003", driver: "Alex Rodriguez", currentLatitude: 40.7200, currentLongitude: -74.0100, status: "completed" }
    ];

    sampleClients.forEach(client => this.createClient(client));
    sampleTrucks.forEach(truck => this.createTruck(truck));

    // Create sample deliveries
    this.createDelivery({
      clientId: 1,
      truckId: 1,
      itemType: "boxes",
      itemCount: 3,
      priority: "high",
      status: "in-transit",
      distance: 12.3,
      estimatedTime: 45
    });

    this.createDelivery({
      clientId: 2,
      truckId: 1,
      itemType: "tanks",
      itemCount: 1,
      priority: "medium",
      status: "delivered",
      distance: 8.7,
      estimatedTime: 30,
      completedTime: new Date()
    });

    this.createDelivery({
      clientId: 3,
      truckId: 2,
      itemType: "tanks",
      itemCount: 2,
      priority: "urgent",
      status: "pending",
      distance: 18.2,
      estimatedTime: 65,
      specialInstructions: "Special handling required for hazardous materials"
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
      ...insertTruck, 
      id,
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
    const delivery: Delivery = { ...insertDelivery, id };
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
      ...insertRoute, 
      id,
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

export const storage = new MemStorage();
