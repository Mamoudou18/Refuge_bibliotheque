<?php
header("Content-Type: application/json");
echo json_encode([
    "status" => "ok",
    "message" => "API backend fonctionne",
    "php_version" => phpversion()
]);
