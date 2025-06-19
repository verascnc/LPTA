import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, Plus, Route, Warehouse } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import TruckStatus from "@/components/truck-status";
import type { TruckWithStats } from "@shared/schema";

interface SidebarProps {
  selectedTruck: number | null;
  onTruckSelect: (truckId: number) => void;
  stats?: {
    activeRoutes: number;
    totalDistance: number;
    estimatedTime: number;
    completedToday: number;
  };
}

export default function Sidebar({ selectedTruck, onTruckSelect, stats }: SidebarProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: trucks, isLoading } = useQuery<TruckWithStats[]>({
    queryKey: ["/api/trucks"],
  });

  const optimizeRoutesMutation = useMutation({
    mutationFn: async () => {
      // This is a simplified optimization - in real app would be more sophisticated
      const response = await apiRequest("POST", "/api/routes/optimize", {
        truckId: selectedTruck || 1,
        deliveryIds: [1, 2, 3] // In real app, this would be dynamic
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Routes Optimized",
        description: "All routes have been optimized for efficiency.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/routes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: () => {
      toast({
        title: "Optimization Failed",
        description: "Unable to optimize routes. Please try again.",
        variant: "destructive",
      });
    },
  });

  const formatTime = (minutes?: number) => {
    if (!minutes) return "0m";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <aside className="w-80 bg-white border-r border-gray-200 shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Truck className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">LogiRoute</h1>
            <p className="text-xs text-gray-500">Route Optimization</p>
          </div>
        </div>
      </div>

      {/* Route Summary Cards */}
      <div className="p-4 space-y-3">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-blue-700">Active Routes</h3>
              <Badge variant="secondary" className="bg-primary text-white">
                {stats?.activeRoutes || 0}
              </Badge>
            </div>
            <div className="text-sm text-blue-600 space-y-1">
              <div className="flex justify-between">
                <span>Total Distance:</span>
                <span className="font-medium">{stats?.totalDistance?.toFixed(1) || 0} km</span>
              </div>
              <div className="flex justify-between">
                <span>Est. Time:</span>
                <span className="font-medium">{formatTime(stats?.estimatedTime)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-green-700">Completed Today</h3>
              <Badge variant="secondary" className="bg-green-500 text-white">
                {stats?.completedToday || 0}
              </Badge>
            </div>
            <div className="text-sm text-green-600">
              <div className="flex justify-between">
                <span>Efficiency:</span>
                <span className="font-medium">94.2%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Truck Status List */}
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="font-semibold text-gray-700 mb-3">Fleet Status</h3>
        <div className="space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-100 animate-pulse rounded-lg h-24" />
              ))}
            </div>
          ) : (
            trucks?.map((truck) => (
              <TruckStatus
                key={truck.id}
                truck={truck}
                isSelected={selectedTruck === truck.id}
                onSelect={() => onTruckSelect(truck.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-t border-gray-200">
        <Button 
          className="w-full mb-2" 
          onClick={() => {
            toast({
              title: "Create New Route",
              description: "New route creation feature coming soon!",
            });
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Route
        </Button>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => optimizeRoutesMutation.mutate()}
          disabled={optimizeRoutesMutation.isPending}
        >
          <Route className="h-4 w-4 mr-2" />
          {optimizeRoutesMutation.isPending ? "Optimizing..." : "Optimize All Routes"}
        </Button>
      </div>
    </aside>
  );
}
