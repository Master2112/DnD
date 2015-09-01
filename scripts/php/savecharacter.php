<?php
include "databasefunctions.php";
include "character.php";

$charJson = $_POST["json"];
$char = json_decode($charJson);

//var_dump($char);

$bigassSQL = "UPDATE `characters` SET"
		. "`name` = '" . addslashes($char->data->info->name) . "',"
		. "`ownerid` = '" . $char->data->ownerId . "',"
		. "`experiencepoints` = '" . $char->data->info->experience . "',"
		. "`inventory` = '" . addslashes($char->data->inventory) . "',"
		. "`age` = '" . $char->data->info->age . "',"
		. "`currenthealth` = '" . $char->data->status->currentHealth . "',"
		. "`maxhitpoints` = '" . $char->data->status->maxHitPoints . "'"
		. "WHERE `id` = '" . $char->data->id . "';";
		
$connection = Connect();
echo $bigassSQL; 
mysqli_query($connection, $bigassSQL);
Disconnect($connection);