<?php

use Illuminate\Support\Str;

return [

    /*
    |--------------------------------------------------------------------------
    | Default Database Connection Name
    |--------------------------------------------------------------------------
    |
    | Here you may specify which of the database connections below you wish
    | to use as your default connection for database operations. This is
    | the connection which will be utilized unless another connection
    | is explicitly specified when you execute a query / statement.
    |
    */

    'default' => env('DB_CONNECTION', 'mysql'),

    /*
    |--------------------------------------------------------------------------
    | Database Connections
    |--------------------------------------------------------------------------
    |
    | Below are all of the database connections defined for your application.
    | An example configuration is provided for each database system which
    | is supported by Laravel. You're free to add / remove connections.
    |
    */

    'connections' => [

        'sqlite' => [
            'driver' => 'sqlite',
            'url' => env('DB_URL'),
            'database' => env('DB_DATABASE', database_path('database.sqlite')),
            'prefix' => '',
            'foreign_key_constraints' => env('DB_FOREIGN_KEYS', true),
            'busy_timeout' => null,
            'journal_mode' => null,
            'synchronous' => null,
            'transaction_mode' => 'DEFERRED',
        ],

        'mysql' => [
            'driver' => 'mysql',
            'url' => env('DB_URL'),
            'host' => env('DB_HOST', '127.0.0.1'),
            'port' => env('DB_PORT', '3306'),
            'database' => env('DB_DATABASE', 'laravel'),
            'username' => env('DB_USERNAME', 'root'),
            'password' => env('DB_PASSWORD', ''),
            'unix_socket' => env('DB_SOCKET', ''),
            'charset' => env('DB_CHARSET', 'utf8mb4'),
            'collation' => env('DB_COLLATION', 'utf8mb4_unicode_ci'),
            'prefix' => '',
            'prefix_indexes' => true,
            'strict' => true,
            'engine' => null,
            'options' => extension_loaded('pdo_mysql') ? array_filter([
                (PHP_VERSION_ID >= 80500 ? \Pdo\Mysql::ATTR_SSL_CA : \PDO::MYSQL_ATTR_SSL_CA) => env('MYSQL_ATTR_SSL_CA'),
            ]) : [],
        ],

        /**
         * Central connection for landlord data.
         * Explicitly separate from 'mysql' which acts as a template for tenants.
         */
        'central' => [
            'driver' => 'mysql',
            'url' => env('DB_URL'),
            'host' => env('DB_HOST', '127.0.0.1'),
            'port' => env('DB_PORT', '3306'),
            'database' => env('DB_DATABASE', 'laravel'),
            'username' => env('DB_USERNAME', 'root'),
            'password' => env('DB_PASSWORD', ''),
            'unix_socket' => env('DB_SOCKET', ''),
            'charset' => env('DB_CHARSET', 'utf8mb4'),
            'collation' => env('DB_COLLATION', 'utf8mb4_unicode_ci'),
            'prefix' => '',
            'prefix_indexes' => true,
            'strict' => true,
            'engine' => null,
            'options' => extension_loaded('pdo_mysql') ? array_filter([
                (PHP_VERSION_ID >= 80500 ? \Pdo\Mysql::ATTR_SSL_CA : \PDO::MYSQL_ATTR_SSL_CA) => env('MYSQL_ATTR_SSL_CA'),
            ]) : [],
        ],

        /**
         * Dynamic tenant connection — overwritten at runtime by DatabaseManager.
         * Must exist as placeholder for Laravel's connection resolver.
         */
        'tenant_dynamic' => [
            'driver' => 'mysql',
            'host' => env('DB_HOST', '127.0.0.1'),
            'port' => env('DB_PORT', '3306'),
            'database' => env('DB_DATABASE', 'laravel'),
            'username' => env('DB_USERNAME', 'root'),
            'password' => env('DB_PASSWORD', ''),
            'charset' => env('DB_CHARSET', 'utf8mb4'),
            'collation' => env('DB_COLLATION', 'utf8mb4_unicode_ci'),
            'prefix' => '',
            'strict' => true,
            'engine' => null,
        ],

        // ─────────────────────────────────────────────────────────────
        // Regional Template Connections for Multi-Region Tenancy
        // ─────────────────────────────────────────────────────────────
        // Stancl/tenancy uses these as templates. Each tenant's
        // `tenancy_db_connection` attribute references one of these,
        // and stancl clones the config + swaps the `database` name.
        //
        // Set env vars per region in .env or deployment config:
        //   TENANT_US_HOST, TENANT_EU_HOST, TENANT_SG_HOST, TENANT_BD_HOST
        // ─────────────────────────────────────────────────────────────

        'tenant_us_east' => [
            'driver' => 'mysql',
            'host' => env('TENANT_US_HOST', env('DB_HOST', '127.0.0.1')),
            'port' => env('TENANT_US_PORT', '3306'),
            'database' => null, // Stancl fills this dynamically
            'username' => env('TENANT_US_USERNAME', env('DB_USERNAME', 'root')),
            'password' => env('TENANT_US_PASSWORD', env('DB_PASSWORD', '')),
            'charset' => 'utf8mb4',
            'collation' => 'utf8mb4_unicode_ci',
            'prefix' => '',
            'strict' => true,
            'engine' => null,
        ],

        'tenant_eu_west' => [
            'driver' => 'mysql',
            'host' => env('TENANT_EU_HOST', env('DB_HOST', '127.0.0.1')),
            'port' => env('TENANT_EU_PORT', '3306'),
            'database' => null,
            'username' => env('TENANT_EU_USERNAME', env('DB_USERNAME', 'root')),
            'password' => env('TENANT_EU_PASSWORD', env('DB_PASSWORD', '')),
            'charset' => 'utf8mb4',
            'collation' => 'utf8mb4_unicode_ci',
            'prefix' => '',
            'strict' => true,
            'engine' => null,
        ],

        'tenant_ap_south' => [
            'driver' => 'mysql',
            'host' => env('TENANT_SG_HOST', env('DB_HOST', '127.0.0.1')),
            'port' => env('TENANT_SG_PORT', '3306'),
            'database' => null,
            'username' => env('TENANT_SG_USERNAME', env('DB_USERNAME', 'root')),
            'password' => env('TENANT_SG_PASSWORD', env('DB_PASSWORD', '')),
            'charset' => 'utf8mb4',
            'collation' => 'utf8mb4_unicode_ci',
            'prefix' => '',
            'strict' => true,
            'engine' => null,
        ],

        'tenant_bd_dhaka' => [
            'driver' => 'mysql',
            'host' => env('TENANT_BD_HOST', env('DB_HOST', '127.0.0.1')),
            'port' => env('TENANT_BD_PORT', '3306'),
            'database' => null,
            'username' => env('TENANT_BD_USERNAME', env('DB_USERNAME', 'root')),
            'password' => env('TENANT_BD_PASSWORD', env('DB_PASSWORD', '')),
            'charset' => 'utf8mb4',
            'collation' => 'utf8mb4_unicode_ci',
            'prefix' => '',
            'strict' => true,
            'engine' => null,
        ],

        'mariadb' => [
            'driver' => 'mariadb',
            'url' => env('DB_URL'),
            'host' => env('DB_HOST', '127.0.0.1'),
            'port' => env('DB_PORT', '3306'),
            'database' => env('DB_DATABASE', 'laravel'),
            'username' => env('DB_USERNAME', 'root'),
            'password' => env('DB_PASSWORD', ''),
            'unix_socket' => env('DB_SOCKET', ''),
            'charset' => env('DB_CHARSET', 'utf8mb4'),
            'collation' => env('DB_COLLATION', 'utf8mb4_unicode_ci'),
            'prefix' => '',
            'prefix_indexes' => true,
            'strict' => true,
            'engine' => null,
            'options' => extension_loaded('pdo_mysql') ? array_filter([
                (PHP_VERSION_ID >= 80500 ? \Pdo\Mysql::ATTR_SSL_CA : \PDO::MYSQL_ATTR_SSL_CA) => env('MYSQL_ATTR_SSL_CA'),
            ]) : [],
        ],

        'pgsql' => [
            'driver' => 'pgsql',
            'url' => env('DB_URL'),
            'host' => env('DB_HOST', '127.0.0.1'),
            'port' => env('DB_PORT', '5432'),
            'database' => env('DB_DATABASE', 'laravel'),
            'username' => env('DB_USERNAME', 'root'),
            'password' => env('DB_PASSWORD', ''),
            'charset' => env('DB_CHARSET', 'utf8'),
            'prefix' => '',
            'prefix_indexes' => true,
            'search_path' => 'public',
            'sslmode' => env('DB_SSLMODE', 'prefer'),
        ],

        'sqlsrv' => [
            'driver' => 'sqlsrv',
            'url' => env('DB_URL'),
            'host' => env('DB_HOST', 'localhost'),
            'port' => env('DB_PORT', '1433'),
            'database' => env('DB_DATABASE', 'laravel'),
            'username' => env('DB_USERNAME', 'root'),
            'password' => env('DB_PASSWORD', ''),
            'charset' => env('DB_CHARSET', 'utf8'),
            'prefix' => '',
            'prefix_indexes' => true,
            // 'encrypt' => env('DB_ENCRYPT', 'yes'),
            // 'trust_server_certificate' => env('DB_TRUST_SERVER_CERTIFICATE', 'false'),
        ],

        'clickhouse' => [
            'driver' => 'clickhouse',
            'host' => env('CLICKHOUSE_HOST', '127.0.0.1'),
            'port' => env('CLICKHOUSE_PORT', '8123'),
            'database' => env('CLICKHOUSE_DATABASE', 'default'),
            'username' => env('CLICKHOUSE_USERNAME', 'default'),
            'password' => env('CLICKHOUSE_PASSWORD', ''),
            'timeout_connect' => env('CLICKHOUSE_TIMEOUT_CONNECT', 2),
            'timeout_query' => env('CLICKHOUSE_TIMEOUT_QUERY', 2),
            'https' => env('CLICKHOUSE_HTTPS', false),
            'retries' => env('CLICKHOUSE_RETRIES', 0),
            'options' => [
                'database' => env('CLICKHOUSE_DATABASE', 'default'),
                'timeout' => env('CLICKHOUSE_TIMEOUT_QUERY', 2),
                'connectTimeOut' => env('CLICKHOUSE_TIMEOUT_CONNECT', 2),
            ],
        ],

    ],

    /*
    |--------------------------------------------------------------------------
    | Migration Repository Table
    |--------------------------------------------------------------------------
    |
    | This table keeps track of all the migrations that have already run for
    | your application. Using this information, we can determine which of
    | the migrations on disk haven't actually been run on the database.
    |
    */

    'migrations' => [
        'table' => 'migrations',
        'update_date_on_publish' => true,
    ],

    /*
    |--------------------------------------------------------------------------
    | Redis Databases
    |--------------------------------------------------------------------------
    |
    | Redis is an open source, fast, and advanced key-value store that also
    | provides a richer body of commands than a typical key-value system
    | such as Memcached. You may define your connection settings here.
    |
    */

    'redis' => [

        'client' => env('REDIS_CLIENT', 'phpredis'),

        'options' => [
            'cluster' => env('REDIS_CLUSTER', 'redis'),
            'prefix' => env('REDIS_PREFIX', Str::slug((string) env('APP_NAME', 'laravel')).'-database-'),
            'persistent' => env('REDIS_PERSISTENT', false),
        ],

        'default' => [
            'url' => env('REDIS_URL'),
            'host' => env('REDIS_HOST', '127.0.0.1'),
            'username' => env('REDIS_USERNAME'),
            'password' => env('REDIS_PASSWORD'),
            'port' => env('REDIS_PORT', '6379'),
            'scheme' => env('REDIS_SCHEME', 'tcp'),
            'database' => env('REDIS_DB', '0'),
            'max_retries' => env('REDIS_MAX_RETRIES', 3),
        ],

        'cache' => [
            'url' => env('REDIS_URL'),
            'host' => env('REDIS_HOST', '127.0.0.1'),
            'username' => env('REDIS_USERNAME'),
            'password' => env('REDIS_PASSWORD'),
            'port' => env('REDIS_PORT', '6379'),
            'database' => env('REDIS_CACHE_DB', '0'),
            'max_retries' => env('REDIS_MAX_RETRIES', 3),
        ],

        'upstash' => [
            'url' => env('UPSTASH_REDIS_URL'),
            'host' => env('UPSTASH_REDIS_HOST', '127.0.0.1'),
            'username' => env('UPSTASH_REDIS_USERNAME'),
            'password' => env('UPSTASH_REDIS_PASSWORD'),
            'port' => env('UPSTASH_REDIS_PORT', '6379'),
            'scheme' => env('UPSTASH_REDIS_SCHEME', 'tcp'),
            'database' => env('UPSTASH_REDIS_DB', '0'),
        ],

        'aws' => [
            'url' => env('AWS_REDIS_URL'),
            'host' => env('AWS_REDIS_HOST', '127.0.0.1'),
            'username' => env('AWS_REDIS_USERNAME'),
            'password' => env('AWS_REDIS_PASSWORD'),
            'port' => env('AWS_REDIS_PORT', '6379'),
            'scheme' => env('AWS_REDIS_SCHEME', 'tls'),
            'database' => env('AWS_REDIS_DB', '0'),
        ],

    ],

];
