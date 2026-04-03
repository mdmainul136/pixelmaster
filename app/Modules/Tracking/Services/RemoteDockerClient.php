<?php

namespace App\Modules\Tracking\Services;

use App\Models\Tracking\DockerNode;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Process;

/**
 * Remote Docker Client — executes Docker commands on remote AWS EC2 nodes via SSH.
 *
 * Supports three modes:
 *   - 'self_hosted' → runs Docker on the same server (dev/small scale)
 *   - 'remote_ssh'  → SSH into AWS EC2 nodes (production)
 *   - 'remote_api' → Docker Remote API over TCP 2376 (advanced)
 *
 * Usage:
 *   $client = app(RemoteDockerClient::class);
 *   $result = $client->execute($node, 'docker ps');
 *   // ['success' => true, 'output' => '...', 'exitCode' => 0]
 */
class RemoteDockerClient
{
    /**
     * Execute any Docker command on a remote node.
     *
     * @return array{success: bool, output: string, exitCode: int}
     */
    public function execute(DockerNode $node, string $command): array
    {
        $mode = config('tracking.docker.mode', 'local');

        if ($mode === 'local') {
            return $this->executeLocal($command);
        }

        if ($mode === 'remote_api') {
            return $this->executeViaApi($node, $command);
        }

        // Default: remote_ssh
        return $this->executeViaSsh($node, $command);
    }

    /**
     * Run a Docker container on a remote node.
     */
    public function runContainer(DockerNode $node, string $dockerRunCommand): array
    {
        Log::info("[RemoteDocker] Running container on {$node->name}: {$dockerRunCommand}");
        return $this->execute($node, $dockerRunCommand);
    }

    /**
     * Stop and remove a container on a remote node.
     */
    public function stopContainer(DockerNode $node, string $containerName): array
    {
        Log::info("[RemoteDocker] Stopping container {$containerName} on {$node->name}");

        $stopResult = $this->execute($node, "docker stop {$containerName}");
        $rmResult   = $this->execute($node, "docker rm -f {$containerName}");

        return [
            'success'  => $stopResult['success'] && $rmResult['success'],
            'output'   => $stopResult['output'] . "\n" . $rmResult['output'],
            'exitCode' => $rmResult['exitCode'],
        ];
    }

    /**
     * Docker inspect on a remote node.
     *
     * @return array|null JSON-decoded inspect data, or null on failure
     */
    public function inspectContainer(DockerNode $node, string $containerName): ?array
    {
        $result = $this->execute($node, "docker inspect {$containerName}");

        if (!$result['success']) {
            return null;
        }

        $data = json_decode($result['output'], true);

        return is_array($data) ? ($data[0] ?? null) : null;
    }

    /**
     * List running containers on a remote node.
     *
     * @return array{success: bool, output: string, exitCode: int}
     */
    public function listContainers(DockerNode $node): array
    {
        return $this->execute($node, 'docker ps --format "{{.ID}}\t{{.Names}}\t{{.Ports}}\t{{.Status}}"');
    }

    /**
     * Pull a Docker image on a remote node.
     */
    public function pullImage(DockerNode $node, string $image): array
    {
        Log::info("[RemoteDocker] Pulling image {$image} on {$node->name}");
        return $this->execute($node, "docker pull {$image}");
    }

    /**
     * Get system metrics from a remote node (CPU, memory, disk usage).
     *
     * @return array{cpu_percent: float, memory_percent: float, disk_percent: float}
     */
    public function getNodeMetrics(DockerNode $node): array
    {
        $mode = config('tracking.docker.mode', 'self_hosted');

        // Build the metrics command
        $metricsCmd = "echo CPU:$(top -bn1 | grep 'Cpu(s)' | awk '{print $2}') && "
                    . "echo MEM:$(free | grep Mem | awk '{printf \"%.1f\", $3/$2 * 100}') && "
                    . "echo DISK:$(df / | tail -1 | awk '{print $5}' | tr -d '%')";

        $result = ($mode === 'self_hosted')
            ? $this->executeLocal($metricsCmd)
            : $this->executeRawSsh($node, $metricsCmd);

        if (!$result['success']) {
            Log::warning("[RemoteDocker] Failed to get metrics from {$node->name}");
            return ['cpu_percent' => 0, 'memory_percent' => 0, 'disk_percent' => 0];
        }

        // Parse output: CPU:12.5\nMEM:67.8\nDISK:45
        $metrics = ['cpu_percent' => 0, 'memory_percent' => 0, 'disk_percent' => 0];
        foreach (explode("\n", $result['output']) as $line) {
            if (str_starts_with($line, 'CPU:'))  $metrics['cpu_percent']    = (float) substr($line, 4);
            if (str_starts_with($line, 'MEM:'))  $metrics['memory_percent'] = (float) substr($line, 4);
            if (str_starts_with($line, 'DISK:')) $metrics['disk_percent']   = (float) substr($line, 5);
        }

        return $metrics;
    }

    /**
     * Write a file to a remote node (e.g. NGINX config).
     */
    public function writeFile(DockerNode $node, string $remotePath, string $content): array
    {
        $mode = config('tracking.docker.mode', 'self_hosted');

        if ($mode === 'self_hosted') {
            $result = file_put_contents($remotePath, $content);
            return [
                'success'  => $result !== false,
                'output'   => $result !== false ? "Written {$result} bytes" : "Failed to write",
                'exitCode' => $result !== false ? 0 : 1,
            ];
        }

        // For SSH: pipe content via heredoc
        $escapedContent = str_replace("'", "'\\''", $content);
        $cmd = "cat > {$remotePath} << 'NGINX_EOF'\n{$content}\nNGINX_EOF";

        return $this->executeRawSsh($node, $cmd);
    }

    /**
     * Delete a file on a remote node.
     */
    public function deleteFile(DockerNode $node, string $remotePath): array
    {
        $mode = config('tracking.docker.mode', 'self_hosted');

        if ($mode === 'self_hosted') {
            $result = @unlink($remotePath);
            return ['success' => $result, 'output' => '', 'exitCode' => $result ? 0 : 1];
        }

        return $this->executeRawSsh($node, "rm -f {$remotePath}");
    }

    /**
     * Execute an arbitrary command on a remote node (not Docker-specific).
     * Useful for: nginx reload, systemctl, etc.
     */
    public function executeCommand(DockerNode $node, string $command): array
    {
        $mode = config('tracking.docker.mode', 'self_hosted');

        if ($mode === 'self_hosted') {
            return $this->executeLocal($command);
        }

        return $this->executeRawSsh($node, $command);
    }

    /**
     * Check if a remote node is reachable via SSH.
     */
    public function ping(DockerNode $node): bool
    {
        $result = $this->executeRawSsh($node, 'echo OK');
        return $result['success'] && str_contains($result['output'], 'OK');
    }

    /**
     * Get Docker info from a remote node (verify Docker is running).
     */
    public function getDockerInfo(DockerNode $node): ?array
    {
        $result = $this->execute($node, 'docker info --format "{{json .}}"');

        if (!$result['success']) {
            return null;
        }

        return json_decode($result['output'], true);
    }

    /**
     * Count running containers on a node.
     */
    public function countContainers(DockerNode $node): int
    {
        $result = $this->execute($node, 'docker ps -q | wc -l');

        if (!$result['success']) {
            return 0;
        }

        return (int) trim($result['output']);
    }

    // ── Private Helpers ─────────────────────────────────────────

    /**
     * Execute Docker command via SSH on a remote node.
     */
    private function executeViaSsh(DockerNode $node, string $command): array
    {
        $sshCmd = $this->buildSshCommand($node, $command);

        Log::debug("[RemoteDocker] SSH → {$node->host}: {$command}");

        $result = Process::timeout(60)->run($sshCmd);

        return [
            'success'  => $result->successful(),
            'output'   => trim($result->output()),
            'exitCode' => $result->exitCode(),
        ];
    }

    /**
     * Execute a raw (non-Docker) command via SSH.
     */
    private function executeRawSsh(DockerNode $node, string $command): array
    {
        $keyPath = config('tracking.docker.ssh_key_path');
        $user    = config('tracking.docker.ssh_user');

        $sshCmd = sprintf(
            'ssh -i %s -p %d -o StrictHostKeyChecking=no -o ConnectTimeout=10 -o BatchMode=yes %s@%s %s',
            escapeshellarg($keyPath),
            $node->ssh_port,
            escapeshellarg($user),
            escapeshellarg($node->host),
            escapeshellarg($command)
        );

        $result = Process::timeout(60)->run($sshCmd);

        return [
            'success'  => $result->successful(),
            'output'   => trim($result->output()),
            'exitCode' => $result->exitCode(),
        ];
    }

    /**
     * Execute via Docker Remote API (TCP 2376).
     * Sets DOCKER_HOST env var so the local docker CLI talks to the remote daemon.
     */
    private function executeViaApi(DockerNode $node, string $command): array
    {
        $dockerHost = "tcp://{$node->host}:{$node->docker_api_port}";

        Log::debug("[RemoteDocker] API → {$dockerHost}: {$command}");

        $result = Process::timeout(60)
            ->env(['DOCKER_HOST' => $dockerHost])
            ->run($command);

        return [
            'success'  => $result->successful(),
            'output'   => trim($result->output()),
            'exitCode' => $result->exitCode(),
        ];
    }

    /**
     * Execute command locally (local mode / fallback).
     */
    private function executeLocal(string $command): array
    {
        $result = Process::timeout(60)->run($command);

        return [
            'success'  => $result->successful(),
            'output'   => trim($result->output()),
            'exitCode' => $result->exitCode(),
        ];
    }

    /**
     * Build the SSH command string for Docker operations.
     */
    private function buildSshCommand(DockerNode $node, string $dockerCommand): string
    {
        $keyPath = config('tracking.docker.ssh_key_path');
        $user    = config('tracking.docker.ssh_user');

        return sprintf(
            'ssh -i %s -p %d -o StrictHostKeyChecking=no -o ConnectTimeout=10 -o BatchMode=yes %s@%s %s',
            escapeshellarg($keyPath),
            $node->ssh_port,
            escapeshellarg($user),
            escapeshellarg($node->host),
            escapeshellarg($dockerCommand)
        );
    }
}
