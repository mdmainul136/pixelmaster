<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Table: tenant_memberships
     * Connection: Central (mysql)
     * Purpose: Map Global Users to specific Tenants (Account Sharing)
     */
    public function up(): void
    {
        Schema::create('tenant_memberships', function (Blueprint $table) {
            $table->id();
            
            // The tenant identified in central database
            $table->string('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            
            // The global user identified in central database
            $table->unsignedBigInteger('user_id')->nullable();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            
            // Email (useful for invitations before email is registered/associated)
            $table->string('email')->nullable();
            
            // User's role in this tenant (e.g., 'owner', 'admin', 'staff')
            $table->string('role')->default('staff');
            
            // Invitation details
            $table->string('status')->default('invite_pending'); // active, invite_pending, suspended
            $table->string('invitation_token')->nullable()->unique();
            $table->timestamp('invited_at')->nullable();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('expires_at')->nullable();

            $table->timestamps();

            // Compound index for unique membership
            $table->unique(['tenant_id', 'user_id']);
            $table->index(['tenant_id', 'email']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenant_memberships');
    }
};
