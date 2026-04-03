<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Register the WhatsApp SaaS module in the central modules table
        /*
        DB::table('modules')->updateOrInsert(
            ['slug' => 'whatsapp-saas'],
            [
                'name' => 'WhatsApp SaaS Automation',
                'description' => 'Automated WhatsApp messaging for E-commerce, AI support bot, and ManyChat-like capabilities.',
                'version' => '1.0.0',
                'group' => 'Marketing',
                'is_active' => true,
                'price' => 49.00, 
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );
        */
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('modules')->where('slug', 'whatsapp-saas')->delete();
    }
};
