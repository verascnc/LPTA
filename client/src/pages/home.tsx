import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Users, BarChart3, Settings, LogOut } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const quickActions = [
    {
      title: "Gestión de Flota",
      description: "Ver y administrar todos los vehículos",
      icon: <Truck className="h-8 w-8 text-blue-600" />,
      href: "/fleet",
    },
    {
      title: "Panel Analítico",
      description: "Métricas de rendimiento y análisis",
      icon: <BarChart3 className="h-8 w-8 text-green-600" />,
      href: "/analytics",
    },
    {
      title: "Gestión de Clientes",
      description: "Administrar información de clientes",
      icon: <Users className="h-8 w-8 text-purple-600" />,
      href: "/clients",
    },
    {
      title: "Configuración",
      description: "Configurar preferencias del sistema",
      icon: <Settings className="h-8 w-8 text-gray-600" />,
      href: "/settings",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Truck className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {t.common.appName}
                </h1>
                <p className="text-sm text-gray-600">
                  Bienvenido, {user?.firstName || user?.email}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
              {user?.profileImageUrl && (
                <img
                  src={user.profileImageUrl}
                  alt="Profile"
                  className="h-10 w-10 rounded-full object-cover"
                />
              )}
              <Button
                variant="outline"
                onClick={() => window.location.href = '/api/logout'}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>{t.auth.logout}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Panel de Control Principal
          </h2>
          <p className="text-lg text-gray-600">
            Accede a todas las herramientas de gestión logística desde aquí
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {quickActions.map((action, index) => (
            <Link key={index} href="/">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow border-0 shadow-md">
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    {action.icon}
                  </div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-center text-gray-600">
                    {action.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Dashboard Access */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">
                Tablero de Rutas Completo
              </h3>
              <p className="text-blue-100 mb-4">
                Accede al sistema completo de gestión de rutas con seguimiento en tiempo real
              </p>
              <Link href="/">
                <Button 
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100"
                >
                  Abrir Tablero Principal
                </Button>
              </Link>
            </div>
            <div className="hidden md:block">
              <Truck className="h-24 w-24 text-blue-200 opacity-50" />
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                Estado del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-900">Operacional</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                Conexión GPS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-900">Conectado</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                Base de Datos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-900">Sincronizada</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}