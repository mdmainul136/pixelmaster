<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Docker Nodes — AWS EC2 instances that run sGTM containers.
     * Each node hosts up to N containers for multi-tenant tracking.
     */
    public function up(): void
    {
        Schema::create('docker_nodes', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();                                              // "aws-node-01"
            $table->string('host');                                                          // IP or hostname
            $table->integer('ssh_port')->default(22);
            $table->integer('docker_api_port')->default(2376);
            $table->string('region')->default('us-east-1');
            $table->enum('status', ['active', 'draining', 'offline'])->default('active');
            $table->integer('max_containers')->default(50);
            $table->integer('current_containers')->default(0);
            $table->integer('port_range_start')->default(9000);
            $table->integer('port_range_end')->default(9999);
            $table->integer('cpu_cores')->nullable();
            $table->integer('memory_gb')->nullable();
            $table->json('metadata')->nullable();                                           // EC2 instance_id, AMI, etc.
            $table->float('cpu_usage_percent')->nullable();
            $table->float('memory_usage_percent')->nullable();
            $table->float('disk_usage_percent')->nullable();
            $table->timestamp('last_health_check')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('region');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('docker_nodes');
    }
};
