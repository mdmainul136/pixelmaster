<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Base model for tenant-specific tables.
 *
 * CONNECTION STRATEGY:
 * This model intentionally does NOT set $connection. It relies on
 * Stancl/Tenancy's DatabaseTenancyBootstrapper which swaps the
 * default 'mysql' connection to point at the tenant's database
 * (e.g. tenant_acme) when tenancy is initialized.
 *
 * For central/landlord models, use: protected $connection = 'central';
 * For tenant models (this base), leave $connection unset.
 */
abstract class TenantBaseModel extends Model
{
    use HasFactory;
}
