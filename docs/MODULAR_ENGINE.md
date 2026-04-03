# Modular Engine Architecture Deep-Dive

## 1. Overview
The Zosair Modular Engine is a high-performance, dependency-aware capability resolution system. It allows the platform to provision granular modules (e.g., `ecommerce`, `crm`, `logistics`) based on tenant industry blueprints and subscription tiers.

## 2. Core Components

### 2.1 Capability Resolver (`ModuleService`)
The heart of the system. It handles:
- **Dependency Resolution**: Uses a Depth-First Search (DFS) with recursive path tracking to solve multi-level dependency chains (e.g., `marketing` requires `ecommerce` requires `crm`).
- **Circularity Protection**: Detects and blocks infinite loops in module relationships.
- **Automated Fulfillment**: Synchronizes the `tenant_modules` and `tenant_features` tables during tier upgrades or manual deactivations.

### 2.2 Gating Layers
Access is enforced at two distinct levels:
1.  **Module Layer (`module.access` middleware)**: Checks if the parent module is active for the tenant (402 Payment Required).
2.  **Feature Layer (`feature.enforce` middleware)**: Granular check against the `tenant_features` (Solving Capability Mesh) to determine if specific sub-features (e.g., `advanced_analytics`) are unlocked in the current tier.

### 2.3 Migration Manager (`ModuleMigrationManager`)
Automates tenant database changes:
- **Tenant Isolation**: Runs migrations specifically against the tenant's isolated database connection.
- **Selective Migration**: Executes only the migrations associated with the activated module.
- **Safe Rollback**: Instead of dropping tables on deactivation, it renames them to `_archived_{table}_{timestamp}` to ensure "Zero Tech Loss".

## 3. The Resolution Lifecycle

1.  **Request**: Tenant upgrades tier or requests a module.
2.  **blueprint Detection**: System identifies relevant modules from `business_blueprints.php`.
3.  **Dependency Solve**: `resolveDependencies` builds the full requirement chain.
4.  **Conflict Validation**: Ensures no existing active modules conflict with the new requirements.
5.  **Provisioning**:
    - `activateSingleModule` updates metadata.
    - `runModuleMigrations` updates tenant schema.
    - `FeatureFlagService` syncs granular flags.

## 4. Maintenance & Health
- **Blueprints**: Defined in `config/business_blueprints.php`.
- **Metadata**: Defined in each module's `module.json`.
- **Diagnostics**: Run `php artisan modules:health` to detect and repair status drift.
