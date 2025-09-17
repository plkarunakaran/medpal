import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, PillBottle, Calendar, BarChart3, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", label: "Home", icon: Home, testId: "nav-home" },
  { path: "/medications", label: "Medications", icon: PillBottle, testId: "nav-medications" },
  { path: "/appointments", label: "Appointments", icon: Calendar, testId: "nav-appointments" },
  { path: "/reports", label: "Reports", icon: BarChart3, testId: "nav-reports" },
  { path: "/profile", label: "Profile", icon: User, testId: "nav-profile" },
];

export default function BottomNav() {
  const [location, setLocation] = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          
          return (
            <Button
              key={item.path}
              variant="ghost"
              onClick={() => setLocation(item.path)}
              className={cn(
                "flex flex-col items-center space-y-1 py-2 px-4 text-muted-foreground hover:text-foreground",
                isActive && "text-primary"
              )}
              data-testid={item.testId}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
