import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { TruckWithStats } from "@shared/schema";

interface TruckStatusProps {
  truck: TruckWithStats;
  isSelected: boolean;
  onSelect: () => void;
}

export default function TruckStatus({ truck, isSelected, onSelect }: TruckStatusProps) {
  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'in-transit':
        return <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />;
      case 'loading':
        return <div className="w-3 h-3 bg-orange-500 rounded-full" />;
      case 'completed':
        return <div className="w-3 h-3 bg-green-500 rounded-full" />;
      case 'idle':
      default:
        return <div className="w-3 h-3 bg-gray-400 rounded-full" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'in-transit': { className: "status-in-transit", label: "In Transit" },
      'loading': { className: "status-loading", label: "Loading" },
      'completed': { className: "status-completed", label: "Completed" },
      'idle': { className: "status-idle", label: "Idle" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.idle;
    return (
      <Badge variant="outline" className={`text-xs px-2 py-1 border ${config.className}`}>
        {config.label}
      </Badge>
    );
  };

  const getLocationText = (truck: TruckWithStats) => {
    if (truck.status === 'completed' || truck.status === 'idle') {
      return "Warehouse A";
    }
    if (truck.status === 'loading') {
      return "Warehouse A";
    }
    return "Downtown District"; // In real app, this would be geocoded from lat/lng
  };

  const getProgressText = (truck: TruckWithStats) => {
    const completed = truck.completedDeliveries || 0;
    const active = truck.activeDeliveries || 0;
    const total = completed + active;
    
    if (truck.status === 'completed') {
      return `Progress: ${completed}/${total} deliveries`;
    }
    return `Progress: ${completed}/${total} deliveries`;
  };

  const getETAText = (truck: TruckWithStats) => {
    switch (truck.status) {
      case 'in-transit':
        return "ETA: 2h 15m";
      case 'loading':
        return "Start: 30m";
      case 'completed':
        return `Completed: ${new Date().toLocaleTimeString("en-US", { 
          hour: "2-digit", 
          minute: "2-digit" 
        })}`;
      default:
        return "Idle";
    }
  };

  return (
    <Card 
      className={`cursor-pointer transition-colors ${
        isSelected ? 'border-primary-300 bg-primary-50' : 'hover:border-primary-300'
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {getStatusIndicator(truck.status)}
            <span className="font-medium text-gray-900">{truck.identifier}</span>
          </div>
          {getStatusBadge(truck.status)}
        </div>
        <div className="text-sm text-gray-600 space-y-1">
          <div>Driver: {truck.driver}</div>
          <div>Location: {getLocationText(truck)}</div>
          <div className="flex justify-between text-xs">
            <span>{getProgressText(truck)}</span>
            <span>{getETAText(truck)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
