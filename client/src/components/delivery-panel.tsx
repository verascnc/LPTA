import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Download, Flag } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTranslation, formatTime } from "@/lib/i18n";
import type { DeliveryWithClient } from "@shared/schema";

interface DeliveryPanelProps {
  selectedTruck: number | null;
}

export default function DeliveryPanel({ selectedTruck }: DeliveryPanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t, language } = useTranslation();

  const { data: deliveries, isLoading } = useQuery<DeliveryWithClient[]>({
    queryKey: ["/api/deliveries/truck", selectedTruck],
    enabled: !!selectedTruck,
  });

  const updateDeliveryMutation = useMutation({
    mutationFn: async ({ deliveryId, status }: { deliveryId: number; status: string }) => {
      const updateData: any = { status };
      if (status === 'delivered') {
        updateData.completedTime = new Date().toISOString();
      }
      const response = await apiRequest("PATCH", `/api/deliveries/${deliveryId}`, updateData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t.deliveryUpdated,
        description: t.deliveryStatusUpdated,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/deliveries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: () => {
      toast({
        title: t.updateFailed,
        description: t.unableToUpdateStatus,
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { className: "status-pending", label: t.pending },
      "in-transit": { className: "status-in-transit", label: t.inTransit },
      delivered: { className: "status-delivered", label: t.delivered },
      failed: { className: "status-failed", label: t.failed },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge variant="outline" className={`text-xs px-2 py-1 border ${config.className}`}>
        {config.label}
      </Badge>
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'priority-urgent';
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  const formatDeliveryTime = (date: Date | string | null) => {
    if (!date) return "N/A";
    return formatTime(new Date(date), language);
  };

  const handleExportManifest = () => {
    if (!deliveries || deliveries.length === 0) {
      toast({
        title: t.noData,
        description: t.noDeliveriesToExport,
        variant: "destructive",
      });
      return;
    }

    // Create CSV content with Spanish headers
    const headers = language === 'es' 
      ? "Cliente,Dirección,Artículos,Estado,Prioridad,Distancia,Tiempo Est."
      : "Client,Address,Items,Status,Priority,Distance,ETA";
    
    const csvContent = [
      headers,
      ...deliveries.map(d => 
        `"${d.client.name}","${d.client.address}","${d.itemCount} ${d.itemType}","${d.status}","${d.priority}","${d.distance || 0} km","${d.estimatedTime || 0} min"`
      )
    ].join("\n");

    // Download file
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const filename = language === 'es' 
      ? `manifiesto-entregas-camion-${selectedTruck}.csv`
      : `delivery-manifest-truck-${selectedTruck}.csv`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: t.exportComplete,
      description: t.deliveryManifestDownloaded,
    });
  };

  const completedDeliveries = deliveries?.filter(d => d.status === 'delivered').length || 0;
  const totalDeliveries = deliveries?.length || 0;
  const totalDistance = deliveries?.reduce((sum, d) => sum + (d.distance || 0), 0) || 0;
  const remainingTime = deliveries?.filter(d => d.status !== 'delivered')
    .reduce((sum, d) => sum + (d.estimatedTime || 0), 0) || 0;

  if (!selectedTruck) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 flex items-center justify-center">
        <p className="text-gray-500 text-center px-4">
          Select a truck to view delivery details
        </p>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">Delivery Manifest</h3>
          <Button variant="ghost" size="sm" onClick={handleExportManifest}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>Route: TRK-{selectedTruck.toString().padStart(3, '0')}</span>
          <span className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
            Active
          </span>
        </div>
      </div>

      {/* Delivery List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-50 animate-pulse rounded-lg h-32" />
            ))}
          </div>
        ) : deliveries?.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No deliveries assigned to this truck</p>
          </div>
        ) : (
          deliveries?.map((delivery) => (
            <Card key={delivery.id} className="hover:border-primary-300 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{delivery.client.name}</h4>
                    <p className="text-sm text-gray-600">{delivery.client.address}</p>
                  </div>
                  {getStatusBadge(delivery.status)}
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                  <div>
                    <span className="text-gray-500">Items:</span>
                    <div className="font-medium">
                      {delivery.itemCount} {delivery.itemType}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">
                      {delivery.status === 'delivered' ? 'Completed:' : 'ETA:'}
                    </span>
                    <div className="font-medium">
                      {delivery.status === 'delivered' 
                        ? formatTime(delivery.completedTime)
                        : formatTime(delivery.scheduledTime) || "TBD"
                      }
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Distance:</span>
                    <div className="font-medium">{delivery.distance?.toFixed(1) || 0} km</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Priority:</span>
                    <div className={`font-medium ${getPriorityColor(delivery.priority)}`}>
                      {delivery.priority.charAt(0).toUpperCase() + delivery.priority.slice(1)}
                    </div>
                  </div>
                </div>

                {delivery.specialInstructions && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-xs text-yellow-700 mb-3">
                    <span className="font-medium">⚠️ </span>
                    {delivery.specialInstructions}
                  </div>
                )}

                {delivery.status === 'delivered' ? (
                  <div className="flex items-center text-xs text-green-600">
                    <span className="mr-1">✅</span>
                    Delivery confirmed by recipient
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      className="flex-1 text-xs"
                      onClick={() => updateDeliveryMutation.mutate({ 
                        deliveryId: delivery.id, 
                        status: delivery.status === 'pending' ? 'in-transit' : 'delivered' 
                      })}
                      disabled={updateDeliveryMutation.isPending}
                    >
                      {delivery.status === 'pending' ? 'Start Delivery' : 'Mark Delivered'}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Route Summary Footer */}
      <div className="border-t border-gray-200 p-4">
        <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Total Deliveries:</span>
            <span className="font-medium">{totalDeliveries} items</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Completed:</span>
            <span className="font-medium text-green-600">
              {completedDeliveries}/{totalDeliveries}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Distance:</span>
            <span className="font-medium">{totalDistance.toFixed(1)} km</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Time Remaining:</span>
            <span className="font-medium">
              {Math.floor(remainingTime / 60)}h {remainingTime % 60}m
            </span>
          </div>
        </div>
        
        <Button 
          className="w-full mt-3 bg-green-500 hover:bg-green-600"
          disabled={completedDeliveries !== totalDeliveries || totalDeliveries === 0}
          onClick={() => {
            toast({
              title: "Route Completed",
              description: "All deliveries have been completed successfully!",
            });
          }}
        >
          <Flag className="h-4 w-4 mr-2" />
          Complete Route
        </Button>
      </div>
    </div>
  );
}
