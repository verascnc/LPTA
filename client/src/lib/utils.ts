import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility functions for the logistics app
export function formatDistance(distanceKm: number): string {
  return `${distanceKm.toFixed(1)} km`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

export function formatAddress(address: string): string {
  // Truncate long addresses for display
  if (address.length > 50) {
    return address.substring(0, 47) + "...";
  }
  return address;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'pending':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'in-transit':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'delivered':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'failed':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'loading':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'completed':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'idle':
      return 'text-gray-600 bg-gray-50 border-gray-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'urgent':
      return 'text-red-600';
    case 'high':
      return 'text-orange-600';
    case 'medium':
      return 'text-blue-600';
    case 'low':
      return 'text-gray-600';
    default:
      return 'text-blue-600';
  }
}

export function calculateEfficiency(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

export function generateTruckIdentifier(id: number): string {
  return `TRK-${id.toString().padStart(3, '0')}`;
}

export function isDeliveryOverdue(scheduledTime: string | Date | null, status: string): boolean {
  if (!scheduledTime || status === 'delivered') return false;
  
  const scheduled = new Date(scheduledTime);
  const now = new Date();
  
  return now > scheduled;
}

export function getDeliveryStatusIcon(status: string): string {
  switch (status) {
    case 'pending':
      return '⏳';
    case 'in-transit':
      return '🚚';
    case 'delivered':
      return '✅';
    case 'failed':
      return '❌';
    default:
      return '📦';
  }
}

export function getTruckStatusIcon(status: string): string {
  switch (status) {
    case 'in-transit':
      return '🚛';
    case 'loading':
      return '📦';
    case 'completed':
      return '✅';
    case 'idle':
      return '🅿️';
    default:
      return '🚚';
  }
}

// Mock geocoding function (in real app would use Google Maps or similar API)
export function mockGeocode(address: string): { latitude: number; longitude: number } {
  // Simple hash function to generate consistent coordinates from address
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    const char = address.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Generate coordinates within NYC area
  const baseLatitude = 40.7128;
  const baseLongitude = -74.0060;
  const latOffset = (hash % 1000) / 10000; // Small offset
  const lngOffset = ((hash >> 10) % 1000) / 10000;
  
  return {
    latitude: baseLatitude + latOffset,
    longitude: baseLongitude + lngOffset
  };
}

export function exportToCSV(data: any[], filename: string): void {
  if (!data.length) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
