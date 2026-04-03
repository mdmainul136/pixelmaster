<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TenantMembership;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MembershipController extends Controller
{
    /**
     * Get all pending invitations for the authenticated user (by email).
     */
    public function pending(Request $request): JsonResponse
    {
        $user = $request->user();
        $invites = TenantMembership::on('central')
            ->where('email', $user->email)
            ->where('status', 'invite_pending')
            ->where(function($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->with('tenant:id,tenant_name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $invites
        ]);
    }

    /**
     * Verify an invitation token.
     */
    public function verify(string $token): JsonResponse
    {
        $invite = TenantMembership::on('central')
            ->where('invitation_token', $token)
            ->where('status', 'invite_pending')
            ->where(function($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->with('tenant:id,tenant_name')
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $invite
        ]);
    }

    /**
     * Accept an invitation.
     */
    public function accept(Request $request, string $token): JsonResponse
    {
        $user = $request->user();
        
        $invite = TenantMembership::on('central')
            ->where('invitation_token', $token)
            ->where('status', 'invite_pending')
            ->where(function($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->firstOrFail();

        // Security check: must match email
        if ($invite->email !== $user->email) {
            return response()->json(['success' => false, 'message' => 'This invitation was sent to a different email address.'], 403);
        }

        \DB::transaction(function() use ($invite, $user) {
            // Update Membership record
            $invite->update([
                'user_id' => $user->id,
                'status' => 'active',
                'invitation_token' => null, // Clear token
                'accepted_at' => now(),
            ]);

            // Now, we need to initialize tenancy and grant roles IN THE TENANT DB
            $tenant = $invite->tenant;
            tenancy()->initialize($tenant);
            
            // Assign role to user in Tenant's RBAC tables
            // Note: HasRoles trait works here because we initialized tenancy
            $user->syncRoles([$invite->role]);
        });

        return response()->json([
            'success' => true, 
            'message' => 'Invitation accepted. You now have access to the workspace.',
            'tenant_id' => $invite->tenant_id
        ]);
    }

    /**
     * Decline an invitation.
     */
    public function decline(Request $request, string $token): JsonResponse
    {
        $user = $request->user();
        
        $invite = TenantMembership::on('central')
            ->where('invitation_token', $token)
            ->where('status', 'invite_pending')
            ->firstOrFail();

        if ($invite->email !== $user->email) {
             return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        $invite->delete();

        return response()->json(['success' => true, 'message' => 'Invitation declined.']);
    }
}
