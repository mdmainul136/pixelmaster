<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Display a listing of users with pagination, search, and filters.
     */
    public function index(Request $request)
    {
        try {
            $tenant = $request->get('tenant'); // Injected by IdentifyTenant middleware
            
            // Since tenancy is initialized, Branch model on mysql connection already points to tenant DB
            // However, some tenants (like IOR only) might not have branches table
            $tenantBranchIds = [];
            if (\Illuminate\Support\Facades\Schema::hasTable('branches')) {
                $tenantBranchIds = \App\Models\Branch::pluck('id')->all();
            }
            
            // Query users belonging to these branches OR matches the tenant admin email
            $query = User::on('central')
                ->where(function($q) use ($tenantBranchIds, $tenant) {
                    $q->whereIn('branch_id', $tenantBranchIds);
                    if ($tenant && $tenant->admin_email) {
                        $q->orWhere('email', $tenant->admin_email);
                    }
                });

            // Search by name or email
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'LIKE', "%{$search}%")
                      ->orWhere('email', 'LIKE', "%{$search}%");
                });
            }

            // Filter by branch_id (specifically requested subset)
            if ($request->has('branch_id') && $request->branch_id) {
                $query->where('branch_id', $request->branch_id);
            }

            // Filter by role (RBAC roles)
            if ($request->has('role') && $request->role) {
                $role = $request->role;
                $query->whereHas('roles', function($q) use ($role) {
                    $q->where('name', $role);
                });
            }

            // Filter by status
            if ($request->has('status') && $request->status) {
                $query->where('status', $request->status);
            }

            // Pagination
            $perPage = $request->get('per_page', 10);
            $users = $query->with(['roles', 'branch'])->orderBy('created_at', 'desc')->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => [
                    'users' => $users->items(),
                    'pagination' => [
                        'current_page' => $users->currentPage(),
                        'total_pages' => $users->lastPage(),
                        'total' => $users->total(),
                        'per_page' => $users->perPage(),
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching users',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created user.
     */
    public function store(Request $request)
    {
        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email|max:255',
            'password' => 'required|string|min:8',
            'role' => 'required|string', // This will be used for RBAC sync
            'status' => 'required|in:active,inactive',
            'branch_id' => 'nullable',
        ];

        // Only add exists rule if table exists
        if (\Illuminate\Support\Facades\Schema::hasTable('branches')) {
            $rules['branch_id'] .= '|exists:branches,id';
        }

        $validator = Validator::make($request->all(), $rules, [
            'name.required' => 'Name is required',
            'email.unique' => 'This email is already registered',
            'password.min' => 'Password must be at least 8 characters long',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $user = User::on('central')->create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $request->role, // Fallback to column
                'status' => $request->status,
                'branch_id' => $request->branch_id,
            ]);

            // Assign RBAC role
            if ($request->has('role')) {
                $user->syncRoles([$request->role]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'User created successfully',
                'data' => $user->load('roles')
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error creating user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified user.
     */
    public function show($id)
    {
        try {
            $user = User::on('central')->with(['roles', 'branch'])->findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => $user
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, $id)
    {
        try {
            $user = User::on('central')->findOrFail($id);

            $rules = [
                'name' => 'required|string|max:255',
                'email' => ['required', 'email', 'max:255', Rule::unique('users')->ignore($id)],
                'password' => 'nullable|string|min:8',
                'role' => 'nullable|string',
                'status' => 'nullable|in:active,inactive',
                'branch_id' => 'nullable',
            ];

            // Only add exists rule if table exists
            if (\Illuminate\Support\Facades\Schema::hasTable('branches')) {
                $rules['branch_id'] .= '|exists:branches,id';
            }

            $validator = Validator::make($request->all(), $rules);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            if ($request->has('name')) $user->name = $request->name;
            if ($request->has('email')) $user->email = $request->email;
            if ($request->has('role')) $user->role = $request->role;
            if ($request->has('status')) $user->status = $request->status;
            if ($request->has('branch_id')) $user->branch_id = $request->branch_id;

            if ($request->filled('password')) {
                $user->password = Hash::make($request->password);
            }

            $user->save();

            // Sync RBAC roles if provided
            if ($request->has('role')) {
                $user->syncRoles([$request->role]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'User updated successfully',
                'data' => $user->load('roles')
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error updating user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified user.
     */
    public function destroy($id)
    {
        try {
            $user = User::on('central')->findOrFail($id);
            
            // Prevent deleting yourself
            if ($user->id === auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'You cannot delete your own account'
                ], 403);
            }

            $user->delete();

            return response()->json([
                'success' => true,
                'message' => 'User deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get metadata for user management (roles, branches)
     */
    public function meta(Request $request)
    {
        try {
            $branches = [];
            // Since tenancy is initialized, Branch model on mysql connection already points to tenant DB
            if (\Illuminate\Support\Facades\Schema::hasTable('branches')) {
                $branches = \App\Models\Branch::get(['id', 'name']);
            }
            
            // Role names for selection - could come from Role table but these are defaults
            $roles = ['admin', 'manager', 'staff', 'user', 'fulfillment', 'editor', 'viewer'];
            
            return response()->json([
                'success' => true,
                'data' => [
                    'branches' => $branches,
                    'roles' => $roles
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get all containers (tenants) owned by the specified central user.
     */
    public function containers(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
            }

            $containers = \App\Models\Tenant::where('admin_email', $user->email)->get()->map(function($c) {
                return [
                    'id' => $c->id,
                    'name' => $c->tenant_name ?? $c->id,
                    'domain' => $c->domain,
                    'status' => $c->status,
                    'plan' => $c->plan,
                    'created_at' => $c->created_at,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $containers
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching containers',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }
}
