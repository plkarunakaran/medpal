import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/navigation/header";
import BottomNav from "@/components/navigation/bottom-nav";
import AppointmentCard from "@/components/appointments/appointment-card";
import AddAppointmentDialog from "@/components/appointments/add-appointment-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Plus, Calendar } from "lucide-react";
import type { Appointment } from "@shared/schema";

export default function Appointments() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [showAddDialog, setShowAddDialog] = useState(false);

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

  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
    retry: false,
    enabled: isAuthenticated,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Calendar className="w-8 h-8 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading appointments...</p>
        </div>
      </div>
    );
  }

  const now = new Date();
  
  const upcomingAppointments = appointments
    .filter(apt => new Date(apt.datetime) > now)
    .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
    
  const pastAppointments = appointments
    .filter(apt => new Date(apt.datetime) <= now)
    .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 max-w-4xl pb-20 lg:pb-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center space-x-2">
              <Calendar className="w-6 h-6 text-secondary" />
              <span>Appointments</span>
            </h1>
            <p className="text-muted-foreground">Manage your doctor visits and medical appointments</p>
          </div>
          <Button 
            onClick={() => setShowAddDialog(true)}
            variant="default"
            data-testid="button-schedule-appointment"
          >
            <Plus className="w-4 h-4 mr-2" />
            Schedule Appointment
          </Button>
        </div>

        {/* Appointments Tabs */}
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming" data-testid="tab-upcoming">
              Upcoming ({upcomingAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="past" data-testid="tab-past">
              Past ({pastAppointments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {appointmentsLoading ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
                <p className="text-muted-foreground">Loading your appointments...</p>
              </div>
            ) : upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((appointment) => (
                <AppointmentCard 
                  key={appointment.id} 
                  appointment={appointment}
                  showActions={true}
                />
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No upcoming appointments</h3>
                  <p className="text-muted-foreground mb-4">
                    Schedule your next doctor visit or medical appointment
                  </p>
                  <Button 
                    onClick={() => setShowAddDialog(true)}
                    data-testid="button-schedule-first"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule Your First Appointment
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {appointmentsLoading ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
                <p className="text-muted-foreground">Loading your appointments...</p>
              </div>
            ) : pastAppointments.length > 0 ? (
              pastAppointments.map((appointment) => (
                <AppointmentCard 
                  key={appointment.id} 
                  appointment={appointment}
                  showActions={false}
                  isPast={true}
                />
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No past appointments</h3>
                  <p className="text-muted-foreground">
                    Your appointment history will appear here
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
      
      <AddAppointmentDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog}
      />
    </div>
  );
}
