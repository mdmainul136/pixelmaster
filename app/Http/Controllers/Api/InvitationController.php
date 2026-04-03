<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SuperAdminInvitation;
use App\Models\PlatformRole;
use App\Models\SuperAdmin;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use App\Mail\AdminInviteMail;

class InvitationController extends Controller
{
    public function index()
    {
        return response()->json(SuperAdminInvitation::with(['role', 'team'])->whereNull('accepted_at')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|unique:super_admins,email|unique:super_admin_invitations,email',
            'role_id' => 'required|exists:platform_roles,id',
            'team_id' => 'nullable|exists:platform_teams,id',
        ]);

        $token = Str::random(40);
        
        $invitation = SuperAdminInvitation::create([
            'email' => $validated['email'],
            'token' => $token,
            'role_id' => $validated['role_id'],
            'team_id' => $validated['team_id'] ?? null,
            'expires_at' => now()->addDays(7),
        ]);

        // In a real app, send mail here
        // Mail::to($invitation->email)->send(new AdminInviteMail($invitation));

        return response()->json(['success' => true, 'invitation' => $invitation]);
    }

    public function destroy($id)
    {
        SuperAdminInvitation::destroy($id);
        return response()->json(['success' => true]);
    }

    public function verify($token)
    {
        $invitation = SuperAdminInvitation::where('token', $token)
            ->where('expires_at', '>', now())
            ->whereNull('accepted_at')
            ->firstOrFail();

        return response()->json(['success' => true, 'invitation' => $invitation->load(['role', 'team'])]);
    }

    public function accept(Request $request, $token)
    {
        $invitation = SuperAdminInvitation::where('token', $token)
            ->where('expires_at', '>', now())
            ->whereNull('accepted_at')
            ->firstOrFail();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'password' => 'required|min:8|confirmed',
        ]);

        $user = SuperAdmin::create([
            'name' => $validated['name'],
            'email' => $invitation->email,
            'password' => \Illuminate\Support\Facades\Hash::make($validated['password']),
            'team_id' => $invitation->team_id,
            'status' => 'active',
        ]);

        $user->roles()->attach($invitation->role_id);

        $invitation->update(['accepted_at' => now()]);

        return response()->json(['success' => true, 'message' => 'Account created successfully']);
    }
}
