import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/navigation/header";
import BottomNav from "@/components/navigation/bottom-nav";
import MedicationCard from "@/components/medications/medication-card";
import AddMedicationDialog from "@/components/medications/add-medication-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, PillBottle } from "lucide-react";
import type { Medication } from "@shared/schema";

export default function Medications() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
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

  const { data: medications = [], isLoading: medicationsLoading } = useQuery<Medication[]>({
    queryKey: ["/api/medications"],
    retry: false,
    enabled: isAuthenticated,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <PillBottle className="w-8 h-8 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading medications...</p>
        </div>
      </div>
    );
  }

  // Filter medications based on search term
  const filteredMedications = medications.filter(med => 
    med.isActive && (
      med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.dosage.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 max-w-4xl pb-20 lg:pb-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center space-x-2">
              <PillBottle className="w-6 h-6 text-primary" />
              <span>Medications</span>
            </h1>
            <p className="text-muted-foreground">Manage your medications and schedules</p>
          </div>
          <Button 
            onClick={() => setShowAddDialog(true)}
            data-testid="button-add-medication"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Medication
          </Button>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search medications by name, brand, or dosage..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-medications"
              />
            </div>
          </CardContent>
        </Card>

        {/* Medications List */}
        <div className="space-y-4">
          {medicationsLoading ? (
            <div className="text-center py-8">
              <PillBottle className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
              <p className="text-muted-foreground">Loading your medications...</p>
            </div>
          ) : filteredMedications.length > 0 ? (
            filteredMedications.map((medication) => (
              <MedicationCard 
                key={medication.id} 
                medication={medication}
                showDetails={true}
              />
            ))
          ) : searchTerm ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No medications found</h3>
                <p className="text-muted-foreground mb-4">
                  No medications match your search term "{searchTerm}"
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setSearchTerm("")}
                  data-testid="button-clear-search"
                >
                  Clear Search
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <PillBottle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No medications yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start by adding your first medication to track schedules and adherence
                </p>
                <Button 
                  onClick={() => setShowAddDialog(true)}
                  data-testid="button-add-first-medication"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Medication
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <BottomNav />
      
      <AddMedicationDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog}
      />
    </div>
  );
}
