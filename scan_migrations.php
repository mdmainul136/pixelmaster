<?php
$files = glob(__DIR__ . '/database/migrations/*.php');
$fragile = [];
foreach ($files as $f) {
    $content = file_get_contents($f);
    if (strpos($content, 'Schema::table') !== false) {
        if (strpos($content, 'hasColumn') === false && strpos($content, 'hasTable') === false) {
            $fragile[] = basename($f);
        }
    }
}
echo "Fragile files:\n";
echo implode("\n", $fragile);
