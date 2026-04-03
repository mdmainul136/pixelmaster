<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\User;
use App\Models\TenantMembership;
use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TeamController extends Controller
{
    /**
     * List all team members and pending invitations for current tenant.
     */
    public function index(Request $request): JsonResponse
    {
        // Resolve tenant context (favors bound instances/helper, fallbacks to first tenant on localhost if IdentifyTenant ran)
        $tenant = (app()->bound('tenant') ? app('tenant') : null) ?: tenant() ?: $request->tenant;

        if (!$tenant) {
            return response()->json(['success' => false, 'message' => 'Workspace not found.'], 404);
        }

        // If we found the tenant via helper/request but it doesn't have memberships loaded, load them
        if (!$tenant->relationLoaded('memberships')) {
            $tenant->load(['memberships.user']);
        }

        $members = $tenant->memberships->map(function ($membership) {
            return [
                'id' => $membership->id,
                'user_id' => $membership->user_id,
                'name' => $membership->user ? $membership->user->name : null,
                'email' => $membership->user ? $membership->user->email : $membership->email,
                'role' => $membership->role,
                'status' => $membership->status,
                'invited_at' => $membership->invited_at,
                'accepted_at' => $membership->accepted_at,
                'is_owner' => $membership->role === 'owner',
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'workspace_owner_email' => $tenant->admin_email,
                'members' => $members,
                'tenant' => [
                    'id' => $tenant->id,
                    'tenant_name' => $tenant->tenant_name,
                    'admin_email' => $tenant->admin_email,
                    'domain' => $tenant->domain,
                ]
            ]
        ]);
    }

    /**
     * Invite a new member to the workspace.
     */
    public function invite(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'role' => 'required|string|in:admin,staff,editor,viewer',
        ]);

        $tenantId = $request->attributes->get('tenant_id');
        $email = strtolower($request->input('email'));

        // Check if already a member
        $existing = TenantMembership::on('central')
            ->where('tenant_id', $tenantId)
            ->where(function($q) use ($email) {
                $q->where('email', $email)
                  ->orWhereHas('user', fn($uq) => $uq->where('email', $email));
            })
            ->first();

        if ($existing) {
            return response()->json(['success' => false, 'message' => 'User is already a member or invited.'], 422);
        }

        // Create Invitation
        $membership = TenantMembership::on('central')->create([
            'tenant_id' => $tenantId,
            'email' => $email,
            'role' => $request->input('role'),
            'status' => 'invite_pending',
            'invitation_token' => Str::random(40),
            'invited_at' => now(),
            'expires_at' => now()->addDays(7),
        ]);

        // In a real app: send invitation email here
        // Mail::to($email)->send(new TenantInviteMail($membership));

        return response()->json([
            'success' => true, 
            'message' => 'Invitation sent successfully.',
            'data' => $membership
        ]);
    }

    /**
     * Remove a member or cancel an invitation.
     */
    public function removeMember(Request $request, int $id): JsonResponse
    {
        $tenantId = $request->attributes->get('tenant_id');
        $membership = TenantMembership::on('central')
            ->where('tenant_id', $tenantId)
            ->findOrFail($id);

        if ($membership->role === 'owner') {
            return response()->json(['success' => false, 'message' => 'The owner cannot be removed. Transfer ownership first.'], 403);
        }

        // Also remove their roles in the tenant database
        if ($membership->user_id) {
            $user = User::on('central')->find($membership->user_id);
            if ($user) {
                // Ensure we are in tenant context to delete tenant roles
                $user->roles()->detach();
            }
        }

        $membership->delete();

        return response()->json(['success' => true, 'message' => 'Member removed successfully.']);
    }

    /**
     * Transfer ownership of the workspace.
     * Can only be performed by the current owner.
     */
    public function transferOwnership(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $tenantId = $request->attributes->get('tenant_id');
        $tenant = Tenant::on('central')->find($tenantId);
        $currentUser = $request->user();

        // 1. Authorization check
        if ($tenant->admin_email !== $currentUser->email) {
            return response()->json(['success' => false, 'message' => 'Only the current owner can transfer ownership.'], 403);
        }

        $newOwner = User::on('central')->findOrFail($request->input('user_id'));

        // 2. Ensure new owner is already an active member of this tenant
        $membership = TenantMembership::on('central')
            ->where('tenant_id', $tenantId)
            ->where('user_id', $newOwner->id)
            ->where('status', 'active')
            ->first();

        if (!$membership) {
            return response()->json(['success' => false, 'message' => 'New owner must be an active member of the team first.'], 422);
        }

        DB::transaction(function() use ($tenant, $newOwner, $currentUser, $membership) {
            // Update Tenant admin data
            $tenant->update([
                'admin_email' => $newOwner->email,
                'admin_name' => $newOwner->name,
            ]);

            // Update memberships
            // Current owner becomes 'admin'
            TenantMembership::on('central')
                ->where('tenant_id', $tenant->id)
                ->where('user_id', $currentUser->id)
                ->update(['role' => 'admin']);

            // New owner becomes 'owner'
            $membership->update(['role' => 'owner']);

            // Sync roles in Tenant Database
            // New owner gets 'owner' role in tenant DB
            $newOwner->syncRoles(['owner']);
            // Old owner gets 'admin' role in tenant DB
            $currentUser->syncRoles(['admin']);
        });

        return response()->json(['success' => true, 'message' => "Ownership transferred to {$newOwner->name}."]);
    }
}
