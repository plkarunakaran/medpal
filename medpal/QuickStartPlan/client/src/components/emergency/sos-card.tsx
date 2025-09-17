import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  Heart, 
  Phone, 
  MapPin,
  Loader2,
  Shield
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { EmergencyContact } from "@shared/schema";

export default function SOSCard() {
  const { toast } = useToast();
  const [showConfirmation, setShowConfirmation] = useState(false);

  const { data: emergencyContacts = [] } = useQuery<EmergencyContact[]>({
    queryKey: ["/api/emergency-contacts"],
    retry: false,
  });

  const sendSOSMutation = useMutation({
    mutationFn: async () => {
      // Get user's location if available
      let location = null;
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
              enableHighAccuracy: true,
            });
          });
          location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: new Date().toISOString(),
          };
        } catch (error) {
          console.log("Location not available:", error);
        }
      }

      const response = await apiRequest("POST", "/api/emergency/send-sos", { location });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Emergency Alert Sent",
        description: "Your emergency contacts have been notified with your medical summary and location.",
      });
      setShowConfirmation(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to Send Alert",
        description: "Unable to send emergency alert. Please call emergency services directly.",
        variant: "destructive",
      });
    },
  });

  const primaryContact = emergencyContacts.find(contact => contact.isPrimary);
  const hasEmergencyContacts = emergencyContacts.length > 0;

  const handleSendSOS = () => {
    sendSOSMutation.mutate();
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-destructive/10 rounded-full mx-auto flex items-center justify-center">
            <Heart className="w-8 h-8 text-destructive animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Emergency SOS</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Quick access to your medical summary
            </p>
          </div>
          
          <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
            <AlertDialogTrigger asChild>
              <Button 
                className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                disabled={!hasEmergencyContacts}
                data-testid="button-emergency-sos"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Send Emergency Alert
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center space-x-2 text-destructive">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Confirm Emergency Alert</span>
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will immediately send your medical summary, current medications, and location to your emergency contacts:
                  <div className="mt-3 space-y-2">
                    {emergencyContacts.map((contact) => (
                      <div key={contact.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                        <div>
                          <p className="font-medium text-sm">{contact.name}</p>
                          <p className="text-xs text-muted-foreground">{contact.relation}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs">{contact.phone}</p>
                          {contact.isPrimary && (
                            <Badge variant="default" className="text-xs">Primary</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-sm">
                    Only use this in a real emergency. Are you sure you want to proceed?
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel data-testid="button-cancel-sos">Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleSendSOS}
                  disabled={sendSOSMutation.isPending}
                  className="bg-destructive hover:bg-destructive/90"
                  data-testid="button-confirm-sos"
                >
                  {sendSOSMutation.isPending && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Send Emergency Alert
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          {hasEmergencyContacts ? (
            <div className="text-xs text-muted-foreground">
              <p className="flex items-center justify-center space-x-1">
                <Phone className="w-3 h-3" />
                <span>Emergency Contact:</span>
              </p>
              {primaryContact ? (
                <>
                  <p className="font-medium">{primaryContact.name} ({primaryContact.relation})</p>
                  <p>{primaryContact.phone}</p>
                </>
              ) : (
                <>
                  <p className="font-medium">{emergencyContacts[0].name}</p>
                  <p>{emergencyContacts[0].phone}</p>
                </>
              )}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground space-y-2">
              <div className="flex items-center justify-center space-x-1 text-amber-600">
                <Shield className="w-3 h-3" />
                <span>No emergency contacts</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs h-7"
                data-testid="button-add-emergency-contact"
              >
                Add Emergency Contact
              </Button>
            </div>
          )}
          
          <div className="text-xs text-muted-foreground">
            <div className="flex items-center justify-center space-x-1">
              <MapPin className="w-3 h-3" />
              <span>Location sharing enabled</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
