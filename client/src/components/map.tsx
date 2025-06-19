import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ZoomIn, ZoomOut, Layers, Crosshair } from "lucide-react";
import type { TruckWithStats, DeliveryWithClient } from "@shared/schema";

interface MapProps {
  selectedTruck: number | null;
}

export default function Map({ selectedTruck }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.0060 });
  const [zoom, setZoom] = useState(100);

  const { data: trucks } = useQuery<TruckWithStats[]>({
    queryKey: ["/api/trucks"],
  });

  const { data: deliveries } = useQuery<DeliveryWithClient[]>({
    queryKey: ["/api/deliveries"],
  });

  // Filter deliveries for selected truck
  const truckDeliveries = deliveries?.filter(d => d.truckId === selectedTruck) || [];
  const selectedTruckData = trucks?.find(t => t.id === selectedTruck);

  // Simulate real-time truck movement
  useEffect(() => {
    const interval = setInterval(() => {
      // In a real app, this would update truck positions via WebSocket or polling
      // For now, we just trigger a re-render to simulate movement
      if (selectedTruckData) {
        // Small random movement to simulate GPS updates
        const newLat = (selectedTruckData.currentLatitude || 40.7128) + (Math.random() - 0.5) * 0.001;
        const newLng = (selectedTruckData.currentLongitude || -74.0060) + (Math.random() - 0.5) * 0.001;
        // In real implementation, this would call an API to update truck location
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedTruckData]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 10, 50));
  };

  const handleCenterMap = () => {
    if (selectedTruckData?.currentLatitude && selectedTruckData?.currentLongitude) {
      setMapCenter({
        lat: selectedTruckData.currentLatitude,
        lng: selectedTruckData.currentLongitude
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'in-transit': return 'bg-blue-500';
      case 'delivered': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '📦';
      case 'in-transit': return '🚛';
      case 'delivered': return '✅';
      case 'failed': return '❌';
      default: return '📍';
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Map Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="font-semibold text-gray-900">Live Route Tracking</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Live Updates</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Layers className="h-4 w-4 mr-1" />
            Layers
          </Button>
          <Button variant="outline" size="sm" onClick={handleCenterMap}>
            <Crosshair className="h-4 w-4 mr-1" />
            Center
          </Button>
        </div>
      </div>

      {/* Map Display Area */}
      <div className="flex-1 relative overflow-hidden" ref={mapRef}>
        {/* Simulated Map Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-300"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800')",
            filter: "sepia(20%) saturate(0.8)",
            transform: `scale(${zoom / 100})`
          }}
        />

        {/* Route Lines - would be calculated based on actual routing */}
        {truckDeliveries.length > 1 && (
          <>
            <div 
              className="absolute h-1 bg-blue-500 opacity-70"
              style={{
                top: "30%",
                left: "15%",
                width: "25%",
                transform: "rotate(25deg)",
                transformOrigin: "left center"
              }}
            />
            <div 
              className="absolute h-1 bg-blue-500 opacity-70"
              style={{
                top: "45%",
                left: "35%",
                width: "20%",
                transform: "rotate(-15deg)",
                transformOrigin: "left center"
              }}
            />
          </>
        )}

        {/* Delivery Locations */}
        {truckDeliveries.map((delivery, index) => (
          <div
            key={delivery.id}
            className="absolute transform -translate-x-1/2 -translate-y-full"
            style={{
              top: `${25 + index * 15}%`,
              left: `${20 + index * 20}%`
            }}
          >
            <div className={`${getStatusColor(delivery.status)} text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg border-2 border-white`}>
              <span className="text-xs">{getStatusIcon(delivery.status)}</span>
            </div>
            <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow-md text-xs whitespace-nowrap">
              {delivery.client.name} - {delivery.itemCount} {delivery.itemType}
            </div>
          </div>
        ))}

        {/* Selected Truck Location */}
        {selectedTruckData && selectedTruckData.currentLatitude && selectedTruckData.currentLongitude && (
          <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
            style={{
              top: "35%",
              left: "45%"
            }}
          >
            <div className="bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg border-3 border-white">
              <span className="text-sm">🚛</span>
            </div>
            <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded shadow-md text-xs whitespace-nowrap">
              {selectedTruckData.identifier} - {selectedTruckData.driver}
            </div>
          </div>
        )}

        {/* Warehouse Location */}
        <div
          className="absolute transform -translate-x-1/2 -translate-y-full"
          style={{
            top: "70%",
            left: "20%"
          }}
        >
          <div className="bg-gray-700 text-white rounded-lg w-10 h-8 flex items-center justify-center shadow-lg border-2 border-white">
            <span className="text-xs">🏭</span>
          </div>
          <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow-md text-xs whitespace-nowrap font-medium">
            Warehouse A
          </div>
        </div>

        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <Button variant="outline" size="icon" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 p-3">
          <h4 className="font-semibold text-gray-900 text-sm mb-2">Legend</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Pending Delivery</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Completed</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>In Progress</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Active Truck</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
