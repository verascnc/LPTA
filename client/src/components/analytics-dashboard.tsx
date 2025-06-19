import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Fuel, Clock, Package, Star } from "lucide-react";
import { useTranslation, formatCurrency } from "@/lib/i18n";
import { DateRange } from "react-day-picker";

interface PerformanceData {
  totalDeliveries: number;
  completedDeliveries: number;
  averageEfficiency: number;
  topPerformers: Array<{
    truckId: number;
    identifier: string;
    driver: string;
    efficiency: number;
    driverRating: number;
  }>;
  truckPerformance: Array<{
    truckId: number;
    identifier: string;
    driver: string;
    totalDeliveries: number;
    completedDeliveries: number;
    efficiency: number;
    averageDeliveryTime: number;
  }>;
}

interface FuelData {
  totalFuelCost: number;
  averageEfficiency: number;
  monthlyTrend: Array<{
    month: string;
    fuelUsed: number;
    fuelCost: number;
    routes: number;
  }>;
  truckFuelData: Array<{
    truckId: number;
    identifier: string;
    fuelEfficiency: number;
    totalFuelUsed: number;
    totalDistance: number;
    totalFuelCost: number;
    actualEfficiency: number;
  }>;
}

export default function AnalyticsDashboard() {
  const { t, language } = useTranslation();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date()
  });
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  const { data: performanceData, isLoading: performanceLoading } = useQuery<PerformanceData>({
    queryKey: ['/api/analytics/performance', dateRange?.from, dateRange?.to],
  });

  const { data: fuelData, isLoading: fuelLoading } = useQuery<FuelData>({
    queryKey: ['/api/analytics/fuel'],
  });

  const generateReport = async () => {
    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: reportType,
          date: new Date().toISOString()
        })
      });
      if (response.ok) {
        console.log('Report generated successfully');
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Panel Analítico</h1>
          <p className="text-muted-foreground">
            Análisis completo del rendimiento de entregas y combustible
          </p>
        </div>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
          <DatePickerWithRange date={dateRange} setDate={setDateRange} />
          <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Diario</SelectItem>
              <SelectItem value="weekly">Semanal</SelectItem>
              <SelectItem value="monthly">Mensual</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={generateReport}>
            Generar Reporte
          </Button>
        </div>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Rendimiento</TabsTrigger>
          <TabsTrigger value="fuel">Combustible</TabsTrigger>
          <TabsTrigger value="trends">Tendencias</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          {performanceLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Entregas</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{performanceData?.totalDeliveries || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {performanceData?.completedDeliveries || 0} completadas
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Eficiencia Promedio</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {(performanceData?.averageEfficiency || 0).toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {(performanceData?.averageEfficiency || 0) > 85 ? (
                        <span className="text-green-600">Excelente rendimiento</span>
                      ) : (
                        <span className="text-amber-600">Necesita mejora</span>
                      )}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Mejor Conductor</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {performanceData?.topPerformers[0]?.driver || 'N/A'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {(performanceData?.topPerformers[0]?.efficiency || 0).toFixed(1)}% eficiencia
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.round(
                        (performanceData?.truckPerformance?.reduce((sum, t) => sum + t.averageDeliveryTime, 0) || 0) /
                        (performanceData?.truckPerformance?.length || 1)
                      )} min
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Por entrega
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Rendimiento por Camión</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={performanceData?.truckPerformance || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="identifier" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="efficiency" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top 3 Conductores</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {performanceData?.topPerformers.slice(0, 3).map((performer, index) => (
                        <div key={performer.truckId} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant={index === 0 ? "default" : "secondary"}>
                              #{index + 1}
                            </Badge>
                            <div>
                              <p className="font-medium">{performer.driver}</p>
                              <p className="text-sm text-muted-foreground">{performer.identifier}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{performer.efficiency.toFixed(1)}%</p>
                            <div className="flex items-center">
                              <Star className="h-3 w-3 text-yellow-400 mr-1" />
                              <span className="text-sm">{performer.driverRating.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="fuel" className="space-y-4">
          {fuelLoading ? (
            <div className="text-center py-8">Cargando datos de combustible...</div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Costo Total Combustible</CardTitle>
                    <Fuel className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(fuelData?.totalFuelCost || 0, language)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Últimos 30 días
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Eficiencia Promedio</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {(fuelData?.averageEfficiency || 0).toFixed(1)} km/L
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Flota completa
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Mejor Eficiencia</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {fuelData?.truckFuelData
                        .sort((a, b) => b.actualEfficiency - a.actualEfficiency)[0]
                        ?.actualEfficiency.toFixed(1) || 0} km/L
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {fuelData?.truckFuelData
                        .sort((a, b) => b.actualEfficiency - a.actualEfficiency)[0]
                        ?.identifier || 'N/A'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Tendencia de Combustible</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={fuelData?.monthlyTrend || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="fuelCost" stroke="#8884d8" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Eficiencia por Camión</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={fuelData?.truckFuelData || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="identifier" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="actualEfficiency" fill="#00C49F" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Tendencias</CardTitle>
              <CardDescription>
                Patrones de rendimiento y optimización de rutas en los últimos 6 meses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={fuelData?.monthlyTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="routes" stroke="#8884d8" name="Rutas" />
                  <Line type="monotone" dataKey="fuelUsed" stroke="#82ca9d" name="Combustible (L)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}