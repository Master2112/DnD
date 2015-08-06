<?php
include "databasefunctions.php";
include "character.php";

$charJson = file_get_contents('php://input');
$char = json_decode($charJson);