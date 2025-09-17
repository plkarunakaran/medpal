import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Medication } from "@shared/schema";

interface MedicationCardProps {
  medication: Medication;
  showDetails?: boolean;
}

export default function MedicationCard({ medication, showDetails = false }: MedicationCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const markTakenMutation = useMutation({
    mutationFn: async () => {
      // In a real app, this would create a reminder log entry
      // For now, we'll just show a success message
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Medication taken",
        description: `${medication.name} marked as taken`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to mark medication as taken",
        variant: "destructive",
      });
    },
  });

  // Generate pill visual based on color and shape
  const getPillStyles = () => {
    const baseClasses = "flex items-center justify-center shadow-sm";
    const sizeClasses = "w-12 h-12";
    
    // Color mapping
    const colorClasses = {
      blue: "bg-blue-500",
      red: "bg-red-500", 
      green: "bg-green-500",
      yellow: "bg-yellow-500",
      white: "bg-gray-100 border-2 border-gray-300",
      pink: "bg-pink-500",
      orange: "bg-orange-500",
      purple: "bg-purple-500",
    };

    // Shape mapping
    const shapeClasses = {
      circle: "rounded-full",
      oval: "rounded-full",
      rectangle: "rounded-sm",
      square: "rounded-md",
      capsule: "rounded-full",
    };

    const color = medication.color?.toLowerCase() as keyof typeof colorClasses || 'blue';
    const shape = medication.shape?.toLowerCase() as keyof typeof shapeClasses || 'circle';
    
    return cn(
      baseClasses,
      sizeClasses,
      colorClasses[color] || colorClasses.blue,
      shapeClasses[shape] || shapeClasses.circle
    );
  };

  const getPillContainer = () => {
    const color = medication.color?.toLowerCase() || 'blue';
    const containerColors = {
      blue: "bg-blue-100 border-blue-300",
      red: "bg-red-100 border-red-300",
      green: "bg-green-100 border-green-300",
      yellow: "bg-yellow-100 border-yellow-300",
      white: "bg-gray-50 border-gray-200",
      pink: "bg-pink-100 border-pink-300",
      orange: "bg-orange-100 border-orange-300",
      purple: "bg-purple-100 border-purple-300",
    };

    return cn(
      "w-12 h-12 rounded-full border-2 flex items-center justify-center",
      containerColors[color as keyof typeof containerColors] || containerColors.blue
    );
  };

  // Mock next dose time - in real app this would come from schedule
  const getNextDoseTime = () => {
    // This is a simplified mock - real implementation would parse the schedule JSON
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(now.getHours() + 1, 0, 0, 0);
    return nextHour;
  };

  const nextDose = getNextDoseTime();
  const timeUntilNext = Math.ceil((nextDose.getTime() - Date.now()) / (1000 * 60 * 60));

  return (
    <div className="bg-muted/50 rounded-lg p-4 border border-border hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Visual Pill Card */}
          <div className="flex items-center space-x-2">
            <div className={getPillContainer()}>
              <div className={getPillStyles()}>
                {medication.form === 'capsule' ? (
                  <div className="w-6 h-8 bg-current rounded-full"></div>
                ) : medication.shape === 'rectangle' || medication.shape === 'square' ? (
                  <div className="w-8 h-5 bg-current rounded-sm"></div>
                ) : (
                  <div className="w-8 h-8 bg-current rounded-full"></div>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-foreground">{medication.name}</h4>
              <p className="text-sm text-muted-foreground">
                {medication.dosage}
                {medication.color && ` • ${medication.color.charAt(0).toUpperCase() + medication.color.slice(1)}`}
                {medication.shape && ` ${medication.shape.charAt(0).toUpperCase() + medication.shape.slice(1)}`}
                {medication.form && ` ${medication.form.charAt(0).toUpperCase() + medication.form.slice(1)}`}
              </p>
              {medication.brand && (
                <p className="text-xs text-muted-foreground">Brand: {medication.brand}</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {!showDetails && (
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">
                {nextDose.toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit',
                  hour12: true 
                })}
              </p>
              <p className="text-xs text-accent">
                {timeUntilNext > 0 ? `Due in ${timeUntilNext} hour${timeUntilNext > 1 ? 's' : ''}` : 'Due now'}
              </p>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            {!showDetails && (
              <Button
                size="sm"
                onClick={() => markTakenMutation.mutate()}
                disabled={markTakenMutation.isPending}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
                data-testid={`button-take-${medication.id}`}
              >
                {markTakenMutation.isPending ? "Taking..." : "Take Now"}
              </Button>
            )}
            
            {showDetails && (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  data-testid={`button-edit-${medication.id}`}
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  data-testid={`button-delete-${medication.id}`}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {showDetails && medication.notes && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-sm text-muted-foreground">{medication.notes}</p>
        </div>
      )}
      
      {showDetails && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>Next dose at {nextDose.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
            </div>
            <Badge variant={medication.isActive ? "default" : "secondary"}>
              {medication.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
}
