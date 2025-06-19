import { useState, useEffect } from 'react';

export type Language = 'es' | 'en';

export interface TranslationStrings {
  // Navigation & General
  appName: string;
  routeOptimization: string;
  dashboard: string;
  routes: string;
  fleet: string;
  reports: string;

  // Dashboard
  routeDashboard: string;
  manageOptimizeRoutes: string;
  liveRouteTracking: string;
  liveUpdates: string;
  layers: string;
  center: string;
  
  // Sidebar
  activeRoutes: string;
  totalDistance: string;
  estimatedTime: string;
  completedToday: string;
  efficiency: string;
  fleetStatus: string;
  createNewRoute: string;
  optimizeAllRoutes: string;
  optimizing: string;

  // Truck Status
  driver: string;
  location: string;
  progress: string;
  deliveries: string;
  completed: string;
  eta: string;
  idle: string;
  inTransit: string;
  loading: string;
  warehouseA: string;
  downtownDistrict: string;

  // Delivery Panel
  deliveryManifest: string;
  export: string;
  route: string;
  active: string;
  client: string;
  address: string;
  items: string;
  status: string;
  priority: string;
  distance: string;
  boxes: string;
  tanks: string;
  pending: string;
  delivered: string;
  failed: string;
  specialInstructions: string;
  startDelivery: string;
  markDelivered: string;
  totalDeliveries: string;
  totalTime: string;
  timeRemaining: string;
  completeRoute: string;
  deliveryConfirmed: string;

  // Priority levels
  urgent: string;
  high: string;
  medium: string;
  low: string;

  // Status messages
  routesOptimized: string;
  allRoutesOptimized: string;
  optimizationFailed: string;
  unableToOptimize: string;
  deliveryUpdated: string;
  deliveryStatusUpdated: string;
  updateFailed: string;
  unableToUpdateStatus: string;
  routeCompleted: string;
  allDeliveriesCompleted: string;
  noData: string;
  noDeliveriesToExport: string;
  exportComplete: string;
  deliveryManifestDownloaded: string;
  createNewRouteFeature: string;
  
  // Legend
  legend: string;
  pendingDelivery: string;
  inProgress: string;
  activeTruck: string;

  // Time/Date
  selectTruckToView: string;
  start: string;
  minutes: string;
  hours: string;
  
  // Dominican Republic specific
  sanDomingo: string;
  santiago: string;
  laVega: string;
  puertoPlata: string;
  barahona: string;
  sanPedroMacoris: string;
  sanFranciscoMacoris: string;
  moca: string;
  bonao: string;
  azua: string;
}

const translations: Record<Language, TranslationStrings> = {
  es: {
    // Navigation & General
    appName: 'LogiRuta',
    routeOptimization: 'Optimización de Rutas',
    dashboard: 'Tablero',
    routes: 'Rutas',
    fleet: 'Flota',
    reports: 'Reportes',

    // Dashboard
    routeDashboard: 'Tablero de Rutas',
    manageOptimizeRoutes: 'Gestionar y optimizar rutas de entrega',
    liveRouteTracking: 'Seguimiento de Rutas en Vivo',
    liveUpdates: 'Actualizaciones en Vivo',
    layers: 'Capas',
    center: 'Centrar',
    
    // Sidebar
    activeRoutes: 'Rutas Activas',
    totalDistance: 'Distancia Total:',
    estimatedTime: 'Tiempo Est.:',
    completedToday: 'Completadas Hoy',
    efficiency: 'Eficiencia:',
    fleetStatus: 'Estado de la Flota',
    createNewRoute: 'Crear Nueva Ruta',
    optimizeAllRoutes: 'Optimizar Todas las Rutas',
    optimizing: 'Optimizando...',

    // Truck Status
    driver: 'Conductor:',
    location: 'Ubicación:',
    progress: 'Progreso:',
    deliveries: 'entregas',
    completed: 'Completado:',
    eta: 'ETA:',
    idle: 'Inactivo',
    inTransit: 'En Tránsito',
    loading: 'Cargando',
    warehouseA: 'Almacén A',
    downtownDistrict: 'Distrito Centro',

    // Delivery Panel
    deliveryManifest: 'Manifiesto de Entrega',
    export: 'Exportar',
    route: 'Ruta:',
    active: 'Activo',
    client: 'Cliente',
    address: 'Dirección',
    items: 'Artículos:',
    status: 'Estado',
    priority: 'Prioridad:',
    distance: 'Distancia:',
    boxes: 'cajas',
    tanks: 'tanques',
    pending: 'Pendiente',
    delivered: 'Entregado',
    failed: 'Fallido',
    specialInstructions: 'Instrucciones Especiales',
    startDelivery: 'Iniciar Entrega',
    markDelivered: 'Marcar Entregado',
    totalDeliveries: 'Total de Entregas:',
    totalTime: 'Tiempo Total:',
    timeRemaining: 'Tiempo Restante:',
    completeRoute: 'Completar Ruta',
    deliveryConfirmed: 'Entrega confirmada por el destinatario',

    // Priority levels
    urgent: 'Urgente',
    high: 'Alto',
    medium: 'Medio',
    low: 'Bajo',

    // Status messages
    routesOptimized: 'Rutas Optimizadas',
    allRoutesOptimized: 'Todas las rutas han sido optimizadas para mayor eficiencia.',
    optimizationFailed: 'Optimización Fallida',
    unableToOptimize: 'No se pueden optimizar las rutas. Inténtalo de nuevo.',
    deliveryUpdated: 'Entrega Actualizada',
    deliveryStatusUpdated: 'El estado de la entrega se ha actualizado exitosamente.',
    updateFailed: 'Actualización Fallida',
    unableToUpdateStatus: 'No se puede actualizar el estado de la entrega. Inténtalo de nuevo.',
    routeCompleted: 'Ruta Completada',
    allDeliveriesCompleted: '¡Todas las entregas han sido completadas exitosamente!',
    noData: 'Sin Datos',
    noDeliveriesToExport: 'No hay entregas para exportar para este camión.',
    exportComplete: 'Exportación Completa',
    deliveryManifestDownloaded: 'El manifiesto de entrega ha sido descargado.',
    createNewRouteFeature: '¡La función de crear nueva ruta estará disponible pronto!',
    
    // Legend
    legend: 'Leyenda',
    pendingDelivery: 'Entrega Pendiente',
    inProgress: 'En Progreso',
    activeTruck: 'Camión Activo',

    // Time/Date
    selectTruckToView: 'Selecciona un camión para ver los detalles de entrega',
    start: 'Inicio:',
    minutes: 'min',
    hours: 'h',
    
    // Dominican Republic specific
    sanDomingo: 'Santo Domingo',
    santiago: 'Santiago',
    laVega: 'La Vega',
    puertoPlata: 'Puerto Plata',
    barahona: 'Barahona',
    sanPedroMacoris: 'San Pedro de Macorís',
    sanFranciscoMacoris: 'San Francisco de Macorís',
    moca: 'Moca',
    bonao: 'Bonao',
    azua: 'Azua',
  },
  en: {
    // Navigation & General
    appName: 'LogiRoute',
    routeOptimization: 'Route Optimization',
    dashboard: 'Dashboard',
    routes: 'Routes',
    fleet: 'Fleet',
    reports: 'Reports',

    // Dashboard
    routeDashboard: 'Route Dashboard',
    manageOptimizeRoutes: 'Manage and optimize delivery routes',
    liveRouteTracking: 'Live Route Tracking',
    liveUpdates: 'Live Updates',
    layers: 'Layers',
    center: 'Center',
    
    // Sidebar
    activeRoutes: 'Active Routes',
    totalDistance: 'Total Distance:',
    estimatedTime: 'Est. Time:',
    completedToday: 'Completed Today',
    efficiency: 'Efficiency:',
    fleetStatus: 'Fleet Status',
    createNewRoute: 'Create New Route',
    optimizeAllRoutes: 'Optimize All Routes',
    optimizing: 'Optimizing...',

    // Truck Status
    driver: 'Driver:',
    location: 'Location:',
    progress: 'Progress:',
    deliveries: 'deliveries',
    completed: 'Completed:',
    eta: 'ETA:',
    idle: 'Idle',
    inTransit: 'In Transit',
    loading: 'Loading',
    warehouseA: 'Warehouse A',
    downtownDistrict: 'Downtown District',

    // Delivery Panel
    deliveryManifest: 'Delivery Manifest',
    export: 'Export',
    route: 'Route:',
    active: 'Active',
    client: 'Client',
    address: 'Address',
    items: 'Items:',
    status: 'Status',
    priority: 'Priority:',
    distance: 'Distance:',
    boxes: 'boxes',
    tanks: 'tanks',
    pending: 'Pending',
    delivered: 'Delivered',
    failed: 'Failed',
    specialInstructions: 'Special Instructions',
    startDelivery: 'Start Delivery',
    markDelivered: 'Mark Delivered',
    totalDeliveries: 'Total Deliveries:',
    totalTime: 'Total Time:',
    timeRemaining: 'Time Remaining:',
    completeRoute: 'Complete Route',
    deliveryConfirmed: 'Delivery confirmed by recipient',

    // Priority levels
    urgent: 'Urgent',
    high: 'High',
    medium: 'Medium',
    low: 'Low',

    // Status messages
    routesOptimized: 'Routes Optimized',
    allRoutesOptimized: 'All routes have been optimized for efficiency.',
    optimizationFailed: 'Optimization Failed',
    unableToOptimize: 'Unable to optimize routes. Please try again.',
    deliveryUpdated: 'Delivery Updated',
    deliveryStatusUpdated: 'Delivery status has been updated successfully.',
    updateFailed: 'Update Failed',
    unableToUpdateStatus: 'Unable to update delivery status. Please try again.',
    routeCompleted: 'Route Completed',
    allDeliveriesCompleted: 'All deliveries have been completed successfully!',
    noData: 'No Data',
    noDeliveriesToExport: 'No deliveries to export for this truck.',
    exportComplete: 'Export Complete',
    deliveryManifestDownloaded: 'Delivery manifest has been downloaded.',
    createNewRouteFeature: 'New route creation feature coming soon!',
    
    // Legend
    legend: 'Legend',
    pendingDelivery: 'Pending Delivery',
    inProgress: 'In Progress',
    activeTruck: 'Active Truck',

    // Time/Date
    selectTruckToView: 'Select a truck to view delivery details',
    start: 'Start:',
    minutes: 'min',
    hours: 'h',
    
    // Dominican Republic specific
    sanDomingo: 'Santo Domingo',
    santiago: 'Santiago',
    laVega: 'La Vega',
    puertoPlata: 'Puerto Plata',
    barahona: 'Barahona',
    sanPedroMacoris: 'San Pedro de Macorís',
    sanFranciscoMacoris: 'San Francisco de Macorís',
    moca: 'Moca',
    bonao: 'Bonao',
    azua: 'Azua',
  }
};

// Hook for managing language state
export function useTranslation() {
  const [language, setLanguage] = useState<Language>(() => {
    // Check localStorage first, then default to Spanish for Dominican Republic
    const stored = localStorage.getItem('language') as Language;
    return stored || 'es';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = translations[language];

  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  return {
    language,
    changeLanguage,
    t
  };
}

// Utility function for formatting numbers with Dominican locale
export function formatNumber(num: number, lang: Language = 'es'): string {
  return new Intl.NumberFormat(lang === 'es' ? 'es-DO' : 'en-US').format(num);
}

// Utility function for formatting currency (Dominican Peso)
export function formatCurrency(amount: number, lang: Language = 'es'): string {
  return new Intl.NumberFormat(lang === 'es' ? 'es-DO' : 'en-US', {
    style: 'currency',
    currency: lang === 'es' ? 'DOP' : 'USD'
  }).format(amount);
}

// Utility function for formatting dates in Dominican format
export function formatDate(date: Date | string, lang: Language = 'es'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(lang === 'es' ? 'es-DO' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
}

// Utility function for formatting time
export function formatTime(date: Date | string | null, lang: Language = 'es'): string {
  if (!date) return "N/A";
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(lang === 'es' ? 'es-DO' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Santo_Domingo'
  }).format(dateObj);
}