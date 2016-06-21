<?php
include "databasefunctions.php";
include "character.php";

$charJson = $_POST["json"];
$char = json_decode($charJson);

//var_dump($char);

$bigassSQL = "UPDATE `characters` SET"
		. "`name` = '" . addslashes($char->data->name) . "',"
		. "`ownerid` = '" . $char->data->ownerId . "',"
		. "`inventory` = '" . addslashes($char->data->inventory) . "',"
		. "`spells` = '" . addslashes($char->data->spells) . "'"
		. "WHERE `id` = '" . $char->data->id . "';";
		
$connection = Connect();
echo $bigassSQL; 
mysqli_query($connection, $bigassSQL);
Disconnect($connection);