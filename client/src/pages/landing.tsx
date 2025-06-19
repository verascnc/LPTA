import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, MapPin, BarChart3, Clock, Shield, Globe } from "lucide-react";

export default function Landing() {
  const { t } = useTranslation();

  const features = [
    {
      icon: <Truck className="h-8 w-8 text-blue-600" />,
      title: t.landing.features.fleet.title,
      description: t.landing.features.fleet.description,
    },
    {
      icon: <MapPin className="h-8 w-8 text-green-600" />,
      title: t.landing.features.tracking.title,
      description: t.landing.features.tracking.description,
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-purple-600" />,
      title: t.landing.features.analytics.title,
      description: t.landing.features.analytics.description,
    },
    {
      icon: <Clock className="h-8 w-8 text-orange-600" />,
      title: t.landing.features.optimization.title,
      description: t.landing.features.optimization.description,
    },
    {
      icon: <Shield className="h-8 w-8 text-red-600" />,
      title: t.landing.features.maintenance.title,
      description: t.landing.features.maintenance.description,
    },
    {
      icon: <Globe className="h-8 w-8 text-indigo-600" />,
      title: t.landing.features.multilingual.title,
      description: t.landing.features.multilingual.description,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <Truck className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                {t.common.appName}
              </h1>
            </div>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {t.auth.login}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            {t.landing.hero.title}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            {t.landing.hero.subtitle}
          </p>
          <Button 
            onClick={() => window.location.href = '/api/login'}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3"
          >
            {t.landing.hero.cta}
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t.landing.features.title}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t.landing.features.subtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t.landing.stats.title}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { number: "500+", label: t.landing.stats.deliveries },
              { number: "98%", label: t.landing.stats.accuracy },
              { number: "25%", label: t.landing.stats.efficiency },
              { number: "24/7", label: t.landing.stats.support },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Truck className="h-6 w-6 text-blue-400" />
              <span className="text-xl font-bold">{t.common.appName}</span>
            </div>
            <p className="text-gray-400">
              {t.landing.footer.description}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}