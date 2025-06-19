import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import Map from "@/components/map";
import DeliveryPanel from "@/components/delivery-panel";
import LanguageSwitcher from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { Bell, Clock, User, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTranslation, formatTime } from "@/lib/i18n";

interface DashboardStats {
  activeRoutes: number;
  totalTrucks: number;
  activeTrucks: number;
  completedToday: number;
  pendingDeliveries: number;
  totalDistance: number;
  estimatedTime: number;
}

export default function Dashboard() {
  const { t, language } = useTranslation();
  const [selectedTruck, setSelectedTruck] = useState<number | null>(1);
  const [currentTime, setCurrentTime] = useState(new Date());

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const formatCurrentTime = (date: Date) => {
    return formatTime(date, language) + " AST"; // Atlantic Standard Time for Dominican Republic
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <Sidebar 
          selectedTruck={selectedTruck} 
          onTruckSelect={setSelectedTruck}
          stats={stats}
        />
      </div>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-40">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-80">
          <Sidebar 
            selectedTruck={selectedTruck} 
            onTruckSelect={setSelectedTruck}
            stats={stats}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="lg:hidden w-8" /> {/* Spacer for mobile menu button */}
            <div>
              <h2 className="text-xl font-bold text-gray-900">{t.routeDashboard}</h2>
              <p className="text-sm text-gray-500">{t.manageOptimizeRoutes}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <div className="hidden md:flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {formatCurrentTime(currentTime)}
              </span>
            </div>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700">
                Juan Pérez
              </span>
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Map Section */}
          <div className="flex-1 flex flex-col">
            <Map selectedTruck={selectedTruck} />
          </div>

          {/* Right Panel - Delivery Details */}
          <div className="hidden xl:block">
            <DeliveryPanel selectedTruck={selectedTruck} />
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-30">
        <div className="flex items-center justify-around">
          <Button variant="ghost" className="flex flex-col items-center p-2 text-primary">
            <div className="w-6 h-6 flex items-center justify-center mb-1">📊</div>
            <span className="text-xs">{t.dashboard}</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center p-2 text-gray-600">
            <div className="w-6 h-6 flex items-center justify-center mb-1">🗺️</div>
            <span className="text-xs">{t.routes}</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center p-2 text-gray-600">
            <div className="w-6 h-6 flex items-center justify-center mb-1">🚛</div>
            <span className="text-xs">{t.fleet}</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center p-2 text-gray-600">
            <div className="w-6 h-6 flex items-center justify-center mb-1">📈</div>
            <span className="text-xs">{t.reports}</span>
          </Button>
        </div>
      </nav>
    </div>
  );
}
