<?php

namespace App\Console\Commands;

use App\Models\Tenant;
use App\Models\TenantBackup;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\Process\Process;

class BackupTenants extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tenants:backup {--tenant= : Backup a specific tenant ID} {--disk=local : Storage disk to use} {--keep=7 : Number of days to retain backups}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Automated backup for all tenant databases with cloud support and metadata tracking';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $tenantId = $this->option('tenant');
        $disk = $this->option('disk');
        $keepDays = (int) $this->option('keep');

        $tenants = $tenantId 
            ? Tenant::where('id', $tenantId)->get() 
            : Tenant::where('status', 'active')->get();

        if ($tenants->isEmpty()) {
            $this->error("No active tenants found to backup.");
            return;
        }

        $this->info("Starting backup for " . $tenants->count() . " tenants on disk: {$disk}");

        foreach ($tenants as $tenant) {
            $this->backupTenant($tenant, $disk);
            $this->cleanupOldBackups($tenant, $keepDays);
        }

        $this->info("All backups completed.");
    }

    /**
     * Perform backup for a single tenant
     */
    protected function backupTenant(Tenant $tenant, string $disk)
    {
        $dbName = $tenant->database_name;
        $timestamp = now()->format('Y-m-d_H-i-s');
        $dir = "tenants/{$tenant->id}/backups";
        $fileName = "backup_{$timestamp}.sql";
        $localPath = storage_path("app/temp/{$tenant->id}_{$fileName}");

        // Ensure temp directory exists
        if (!file_exists(dirname($localPath))) {
            mkdir(dirname($localPath), 0755, true);
        }

        $this->line("Backing up tenant: {$tenant->id} (DB: {$dbName})...");

        // MySQL Dump Command
        $mysqldump = env('DB_MYSQLDUMP_PATH', 'mysqldump');
        $port = config('database.connections.mysql.port', '3306');
        $password = config('database.connections.mysql.password');
        
        $passwordPart = $password ? "--password=" . escapeshellarg($password) : "";

        $command = sprintf(
            '%s --user=%s %s --host=%s --port=%s %s > %s',
            $mysqldump,
            escapeshellarg(config('database.connections.mysql.username')),
            $passwordPart,
            escapeshellarg(config('database.connections.mysql.host')),
            escapeshellarg($port),
            escapeshellarg($dbName),
            escapeshellarg($localPath)
        );

        $process = Process::fromShellCommandline($command);
        $process->run();

        if ($process->isSuccessful()) {
            $fileSize = filesize($localPath);
            $cloudPath = "{$dir}/{$fileName}";

            try {
                // Upload to specified disk
                Storage::disk($disk)->put($cloudPath, fopen($localPath, 'r+'));

                // Log metadata
                TenantBackup::create([
                    'tenant_id' => $tenant->id,
                    'file_path' => $cloudPath,
                    'disk'      => $disk,
                    'file_size' => $fileSize,
                    'status'    => 'completed'
                ]);

                $this->info("Backup successful: {$cloudPath} ({$disk})");
                Log::info("Tenant Backup Successful: {$tenant->id} path: {$cloudPath}");

            } catch (\Exception $e) {
                $this->error("Upload failed for tenant {$tenant->id}: " . $e->getMessage());
                Log::error("Tenant Backup Upload Failed: {$tenant->id} - " . $e->getMessage());
            } finally {
                // Clean up local temp file
                if (file_exists($localPath)) {
                    unlink($localPath);
                }
            }
        } else {
            $this->error("Dump failed for tenant {$tenant->id}: " . $process->getErrorOutput());
            Log::error("Tenant Dump Failed: {$tenant->id} - " . $process->getErrorOutput());
            
            TenantBackup::create([
                'tenant_id' => $tenant->id,
                'file_path' => "failed_{$timestamp}.sql",
                'disk'      => $disk,
                'status'    => 'failed'
            ]);
        }
    }

    /**
     * Cleanup old backups based on retention policy
     */
    protected function cleanupOldBackups(Tenant $tenant, int $keepDays)
    {
        $this->line("Cleaning up backups older than {$keepDays} days for: {$tenant->id}");

        $oldBackups = TenantBackup::where('tenant_id', $tenant->id)
            ->where('created_at', '<', now()->subDays($keepDays))
            ->where('status', '!=', 'deleted')
            ->get();

        foreach ($oldBackups as $backup) {
            try {
                if (Storage::disk($backup->disk)->exists($backup->file_path)) {
                    Storage::disk($backup->disk)->delete($backup->file_path);
                }
                $backup->update(['status' => 'deleted']);
                $this->line("Deleted old backup: {$backup->file_path}");
            } catch (\Exception $e) {
                $this->error("Failed to delete old backup {$backup->file_path}: " . $e->getMessage());
            }
        }
    }
}
