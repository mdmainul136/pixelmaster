<?php

namespace App\Exceptions;

use Exception;

class QuotaExceededException extends Exception
{
    protected $module;
    protected $usage;
    protected $limit;

    public function __construct(string $module, int $usage, int $limit)
    {
        $message = "Quota exceeded for {$module}. Usage: {$usage}, Limit: {$limit}. Please upgrade your plan.";
        parent::__construct($message, 402);

        $this->module = $module;
        $this->usage = $usage;
        $this->limit = $limit;
    }

    public function getQuotaData(): array
    {
        return [
            'module' => $this->module,
            'usage'  => $this->usage,
            'limit'  => $this->limit,
        ];
    }
}
