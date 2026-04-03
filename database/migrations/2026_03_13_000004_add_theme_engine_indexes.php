<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('themes', function (Blueprint $table) {
            $table->index('slug', 'th_slug_idx');
            $table->index(['status', 'created_at'], 'th_stat_cr_idx');
        });

        Schema::table('tenant_themes', function (Blueprint $table) {
            $table->index(['tenant_id', 'is_active'], 'tth_tn_act_idx');
        });

        Schema::table('marketplace_themes', function (Blueprint $table) {
            $table->index(['status', 'downloads'], 'mth_st_dl_idx');
            $table->index(['status', 'created_at'], 'mth_st_cr_idx');
        });
        
        Schema::table('page_layouts', function (Blueprint $table) {
            $table->index(['tenant_id', 'slug'], 'pl_tn_sl_idx');
        });
    }

    public function down(): void
    {
        Schema::table('themes', function (Blueprint $table) {
            $table->dropIndex('th_slug_idx');
            $table->dropIndex('th_stat_cr_idx');
        });

        Schema::table('tenant_themes', function (Blueprint $table) {
            $table->dropIndex('tth_tn_act_idx');
        });

        Schema::table('marketplace_themes', function (Blueprint $table) {
            $table->dropIndex('mth_st_dl_idx');
            $table->dropIndex('mth_st_cr_idx');
        });
        
        Schema::table('page_layouts', function (Blueprint $table) {
            $table->dropIndex('pl_tn_sl_idx');
        });
    }
};
