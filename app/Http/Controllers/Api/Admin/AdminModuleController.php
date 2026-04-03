<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Module;
use Illuminate\Http\Request;

class AdminModuleController extends Controller
{
    /**
     * Get module dependency graph data.
     */
    public function graph()
    {
        $modules = Module::all();
        $nodes = [];
        $edges = [];

        foreach ($modules as $module) {
            // Node type selection (Pro > Growth > Starter)
            $type = 'starter';
            if ($module->is_marketplace) {
                if (in_array('pro', $module->plans ?? [])) $type = 'pro';
                elseif (in_array('growth', $module->plans ?? [])) $type = 'growth';
            }

            $nodes[] = [
                'id' => $module->slug,
                'label' => $module->name,
                'type' => $type,
                'group' => $module->group,
                'active' => $module->is_active,
            ];

            foreach ($module->depends_on ?? [] as $dependency) {
                $edges[] = [
                    'from' => $dependency,
                    'to' => $module->slug,
                ];
            }
        }

        return response()->json([
            'nodes' => $nodes,
            'edges' => $edges,
        ]);
    }
}
