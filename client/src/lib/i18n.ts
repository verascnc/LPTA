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

  // Authentication & Landing Page
  auth: {
    login: string;
    logout: string;
  };
  common: {
    appName: string;
  };
  landing: {
    hero: {
      title: string;
      subtitle: string;
      cta: string;
    };
    features: {
      title: string;
      subtitle: string;
      fleet: {
        title: string;
        description: string;
      };
      tracking: {
        title: string;
        description: string;
      };
      analytics: {
        title: string;
        description: string;
      };
      optimization: {
        title: string;
        description: string;
      };
      maintenance: {
        title: string;
        description: string;
      };
      multilingual: {
        title: string;
        description: string;
      };
    };
    stats: {
      title: string;
      deliveries: string;
      accuracy: string;
      efficiency: string;
      support: string;
    };
    footer: {
      description: string;
    };
  };
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

    // Authentication & Landing Page
    auth: {
      login: 'Iniciar Sesión',
      logout: 'Cerrar Sesión',
    },
    common: {
      appName: 'LogiRuta',
    },
    landing: {
      hero: {
        title: 'Optimiza tus Entregas con Tecnología Avanzada',
        subtitle: 'Sistema completo de gestión logística para República Dominicana con seguimiento en tiempo real, optimización de rutas y análisis empresarial.',
        cta: 'Comenzar Ahora',
      },
      features: {
        title: 'Características Empresariales',
        subtitle: 'Todo lo que necesitas para gestionar tu flota de entregas de manera eficiente',
        fleet: {
          title: 'Gestión de Flota',
          description: 'Administra tu flota completa con seguimiento de ubicación en tiempo real y monitoreo del estado de los vehículos.',
        },
        tracking: {
          title: 'Seguimiento GPS',
          description: 'Rastrea todas las entregas con precisión GPS y proporciona actualizaciones en tiempo real a los clientes.',
        },
        analytics: {
          title: 'Análisis Avanzado',
          description: 'Obtén información detallada sobre el rendimiento, eficiencia de combustible y métricas de entregas.',
        },
        optimization: {
          title: 'Optimización de Rutas',
          description: 'Algoritmos inteligentes para optimizar rutas y reducir tiempos de entrega y costos de combustible.',
        },
        maintenance: {
          title: 'Gestión de Mantenimiento',
          description: 'Programa y rastrea el mantenimiento de vehículos con alertas automáticas y seguimiento de costos.',
        },
        multilingual: {
          title: 'Soporte Multiidioma',
          description: 'Interfaz completamente localizada en español e inglés para República Dominicana.',
        },
      },
      stats: {
        title: 'Resultados Comprobados',
        deliveries: 'Entregas Exitosas',
        accuracy: 'Precisión GPS',
        efficiency: 'Mejora en Eficiencia',
        support: 'Soporte Técnico',
      },
      footer: {
        description: 'La solución logística más avanzada para empresas dominicanas.',
      },
    },
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

    // Authentication & Landing Page
    auth: {
      login: 'Login',
      logout: 'Logout',
    },
    common: {
      appName: 'LogiRoute',
    },
    landing: {
      hero: {
        title: 'Optimize Your Deliveries with Advanced Technology',
        subtitle: 'Complete logistics management system for Dominican Republic with real-time tracking, route optimization, and enterprise analytics.',
        cta: 'Get Started',
      },
      features: {
        title: 'Enterprise Features',
        subtitle: 'Everything you need to efficiently manage your delivery fleet',
        fleet: {
          title: 'Fleet Management',
          description: 'Manage your entire fleet with real-time location tracking and vehicle status monitoring.',
        },
        tracking: {
          title: 'GPS Tracking',
          description: 'Track all deliveries with GPS precision and provide real-time updates to customers.',
        },
        analytics: {
          title: 'Advanced Analytics',
          description: 'Get detailed insights on performance, fuel efficiency, and delivery metrics.',
        },
        optimization: {
          title: 'Route Optimization',
          description: 'Intelligent algorithms to optimize routes and reduce delivery times and fuel costs.',
        },
        maintenance: {
          title: 'Maintenance Management',
          description: 'Schedule and track vehicle maintenance with automated alerts and cost tracking.',
        },
        multilingual: {
          title: 'Multilingual Support',
          description: 'Fully localized interface in Spanish and English for Dominican Republic.',
        },
      },
      stats: {
        title: 'Proven Results',
        deliveries: 'Successful Deliveries',
        accuracy: 'GPS Accuracy',
        efficiency: 'Efficiency Improvement',
        support: 'Technical Support',
      },
      footer: {
        description: 'The most advanced logistics solution for Dominican businesses.',
      },
    },
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