<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    

    public function up(): void
    {
        Schema::table('ec_tracking_containers', function (Blueprint $table) {
            $table->text('container_config')->nullable()->after('api_secret');
            // Base64-encoded GTM config string: aWQ9R1RNLTVROThGTFJK...
            // Decoded: id=GTM-XXXX&env=1&auth=YYYY
        });
    }

    public function down(): void
    {
        Schema::table('ec_tracking_containers', function (Blueprint $table) {
            $table->dropColumn('container_config');
        });
    }
};
