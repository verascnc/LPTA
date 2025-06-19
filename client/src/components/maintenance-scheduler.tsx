import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Wrench, AlertTriangle, Clock, CheckCircle, Plus, Truck } from "lucide-react";
import { useTranslation, formatCurrency, formatDate } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { Truck as TruckType, MaintenanceRecord } from "@shared/schema";

const maintenanceSchema = z.object({
  truckId: z.number(),
  type: z.enum(["scheduled", "emergency", "preventive"]),
  description: z.string().min(1, "La descripción es requerida"),
  cost: z.number().min(0, "El costo debe ser mayor o igual a 0"),
  performedAt: z.date(),
  nextMaintenanceKm: z.number().optional(),
  mechanic: z.string().optional(),
  notes: z.string().optional(),
});

type MaintenanceFormData = z.infer<typeof maintenanceSchema>;

export default function MaintenanceScheduler() {
  const { t, language } = useTranslation();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      type: "scheduled",
      performedAt: new Date(),
      cost: 0,
    },
  });

  const { data: trucks, isLoading: trucksLoading } = useQuery<TruckType[]>({
    queryKey: ["/api/trucks"],
  });

  const { data: maintenanceRecords, isLoading: recordsLoading } = useQuery<MaintenanceRecord[]>({
    queryKey: ["/api/maintenance"],
  });

  const createMaintenanceMutation = useMutation({
    mutationFn: async (data: MaintenanceFormData) => {
      const response = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create maintenance record");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/trucks"] });
      setIsDialogOpen(false);
      form.reset();
    },
  });

  const onSubmit = (data: MaintenanceFormData) => {
    createMaintenanceMutation.mutate(data);
  };

  const getMaintenanceTypeColor = (type: string) => {
    switch (type) {
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "emergency": return "bg-red-100 text-red-800";
      case "preventive": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getMaintenanceTypeIcon = (type: string) => {
    switch (type) {
      case "scheduled": return <Clock className="h-4 w-4" />;
      case "emergency": return <AlertTriangle className="h-4 w-4" />;
      case "preventive": return <CheckCircle className="h-4 w-4" />;
      default: return <Wrench className="h-4 w-4" />;
    }
  };

  // Calculate trucks needing maintenance
  const trucksNeedingMaintenance = trucks?.filter(truck => {
    if (!truck.nextMaintenanceKm || !truck.totalKmDriven) return false;
    return truck.totalKmDriven >= truck.nextMaintenanceKm - 1000; // Alert 1000km before
  }) || [];

  // Group maintenance records by truck
  const maintenanceByTruck = maintenanceRecords?.reduce((acc, record) => {
    if (!acc[record.truckId]) acc[record.truckId] = [];
    acc[record.truckId].push(record);
    return acc;
  }, {} as Record<number, MaintenanceRecord[]>) || {};

  if (trucksLoading || recordsLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Programación de Mantenimiento</h2>
          <p className="text-muted-foreground">
            Gestión completa del mantenimiento de la flota
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Mantenimiento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Programar Mantenimiento</DialogTitle>
              <DialogDescription>
                Registre un nuevo mantenimiento para un camión de la flota
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="truckId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Camión</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar camión" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {trucks?.map((truck) => (
                              <SelectItem key={truck.id} value={truck.id.toString()}>
                                {truck.identifier} - {truck.driver}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Mantenimiento</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="scheduled">Programado</SelectItem>
                            <SelectItem value="preventive">Preventivo</SelectItem>
                            <SelectItem value="emergency">Emergencia</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Cambio de aceite y filtros" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="cost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Costo (DOP)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            placeholder="0.00" 
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="performedAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de Realización</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Seleccionar fecha</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date("1900-01-01")}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nextMaintenanceKm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Próximo Mantenimiento (km)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="150000" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mechanic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mecánico</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre del mecánico" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas Adicionales</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Observaciones, piezas reemplazadas, etc."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createMaintenanceMutation.isPending}>
                    {createMaintenanceMutation.isPending ? "Guardando..." : "Guardar Mantenimiento"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Maintenance Alerts */}
      {trucksNeedingMaintenance.length > 0 && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Atención:</strong> {trucksNeedingMaintenance.length} camión(es) necesitan mantenimiento pronto.
            <div className="mt-2 space-y-1">
              {trucksNeedingMaintenance.map(truck => (
                <div key={truck.id} className="text-sm">
                  • {truck.identifier}: {truck.totalKmDriven?.toLocaleString()} km recorridos
                  (próximo mantenimiento: {truck.nextMaintenanceKm?.toLocaleString()} km)
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Fleet Maintenance Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Mantenimientos</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maintenanceRecords?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costo Total</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                maintenanceRecords?.reduce((sum, record) => sum + record.cost, 0) || 0,
                language
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Últimos 30 días
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Activas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {trucksNeedingMaintenance.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Requieren atención
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Records by Truck */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Historial por Camión</h3>
        {trucks?.map(truck => {
          const truckRecords = maintenanceByTruck[truck.id] || [];
          const isMaintenanceDue = trucksNeedingMaintenance.some(t => t.id === truck.id);
          
          return (
            <Card key={truck.id} className={isMaintenanceDue ? "border-amber-200" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Truck className="h-5 w-5" />
                    <div>
                      <CardTitle className="text-lg">{truck.identifier}</CardTitle>
                      <CardDescription>
                        Conductor: {truck.driver} • {truck.totalKmDriven?.toLocaleString() || 0} km total
                      </CardDescription>
                    </div>
                  </div>
                  {isMaintenanceDue && (
                    <Badge variant="destructive">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Mantenimiento Requerido
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {truckRecords.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No hay registros de mantenimiento
                  </p>
                ) : (
                  <div className="space-y-3">
                    {truckRecords
                      .sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime())
                      .slice(0, 5)
                      .map(record => (
                        <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              <Badge className={getMaintenanceTypeColor(record.type)}>
                                {getMaintenanceTypeIcon(record.type)}
                                <span className="ml-1 capitalize">{record.type}</span>
                              </Badge>
                            </div>
                            <div>
                              <p className="font-medium">{record.description}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(new Date(record.performedAt), language)}
                                {record.mechanic && ` • Mecánico: ${record.mechanic}`}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(record.cost, language)}</p>
                            {record.nextMaintenanceKm && (
                              <p className="text-xs text-muted-foreground">
                                Próximo: {record.nextMaintenanceKm.toLocaleString()} km
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}