import React, { useState } from "react";
import { Head, usePage } from "@inertiajs/react";
import DashboardLayout from "@Tenant/components/layout/DashboardLayout";
import { Button } from "@Tenant/components/ui/button";
import { Input } from "@Tenant/components/ui/input";
import { Badge } from "@Tenant/components/ui/badge";
import { 
  Users, UserPlus, Mail, Shield, Trash2, 
  ChevronRight, ArrowRightLeft, Loader2, Check, X,
  Clock, ShieldCheck, ShieldAlert
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

export default function TeamManagement() {
  const { auth, tenant: sharedTenant } = usePage<any>().props;
  const queryClient = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("admin");

  // 1. Fetch team members
  const { data: teamData, isLoading } = useQuery({
    queryKey: ["team-members"],
    queryFn: async () => {
      const { data } = await axios.get("/api/v1/admin/team");
      return data.data;
    }
  });

  const activeTenant = teamData?.tenant || sharedTenant;

  // Mutations (unchanged logic)
  const inviteMutation = useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await axios.post("/api/v1/admin/team/invite", payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Invitation sent successfully");
      setInviteEmail("");
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to send invitation");
    }
  });

  const removeMutation = useMutation({
    mutationFn: async (id: number) => {
      const { data } = await axios.delete(`/api/v1/admin/team/members/${id}`);
      return data;
    },
    onSuccess: () => {
      toast.success("Member removed");
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
    }
  });

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    inviteMutation.mutate({ email: inviteEmail, role: inviteRole });
  };

  const isOwner = auth.user.email === activeTenant?.admin_email;

  return (
    <DashboardLayout>
      <Head title="Permissions — PixelMaster" />
      
      <div className="max-w-4xl mx-auto py-10 space-y-10">
        {/* Page Title */}
        <div className="border-b border-border pb-6">
           <h1 className="text-xl font-semibold text-foreground">Permissions & Users</h1>
           <p className="text-sm text-muted-foreground mt-1">Manage who has access to your workspace and what they can do.</p>
        </div>

        {/* Section 1: Members List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="md:col-span-1">
              <h3 className="text-sm font-semibold text-foreground">Workspace members</h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                 Invite your team to help manage tracking, view analytics, and organize destinations.
              </p>
           </div>
           
           <div className="md:col-span-2">
              <div className="bg-white dark:bg-card border border-border shadow-sm rounded-lg overflow-hidden">
                 {isLoading ? (
                    <div className="p-12 text-center flex flex-col items-center">
                       <Loader2 className="h-6 w-6 text-primary animate-spin mb-2" />
                       <span className="text-xs text-muted-foreground font-medium">Syncing team...</span>
                    </div>
                 ) : (
                    <div className="divide-y divide-border">
                       {/* Owner Row */}
                       <div className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-bold text-xs text-muted-foreground">
                                {activeTenant?.admin_name ? activeTenant.admin_name.charAt(0).toUpperCase() : 'W'}
                             </div>
                             <div>
                                <p className="text-sm font-semibold text-foreground leading-tight">{activeTenant?.admin_name || 'Owner'}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{activeTenant?.admin_email}</p>
                             </div>
                          </div>
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[10px] font-bold uppercase tracking-wider">Owner</Badge>
                       </div>

                       {/* Other Members */}
                       {teamData?.members?.map((member: any) => (
                          <div key={member.id} className="p-4 flex items-center justify-between group">
                             <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-bold text-xs text-muted-foreground">
                                   {member.name ? member.name.charAt(0).toUpperCase() : <Mail className="h-3 w-3" />}
                                </div>
                                <div>
                                   <div className="flex items-center gap-2">
                                      <p className="text-sm font-semibold text-foreground leading-tight">{member.name || 'Member'}</p>
                                      {member.status === 'invite_pending' && (
                                         <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider border border-blue-100">Invited</span>
                                      )}
                                   </div>
                                   <p className="text-xs text-muted-foreground mt-0.5">{member.email}</p>
                                </div>
                             </div>
                             <div className="flex items-center gap-4">
                                <span className="text-xs font-semibold text-muted-foreground capitalize">{member.role}</span>
                                {isOwner && (
                                   <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="text-muted-foreground hover:text-red-600 h-8 font-bold px-3 transition-opacity md:opacity-0 group-hover:opacity-100"
                                      onClick={() => {
                                         if (confirm('Are you sure you want to remove this member?')) {
                                            removeMutation.mutate(member.id);
                                         }
                                      }}
                                   >
                                      Remove
                                   </Button>
                                )}
                             </div>
                          </div>
                       ))}

                       {teamData?.members?.length === 0 && (
                          <div className="p-8 text-center">
                             <p className="text-xs text-muted-foreground">This workspace is currently private.</p>
                          </div>
                       )}
                    </div>
                 )}
              </div>
           </div>
        </div>

        {/* Section 2: Invitations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-border">
           <div className="md:col-span-1">
              <h3 className="text-sm font-semibold text-foreground">Invite a staff member</h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                 Enter an email address to invite someone to this workspace. They will receive an email to activate their account.
              </p>
           </div>
           
           <div className="md:col-span-2">
              <form onSubmit={handleInvite} className="bg-white dark:bg-card border border-border shadow-sm rounded-lg p-5 space-y-5">
                 <div className="space-y-4">
                    <div className="space-y-1.5">
                       <label className="text-xs font-bold text-foreground">Email</label>
                       <Input 
                          type="email" 
                          placeholder="staff@example.com" 
                          value={inviteEmail}
                          onChange={e => setInviteEmail(e.target.value)}
                          className="h-10 text-sm border-border rounded-md shadow-sm"
                          disabled={inviteMutation.isPending}
                       />
                    </div>
                    
                    <div className="space-y-1.5">
                       <label className="text-xs font-bold text-foreground">Role</label>
                       <div className="flex flex-wrap gap-2">
                          {['admin', 'staff', 'viewer'].map(role => (
                             <button
                                key={role}
                                type="button"
                                onClick={() => setInviteRole(role)}
                                className={`px-4 py-2 rounded-md border text-xs font-bold capitalize transition-colors ${
                                   inviteRole === role 
                                      ? 'bg-foreground text-background border-foreground shadow-sm' 
                                      : 'bg-white dark:bg-card border-border text-muted-foreground hover:bg-muted'
                                }`}
                             >
                                {role}
                             </button>
                          ))}
                       </div>
                    </div>
                 </div>

                 <div className="flex justify-end pt-2">
                    <Button 
                       type="submit" 
                       disabled={inviteMutation.isPending || !inviteEmail}
                       className="h-9 px-6 bg-primary hover:bg-primary/90 text-white font-bold text-xs ring-offset-background transition-all active:scale-[0.98]"
                    >
                       {inviteMutation.isPending && <Loader2 className="h-3 w-3 animate-spin mr-2" />}
                       Send invite
                    </Button>
                 </div>
              </form>
           </div>
        </div>

        {/* Section 3: Policy / Security (Optional but feels like Shopify) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-border">
           <div className="md:col-span-1">
              <h3 className="text-sm font-semibold text-foreground">About permissions</h3>
           </div>
           
           <div className="md:col-span-2">
              <div className="bg-muted/30 border border-border rounded-lg p-5 space-y-4">
                 <div className="flex gap-4">
                    <ShieldCheck className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div className="space-y-1">
                       <p className="text-xs font-bold text-foreground">Sensitive actions</p>
                       <p className="text-xs text-muted-foreground leading-relaxed italic">
                          Staff members can see all data but cannot delete the workspace or modify billing unless granted Administrator permissions.
                       </p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}


