import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/navigation/header";
import BottomNav from "@/components/navigation/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Download,
  Calendar,
  PillBottle,
  Heart,
  Target
} from "lucide-react";
import type { ReminderLog, HealthMetric } from "@shared/schema";

export default function Reports() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: reminderLogs = [] } = useQuery<ReminderLog[]>({
    queryKey: ["/api/reminders"],
    retry: false,
    enabled: isAuthenticated,
  });

  const { data: healthMetrics = [] } = useQuery<HealthMetric[]>({
    queryKey: ["/api/health-metrics"],
    retry: false,
    enabled: isAuthenticated,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-8 h-8 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading reports...</p>
        </div>
      </div>
    );
  }

  // Calculate adherence statistics
  const totalReminders = reminderLogs.length;
  const takenReminders = reminderLogs.filter(log => log.status === 'taken').length;
  const missedReminders = reminderLogs.filter(log => log.status === 'missed').length;
  const adherenceRate = totalReminders > 0 ? Math.round((takenReminders / totalReminders) * 100) : 0;

  // Calculate weekly adherence
  const last4Weeks = Array.from({ length: 4 }, (_, i) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - ((i + 1) * 7));
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - (i * 7));
    
    const weekLogs = reminderLogs.filter(log => {
      const logDate = new Date(log.scheduledAt);
      return logDate >= startDate && logDate < endDate;
    });
    
    const weekTaken = weekLogs.filter(log => log.status === 'taken').length;
    const weekTotal = weekLogs.length;
    const weekRate = weekTotal > 0 ? Math.round((weekTaken / weekTotal) * 100) : 0;
    
    return {
      week: `Week ${4 - i}`,
      rate: weekRate,
      taken: weekTaken,
      total: weekTotal,
    };
  }).reverse();

  // Health metrics summary
  const recentBloodPressure = healthMetrics.find(m => m.type === 'blood_pressure');
  const recentBloodSugar = healthMetrics.find(m => m.type === 'blood_sugar');
  const recentWeight = healthMetrics.find(m => m.type === 'weight');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 max-w-6xl pb-20 lg:pb-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center space-x-2">
              <BarChart3 className="w-6 h-6 text-primary" />
              <span>Health Reports</span>
            </h1>
            <p className="text-muted-foreground">Your health insights and medication adherence</p>
          </div>
          <Button variant="outline" data-testid="button-export-report">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Overview Cards */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Overall Adherence</p>
                    <p className="text-2xl font-bold text-foreground">{adherenceRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <PillBottle className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Doses Taken</p>
                    <p className="text-2xl font-bold text-foreground">{takenReminders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Doses Missed</p>
                    <p className="text-2xl font-bold text-foreground">{missedReminders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Adherence Trends */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Weekly Adherence Trends</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {last4Weeks.map((week, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{week.week}</span>
                        <span className="text-muted-foreground">
                          {week.taken}/{week.total} doses ({week.rate}%)
                        </span>
                      </div>
                      <Progress value={week.rate} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Health Metrics */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="w-5 h-5" />
                  <span>Health Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Blood Pressure</span>
                    <Badge variant={recentBloodPressure ? "default" : "secondary"}>
                      {recentBloodPressure 
                        ? `${(recentBloodPressure.value as any)?.systolic || '--'}/${(recentBloodPressure.value as any)?.diastolic || '--'}`
                        : 'No data'
                      }
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Blood Sugar</span>
                    <Badge variant={recentBloodSugar ? "default" : "secondary"}>
                      {recentBloodSugar 
                        ? `${(recentBloodSugar.value as any)?.value || '--'} mg/dL`
                        : 'No data'
                      }
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Weight</span>
                    <Badge variant={recentWeight ? "default" : "secondary"}>
                      {recentWeight 
                        ? `${(recentWeight.value as any)?.value || '--'} lbs`
                        : 'No data'
                      }
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Quick Stats</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Best streak</span>
                    <span className="font-medium">7 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current streak</span>
                    <span className="font-medium">3 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">This month</span>
                    <span className="font-medium">{adherenceRate}% adherence</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
