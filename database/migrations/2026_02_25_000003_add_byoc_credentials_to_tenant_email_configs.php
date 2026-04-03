<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tenant_email_configs', function (Blueprint $table) {
            // BYOC: Tenant's own AWS SES credentials (encrypted at rest)
            $table->text('aws_access_key_id')->nullable()->after('ses_identity_arn');
            $table->text('aws_secret_access_key')->nullable()->after('aws_access_key_id');
            $table->string('aws_region', 30)->nullable()->after('aws_secret_access_key');
            $table->boolean('uses_own_ses')->default(false)->after('aws_region');
            $table->boolean('ses_credentials_valid')->default(false)->after('uses_own_ses');
            $table->timestamp('ses_credentials_verified_at')->nullable()->after('ses_credentials_valid');
        });
    }

    public function down(): void
    {
        Schema::table('tenant_email_configs', function (Blueprint $table) {
            $table->dropColumn([
                'aws_access_key_id',
                'aws_secret_access_key',
                'aws_region',
                'uses_own_ses',
                'ses_credentials_valid',
                'ses_credentials_verified_at',
            ]);
        });
    }
};
