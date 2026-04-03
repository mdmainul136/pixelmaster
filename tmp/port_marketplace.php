<?php

$source = 'E:\\Mern Stact Dev\\multi-tenant-mern\\lovable-marketplace-e123c9eb-main\\src';
$dest = 'e:\\Mern Stact Dev\\multi-tenant-mern\\multi-tenant-laravel\\resources\\js\\Themes\\IOR\\Marketplace';

function copyDir($src, $dst) {
    if (!is_dir($dst)) mkdir($dst, 0777, true);
    $dir = opendir($src);
    while (false !== ($file = readdir($dir))) {
        if (($file != '.') && ($file != '..')) {
            if (is_dir($src . '/' . $file)) {
                // Skip admin and supabase
                if ($file === 'admin' || $file === 'supabase') continue;
                copyDir($src . '/' . $file, $dst . '/' . $file);
            } else {
                $content = file_get_contents($src . '/' . $file);
                
                // Basic Cleanup: Supabase
                $content = preg_replace('/import\s+.*\s+from\s+["\']@\/integrations\/supabase\/client["\'];?/i', '// Removed Supabase import', $content);
                $content = preg_replace('/import\s+.*\s+from\s+["\']@\/integrations\/supabase\/types["\'];?/i', '// Removed Supabase types', $content);
                
                // Basic Cleanup: Admin routes (rudimentary)
                $content = preg_replace('/<Route\s+path=["\']\/admin.*["\'].*\/>/i', '', $content);
                
                file_put_contents($dst . '/' . $file, $content);
            }
        }
    }
    closedir($dir);
}

// Copy src contents to Marketplace root (matching MarketplaceClassic's flat-ish structure)
echo "Starting porting...\n";
copyDir($source, $dest);
echo "Porting completed.\n";
