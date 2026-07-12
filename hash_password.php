<?php
$password = "xxxxxxxxxxxxxxxxxx";
$hash = password_hash($password, PASSWORD_BCRYPT);
echo $hash . PHP_EOL;