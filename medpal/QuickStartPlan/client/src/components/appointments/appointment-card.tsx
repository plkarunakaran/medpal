import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, isToday, isTomorrow, isPast } from "date-fns";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Edit, 
  Trash2,
  ExternalLink,
  FlaskConical
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Appointment } from "@shared/schema";

interface AppointmentCardProps {
  appointment: Appointment;
  showActions?: boolean;
  isPast?: boolean;
}

export default function AppointmentCard({ 
  appointment, 
  showActions = false, 
  isPast = false 
}: AppointmentCardProps) {
  const appointmentDate = new Date(appointment.datetime);
  
  const getDateDisplay = () => {
    if (isToday(appointmentDate)) return "Today";
    if (isTomorrow(appointmentDate)) return "Tomorrow";
    if (isPast) return format(appointmentDate, "MMM d, yyyy");
    return format(appointmentDate, "EEEE, MMM d");
  };

  const getTimeDisplay = () => {
    return format(appointmentDate, "h:mm a");
  };

  const getAppointmentIcon = () => {
    const type = appointment.type?.toLowerCase();
    switch (type) {
      case 'lab':
      case 'test':
        return <FlaskConical className="w-5 h-5 text-accent" />;
      default:
        return <User className="w-5 h-5 text-secondary" />;
    }
  };

  const getStatusBadge = () => {
    if (isPast) {
      return (
        <Badge variant={appointment.status === 'completed' ? 'default' : 'secondary'}>
          {appointment.status || 'completed'}
        </Badge>
      );
    }
    
    if (appointment.status === 'cancelled') {
      return <Badge variant="destructive">Cancelled</Badge>;
    }
    
    return null;
  };

  return (
    <div className="bg-muted/50 rounded-lg p-4 border border-border hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
            {getAppointmentIcon()}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-foreground">
                  {appointment.doctorName || 'Appointment'}
                </h4>
                {appointment.specialty && (
                  <p className="text-sm text-muted-foreground">
                    {appointment.specialty}
                    {appointment.type && appointment.type !== 'checkup' && 
                      ` • ${appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1)}`
                    }
                  </p>
                )}
                {appointment.clinic && (
                  <p className="text-sm text-muted-foreground mt-1 flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {appointment.clinic}
                  </p>
                )}
                {appointment.location && appointment.location !== appointment.clinic && (
                  <p className="text-xs text-muted-foreground">
                    {appointment.location}
                  </p>
                )}
              </div>
              <div className="text-right ml-4">
                <p className="text-sm font-medium text-foreground">{getDateDisplay()}</p>
                <p className="text-sm text-muted-foreground">{getTimeDisplay()}</p>
                {getStatusBadge()}
              </div>
            </div>
            
            {appointment.notes && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {appointment.notes}
              </p>
            )}
            
            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center space-x-2">
                {showActions && !isPast && (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      data-testid={`button-edit-appointment-${appointment.id}`}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      data-testid={`button-delete-appointment-${appointment.id}`}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Cancel
                    </Button>
                  </>
                )}
                
                {appointment.attachments && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    data-testid={`button-view-attachments-${appointment.id}`}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    View Reports
                  </Button>
                )}
              </div>
              
              {!isPast && (
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-primary hover:text-primary/80"
                    data-testid={`button-add-calendar-${appointment.id}`}
                  >
                    <Calendar className="w-3 h-3 mr-1" />
                    Add to Calendar
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
