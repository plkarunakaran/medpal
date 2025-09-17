import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Heart, AlertTriangle, ChevronDown, User, LogOut } from "lucide-react";

export default function Header() {
  const { user } = useAuth();

  const handleEmergencySOS = () => {
    // This would trigger the emergency SOS flow
    // In a real app, this would get location and send alerts
    alert('Emergency alert would be sent to emergency contacts with medical summary and location');
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">MedPal</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Emergency SOS Button */}
            <Button 
              variant="destructive"
              onClick={handleEmergencySOS}
              className="flex items-center space-x-2"
              data-testid="button-emergency-sos"
            >
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden sm:inline">Emergency SOS</span>
            </Button>
            
            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2" data-testid="button-user-menu">
                  <img 
                    src={user?.profileImageUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"} 
                    alt="User profile" 
                    className="w-8 h-8 rounded-full border-2 border-border object-cover"
                  />
                  <span className="hidden sm:inline text-sm font-medium">
                    {user?.firstName || 'User'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem 
                  onClick={() => window.location.href = '/profile'}
                  data-testid="menu-profile"
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile & Settings
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-destructive"
                  data-testid="menu-logout"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
