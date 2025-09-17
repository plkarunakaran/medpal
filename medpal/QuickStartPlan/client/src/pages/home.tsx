import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/navigation/header";
import BottomNav from "@/components/navigation/bottom-nav";
import MedicationCard from "@/components/medications/medication-card";
import AppointmentCard from "@/components/appointments/appointment-card";
import SOSCard from "@/components/emergency/sos-card";
import FamilySharing from "@/components/family/family-sharing";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  PillBottle, 
  Calendar, 
  TrendingUp, 
  Plus, 
  CalendarPlus, 
  Upload,
  Heart,
  Droplet,
  Weight,
  Check,
  X
} from "lucide-react";
import type { Medication, Appointment, HealthMetric, ReminderLog } from "@shared/schema";

export default function Home() {
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

  const { data: medications = [] } = useQuery<Medication[]>({
    queryKey: ["/api/medications"],
    retry: false,
    enabled: isAuthenticated,
  });

  const { data: appointments = [] } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
    retry: false,
    enabled: isAuthenticated,
  });

  const { data: healthMetrics = [] } = useQuery<HealthMetric[]>({
    queryKey: ["/api/health-metrics"],
    retry: false,
    enabled: isAuthenticated,
  });

  const { data: reminderLogs = [] } = useQuery<ReminderLog[]>({
    queryKey: ["/api/reminders"],
    retry: false,
    enabled: isAuthenticated,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <Heart className="w-5 h-5 text-primary-foreground animate-pulse" />
          </div>
          <p className="text-muted-foreground">Loading your health dashboard...</p>
        </div>
      </div>
    );
  }

  // Get today's medications
  const todaysMedications = medications.filter(med => med.isActive).slice(0, 3);
  
  // Get upcoming appointments
  const upcomingAppointments = appointments
    .filter(apt => new Date(apt.datetime) > new Date())
    .slice(0, 2);

  // Calculate adherence rate from reminder logs
  const totalReminders = reminderLogs.length;
  const takenReminders = reminderLogs.filter(log => log.status === 'taken').length;
  const adherenceRate = totalReminders > 0 ? Math.round((takenReminders / totalReminders) * 100) : 0;

  // Get last 7 days for adherence tracking
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  const adherenceByDay = last7Days.map(date => {
    const dayLogs = reminderLogs.filter(log => {
      const logDate = new Date(log.scheduledAt);
      return logDate.toDateString() === date.toDateString();
    });
    const dayTaken = dayLogs.filter(log => log.status === 'taken').length;
    const dayTotal = dayLogs.length;
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0),
      taken: dayTotal > 0 ? dayTaken === dayTotal : null,
    };
  });

  // Get recent health metrics
  const recentMetrics = {
    bloodPressure: healthMetrics.find(m => m.type === 'blood_pressure'),
    bloodSugar: healthMetrics.find(m => m.type === 'blood_sugar'),
    weight: healthMetrics.find(m => m.type === 'weight'),
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 max-w-7xl pb-20 lg:pb-6">
        {/* Dashboard Overview */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Good morning, {user?.firstName || 'there'}!
          </h2>
          <p className="text-muted-foreground">Here's your health overview for today</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Today's Medications */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
                    <PillBottle className="w-5 h-5 text-primary" />
                    <span>Today's Medications</span>
                  </h3>
                  <Button variant="ghost" size="sm" data-testid="button-view-all-medications">
                    View All
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {todaysMedications.length > 0 ? (
                    todaysMedications.map((medication) => (
                      <MedicationCard key={medication.id} medication={medication} />
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <PillBottle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No medications scheduled for today</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Appointments */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-secondary" />
                    <span>Upcoming Appointments</span>
                  </h3>
                  <Button variant="ghost" size="sm" data-testid="button-schedule-new">
                    Schedule New
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {upcomingAppointments.length > 0 ? (
                    upcomingAppointments.map((appointment) => (
                      <AppointmentCard key={appointment.id} appointment={appointment} />
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No upcoming appointments</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Medication Adherence */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-accent" />
                    <span>Medication Adherence</span>
                  </h3>
                  <select className="text-sm border border-border rounded-md px-2 py-1 bg-background">
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                  </select>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Overall Adherence</span>
                    <span className="text-lg font-bold text-accent">{adherenceRate}%</span>
                  </div>
                  
                  <Progress value={adherenceRate} className="w-full" />
                  
                  <div className="grid grid-cols-7 gap-2">
                    {adherenceByDay.map((day, index) => (
                      <div key={index} className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">{day.day}</div>
                        <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center ${
                          day.taken === true 
                            ? 'bg-accent text-accent-foreground' 
                            : day.taken === false 
                            ? 'bg-destructive/20 text-destructive' 
                            : 'bg-primary text-primary-foreground'
                        }`}>
                          {day.taken === true ? (
                            <Check className="w-3 h-3" />
                          ) : day.taken === false ? (
                            <X className="w-3 h-3" />
                          ) : (
                            <span className="text-xs font-bold">?</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Emergency SOS Card */}
            <SOSCard />

            {/* Family Sharing */}
            <FamilySharing />

            {/* Quick Actions */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
                
                <div className="space-y-3">
                  <Button 
                    className="w-full" 
                    data-testid="button-add-medication"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Medication
                  </Button>
                  
                  <Button 
                    variant="secondary" 
                    className="w-full"
                    data-testid="button-schedule-appointment"
                  >
                    <CalendarPlus className="w-4 h-4 mr-2" />
                    Schedule Appointment
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    data-testid="button-upload-report"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Health Metrics */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Recent Vitals</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-foreground">Blood Pressure</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {recentMetrics.bloodPressure 
                        ? `${(recentMetrics.bloodPressure.value as any)?.systolic || '--'}/${(recentMetrics.bloodPressure.value as any)?.diastolic || '--'}`
                        : '--/--'
                      }
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Droplet className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-foreground">Blood Sugar</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {recentMetrics.bloodSugar 
                        ? `${(recentMetrics.bloodSugar.value as any)?.value || '--'} mg/dL`
                        : '-- mg/dL'
                      }
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Weight className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-foreground">Weight</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {recentMetrics.weight 
                        ? `${(recentMetrics.weight.value as any)?.value || '--'} lbs`
                        : '-- lbs'
                      }
                    </span>
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  className="w-full mt-4 text-primary" 
                  size="sm"
                  data-testid="button-view-all-metrics"
                >
                  View All Metrics
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
