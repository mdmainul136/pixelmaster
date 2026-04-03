<?php

namespace Database\Seeders\Tenant;

use App\Models\Finance\Account;
use Illuminate\Database\Seeder;

class AccountingSeeder extends Seeder
{
    public function run(): void
    {
        $accounts = [
            // Assets (1xxx)
            ['name' => 'Cash & Bank', 'code' => '1001', 'type' => 'asset', 'is_system' => true],
            ['name' => 'Inventory Asset', 'code' => '1002', 'type' => 'asset', 'is_system' => true],
            ['name' => 'Accounts Receivable', 'code' => '1003', 'type' => 'asset', 'is_system' => true],

            // Liabilities (2xxx)
            ['name' => 'Tax Payable (VAT/GST)', 'code' => '2001', 'type' => 'liability', 'is_system' => true],
            ['name' => 'Accounts Payable', 'code' => '2002', 'type' => 'liability', 'is_system' => true],

            // Equity (3xxx)
            ['name' => 'Owners Equity', 'code' => '3001', 'type' => 'equity', 'is_system' => true],
            ['name' => 'Retained Earnings', 'code' => '3002', 'type' => 'equity', 'is_system' => true],

            // Income (4xxx)
            ['name' => 'Sales Revenue', 'code' => '4001', 'type' => 'income', 'is_system' => true],
            ['name' => 'Service Revenue', 'code' => '4002', 'type' => 'income', 'is_system' => true],

            // Expenses (5xxx)
            ['name' => 'Cost of Goods Sold (COGS)', 'code' => '5001', 'type' => 'expense', 'is_system' => true],
            ['name' => 'Operating Expenses', 'code' => '5002', 'type' => 'expense', 'is_system' => true],
            ['name' => 'Salaries & Wages', 'code' => '5003', 'type' => 'expense', 'is_system' => true],
        ];

        foreach ($accounts as $account) {
            Account::firstOrCreate(['code' => $account['code']], $account);
        }
    }
}
