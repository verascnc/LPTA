import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { MapPin, Package, Clock, CheckCircle, XCircle, AlertTriangle, Navigation, Phone } from "lucide-react";
import { useTranslation, formatTime } from "@/lib/i18n";
import { useWebSocket } from "@/hooks/use-websocket";
import { apiRequest } from "@/lib/queryClient";
import type { DeliveryWithClient } from "@shared/schema";

interface DriverInterfaceProps {
  truckId: number;
  driverName: string;
}

export default function DriverInterface({ truckId, driverName }: DriverInterfaceProps) {
  const { t, language } = useTranslation();
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryWithClient | null>(null);
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const queryClient = useQueryClient();
  const { isConnected } = useWebSocket();

  // Monitor online status for offline capability
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const { data: deliveries, isLoading } = useQuery<DeliveryWithClient[]>({
    queryKey: ['/api/deliveries/truck', truckId],
  });

  const updateDeliveryMutation = useMutation({
    mutationFn: async ({ deliveryId, updates }: { deliveryId: number; updates: any }) => {
      const response = await fetch(`/api/deliveries/${deliveryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update delivery');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/deliveries/truck', truckId] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
    },
  });

  // GPS location updates for real-time tracking
  const updateLocationMutation = useMutation({
    mutationFn: async ({ latitude, longitude }: { latitude: number; longitude: number }) => {
      const response = await fetch(`/api/trucks/${truckId}/location`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude, longitude }),
      });
      if (!response.ok) throw new Error('Failed to update location');
      return response.json();
    },
  });

  const startDelivery = (delivery: DeliveryWithClient) => {
    updateDeliveryMutation.mutate({
      deliveryId: delivery.id,
      updates: { 
        status: 'in-transit',
        scheduledTime: new Date().toISOString()
      }
    });
  };

  const completeDelivery = (delivery: DeliveryWithClient, rating: number = 5) => {
    updateDeliveryMutation.mutate({
      deliveryId: delivery.id,
      updates: { 
        status: 'delivered',
        completedTime: new Date().toISOString(),
        deliveryRating: rating,
        deliveryNotes: deliveryNotes,
        actualTime: delivery.estimatedTime // In production, calculate actual time
      }
    });
    setSelectedDelivery(null);
    setDeliveryNotes("");
  };

  const markDeliveryFailed = (delivery: DeliveryWithClient, reason: string) => {
    updateDeliveryMutation.mutate({
      deliveryId: delivery.id,
      updates: { 
        status: 'failed',
        deliveryNotes: reason
      }
    });
    setSelectedDelivery(null);
  };

  // Simulate GPS update every 30 seconds when online
  useEffect(() => {
    if (!isOnline || !isConnected) return;
    
    const interval = setInterval(() => {
      // In production, get actual GPS coordinates
      navigator.geolocation?.getCurrentPosition(
        (position) => {
          updateLocationMutation.mutate({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        () => {
          // Fallback: simulate movement in Santo Domingo area
          const baseLat = 18.4861;
          const baseLng = -69.9312;
          const randomLat = baseLat + (Math.random() - 0.5) * 0.01;
          const randomLng = baseLng + (Math.random() - 0.5) * 0.01;
          
          updateLocationMutation.mutate({
            latitude: randomLat,
            longitude: randomLng
          });
        }
      );
    }, 30000);

    return () => clearInterval(interval);
  }, [isOnline, isConnected, truckId, updateLocationMutation]);

  const pendingDeliveries = deliveries?.filter(d => d.status === 'pending') || [];
  const inTransitDeliveries = deliveries?.filter(d => d.status === 'in-transit') || [];
  const completedDeliveries = deliveries?.filter(d => d.status === 'delivered') || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-transit': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'in-transit': return <Navigation className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Panel del Conductor</h1>
            <p className="text-gray-600">Bienvenido, {driverName}</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
              isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span>{isOnline ? 'En línea' : 'Sin conexión'}</span>
            </div>
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
              isConnected ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
            }`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-blue-400' : 'bg-gray-400'}`}></div>
              <span>{isConnected ? 'Tiempo real' : 'Desconectado'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Offline Alert */}
      {!isOnline && (
        <Alert className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Trabajando sin conexión. Los cambios se sincronizarán cuando vuelva la conexión.
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{pendingDeliveries.length}</p>
                <p className="text-sm text-gray-600">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Navigation className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{inTransitDeliveries.length}</p>
                <p className="text-sm text-gray-600">En tránsito</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{completedDeliveries.length}</p>
                <p className="text-sm text-gray-600">Completadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{deliveries?.length || 0}</p>
                <p className="text-sm text-gray-600">Total hoy</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Delivery */}
      {inTransitDeliveries.length > 0 && (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-800">
              <Navigation className="h-5 w-5 mr-2" />
              Entrega Actual
            </CardTitle>
          </CardHeader>
          <CardContent>
            {inTransitDeliveries.map(delivery => (
              <div key={delivery.id} className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{delivery.client.name}</h3>
                    <p className="text-gray-600 flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {delivery.client.address}
                    </p>
                  </div>
                  <Badge className={getStatusColor(delivery.status)}>
                    {getStatusIcon(delivery.status)}
                    <span className="ml-1 capitalize">{delivery.status}</span>
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Artículos:</strong> {delivery.itemCount} {delivery.itemType}</p>
                    <p><strong>Prioridad:</strong> {delivery.priority}</p>
                  </div>
                  <div>
                    <p><strong>Tiempo estimado:</strong> {delivery.estimatedTime} min</p>
                    <p><strong>Distancia:</strong> {delivery.distance?.toFixed(1)} km</p>
                  </div>
                </div>

                {delivery.specialInstructions && (
                  <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                    <p className="text-sm"><strong>Instrucciones especiales:</strong></p>
                    <p className="text-sm text-gray-700">{delivery.specialInstructions}</p>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        className="flex-1"
                        onClick={() => setSelectedDelivery(delivery)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Marcar como Entregado
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirmar Entrega</DialogTitle>
                        <DialogDescription>
                          ¿Confirma que la entrega a {delivery.client.name} se completó exitosamente?
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Textarea
                          placeholder="Notas adicionales (opcional)"
                          value={deliveryNotes}
                          onChange={(e) => setDeliveryNotes(e.target.value)}
                        />
                        <div className="flex space-x-2">
                          <Button 
                            onClick={() => completeDelivery(delivery)}
                            className="flex-1"
                          >
                            Confirmar Entrega
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => markDeliveryFailed(delivery, deliveryNotes || "Entrega fallida")}
                            className="flex-1"
                          >
                            Marcar como Fallida
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline" size="icon" asChild>
                    <a href={`tel:${delivery.client.contactPhone || ''}`}>
                      <Phone className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Pending Deliveries */}
      <Card>
        <CardHeader>
          <CardTitle>Entregas Pendientes</CardTitle>
          <CardDescription>
            Próximas entregas programadas para hoy
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingDeliveries.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No hay entregas pendientes
            </p>
          ) : (
            <div className="space-y-4">
              {pendingDeliveries.map((delivery, index) => (
                <div key={delivery.id}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold">{delivery.client.name}</h3>
                      <p className="text-gray-600 text-sm flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {delivery.client.address}
                      </p>
                      <p className="text-sm mt-1">
                        {delivery.itemCount} {delivery.itemType} • {delivery.priority}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(delivery.status)}>
                        {getStatusIcon(delivery.status)}
                        <span className="ml-1 capitalize">{delivery.status}</span>
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        ~{delivery.estimatedTime} min
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <Button 
                      onClick={() => startDelivery(delivery)}
                      disabled={inTransitDeliveries.length > 0 || updateDeliveryMutation.isPending}
                      className="w-full"
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      Iniciar Entrega
                    </Button>
                  </div>

                  {index < pendingDeliveries.length - 1 && (
                    <Separator className="mt-4" />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed Deliveries Today */}
      {completedDeliveries.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-green-700">Entregas Completadas Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {completedDeliveries.map(delivery => (
                <div key={delivery.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium">{delivery.client.name}</p>
                    <p className="text-sm text-gray-600">
                      {formatTime(delivery.completedTime, language)}
                    </p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}