import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  Plus, 
  Settings,
  UserCheck,
  Eye,
  Edit
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FamilyShare } from "@shared/schema";

export default function FamilySharing() {
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  const { data: familyShares = [] } = useQuery<FamilyShare[]>({
    queryKey: ["/api/family-shares"],
    retry: false,
  });

  // Mock family member data - in real app this would come from user data
  const getFamilyMemberInfo = (share: FamilyShare) => {
    // This would typically involve joining with user data
    const mockMembers = [
      {
        id: "1",
        name: "John Johnson",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
        relation: "Spouse",
      },
      {
        id: "2", 
        name: "Emily Johnson",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
        relation: "Daughter",
      },
    ];
    
    return mockMembers[Math.floor(Math.random() * mockMembers.length)];
  };

  const getRoleIcon = (role: string) => {
    return role === 'manager' ? <Edit className="w-3 h-3" /> : <Eye className="w-3 h-3" />;
  };

  const getRoleDescription = (role: string) => {
    return role === 'manager' ? 'Can view & edit' : 'Can view only';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'declined':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-primary" />
            <span>Family Access</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            data-testid="button-manage-family"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {familyShares.length > 0 ? (
          <div className="space-y-3">
            {familyShares.map((share) => {
              const memberInfo = getFamilyMemberInfo(share);
              return (
                <div key={share.id} className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={memberInfo.avatar} alt={memberInfo.name} />
                    <AvatarFallback>
                      {memberInfo.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-foreground">{memberInfo.name}</h4>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      {getRoleIcon(share.role)}
                      <span>{getRoleDescription(share.role)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <Badge variant={getStatusColor(share.status)}>
                      {share.status}
                    </Badge>
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No family members connected</p>
          </div>
        )}
        
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full mt-4 flex items-center justify-center space-x-2"
              data-testid="button-invite-family-member"
            >
              <Plus className="w-4 h-4" />
              <span>Invite Family Member</span>
            </Button>
          </DialogTrigger>
          <DialogContent data-testid="dialog-invite-family">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-primary" />
                <span>Invite Family Member</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="inviteEmail">Email Address</Label>
                <Input
                  id="inviteEmail"
                  type="email"
                  placeholder="family@example.com"
                  data-testid="input-invite-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inviteRole">Access Level</Label>
                <Select defaultValue="viewer">
                  <SelectTrigger data-testid="select-invite-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">
                      <div className="flex items-center space-x-2">
                        <Eye className="w-4 h-4" />
                        <div>
                          <p className="font-medium">Viewer</p>
                          <p className="text-xs text-muted-foreground">Can view health information only</p>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="manager">
                      <div className="flex items-center space-x-2">
                        <Edit className="w-4 h-4" />
                        <div>
                          <p className="font-medium">Manager</p>
                          <p className="text-xs text-muted-foreground">Can view and edit health information</p>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowInviteDialog(false)}
                  data-testid="button-cancel-invite"
                >
                  Cancel
                </Button>
                <Button data-testid="button-send-invite">
                  Send Invite
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
