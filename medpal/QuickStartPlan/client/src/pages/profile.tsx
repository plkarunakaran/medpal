import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/navigation/header";
import BottomNav from "@/components/navigation/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Phone, 
  Users, 
  Settings, 
  LogOut,
  Edit,
  Shield,
  Download
} from "lucide-react";
import type { EmergencyContact, FamilyShare } from "@shared/schema";

export default function Profile() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

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

  const { data: emergencyContacts = [] } = useQuery<EmergencyContact[]>({
    queryKey: ["/api/emergency-contacts"],
    retry: false,
    enabled: isAuthenticated,
  });

  const { data: familyShares = [] } = useQuery<FamilyShare[]>({
    queryKey: ["/api/family-shares"],
    retry: false,
    enabled: isAuthenticated,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <User className="w-8 h-8 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const primaryContact = emergencyContacts.find(contact => contact.isPrimary);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 max-w-4xl pb-20 lg:pb-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center space-x-2">
              <User className="w-6 h-6 text-primary" />
              <span>Profile & Settings</span>
            </h1>
            <p className="text-muted-foreground">Manage your account and health information</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setIsEditing(!isEditing)}
            data-testid="button-edit-profile"
          >
            <Edit className="w-4 h-4 mr-2" />
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Personal Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4 mb-4">
                  <img 
                    src={user?.profileImageUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"} 
                    alt="Profile" 
                    className="w-16 h-16 rounded-full border-2 border-border object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {user?.firstName} {user?.lastName}
                    </h3>
                    <p className="text-muted-foreground">{user?.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      defaultValue={user?.firstName || ''} 
                      disabled={!isEditing}
                      data-testid="input-first-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      defaultValue={user?.lastName || ''} 
                      disabled={!isEditing}
                      data-testid="input-last-name"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      defaultValue={user?.email || ''} 
                      disabled={!isEditing}
                      data-testid="input-email"
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex space-x-2 pt-4">
                    <Button data-testid="button-save-profile">
                      Save Changes
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsEditing(false)}
                      data-testid="button-cancel-edit"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Emergency Contacts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Emergency Contacts</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {emergencyContacts.length > 0 ? (
                  <div className="space-y-3">
                    {emergencyContacts.map((contact) => (
                      <div key={contact.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div>
                          <h4 className="font-medium text-foreground">{contact.name}</h4>
                          <p className="text-sm text-muted-foreground">{contact.relation}</p>
                          <p className="text-sm text-muted-foreground">{contact.phone}</p>
                        </div>
                        {contact.isPrimary && (
                          <Badge variant="default">Primary</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No emergency contacts added</p>
                    <Button variant="outline" className="mt-2" data-testid="button-add-emergency-contact">
                      Add Emergency Contact
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Family Sharing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Family Access</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {familyShares.length > 0 ? (
                  <div className="space-y-3">
                    {familyShares.map((share) => (
                      <div key={share.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div>
                          <h4 className="font-medium text-foreground">Family Member</h4>
                          <p className="text-sm text-muted-foreground capitalize">{share.role}</p>
                        </div>
                        <Badge variant={share.status === 'accepted' ? 'default' : 'secondary'}>
                          {share.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No family members connected</p>
                    <Button variant="outline" className="mt-2" data-testid="button-invite-family">
                      Invite Family Member
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Settings Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  data-testid="button-export-data"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Health Data
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  data-testid="button-privacy-settings"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Privacy Settings
                </Button>
                
                <Separator />
                
                <Button 
                  variant="destructive" 
                  className="w-full justify-start"
                  onClick={handleLogout}
                  data-testid="button-logout"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Member since</span>
                  <span className="font-medium">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last updated</span>
                  <span className="font-medium">
                    {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
                  </span>
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
