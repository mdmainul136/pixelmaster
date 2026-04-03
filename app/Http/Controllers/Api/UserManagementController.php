<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SuperAdmin;
use App\Models\PlatformRole;
use App\Models\PlatformTeam;
use App\Models\PlatformDepartment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserManagementController extends Controller
{
    public function index()
    {
        $users = SuperAdmin::with(['roles', 'team', 'department'])->get();
        return response()->json($users);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:super_admins,email',
            'password' => 'required|min:8',
            'role_id' => 'required|exists:platform_roles,id',
            'team_id' => 'nullable|exists:platform_teams,id',
            'department_id' => 'nullable|exists:platform_departments,id',
        ]);

        $user = SuperAdmin::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'team_id' => $validated['team_id'],
            'department_id' => $validated['department_id'],
            'status' => 'active',
        ]);

        $user->roles()->attach($validated['role_id']);

        return response()->json(['success' => true, 'user' => $user->load('roles')]);
    }

    public function update(Request $request, $id)
    {
        $user = SuperAdmin::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'string|max:255',
            'email' => ['email', Rule::unique('super_admins')->ignore($user->id)],
            'role_id' => 'exists:platform_roles,id',
            'team_id' => 'nullable|exists:platform_teams,id',
            'department_id' => 'nullable|exists:platform_departments,id',
            'status' => 'in:active,suspended,pending',
        ]);

        $user->update($validated);

        if ($request->has('role_id')) {
            $user->roles()->sync([$request->role_id]);
        }

        return response()->json(['success' => true, 'user' => $user->load('roles')]);
    }

    public function destroy($id)
    {
        if (auth()->id() == $id) {
            return response()->json(['success' => false, 'message' => 'Cannot delete yourself'], 403);
        }
        
        SuperAdmin::destroy($id);
        return response()->json(['success' => true]);
    }

    public function getMeta()
    {
        return response()->json([
            'roles' => PlatformRole::all(),
            'teams' => PlatformTeam::all(),
            'departments' => PlatformDepartment::all(),
        ]);
    }
}
