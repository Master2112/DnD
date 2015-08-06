<?php
include "databasefunctions.php";
include "character.php";

$id = $_GET["id"];

$game = new Collection();

$gameData = GetGame($id);

if($gameData != null)
{
	$game->infoForMaster = new Collection();

	$game->id = $gameData[0];
	$game->masterId = $gameData[1];
	$game->name = $gameData[2];
	$game->missionName = $gameData[3];
	$game->description = $gameData[4];
	$game->infoForMaster->notes = $gameData[5];
	$game->infoForMaster->itemsInWorld = $gameData[6];
	$game->difficulty = $gameData[7];

	echo json_encode($game);
}
else
{
	$game->infoForMaster = new Collection();

	$game->id = "INVALID GAME";
	$game->masterId = "INVALID GAME";
	$game->name = "INVALID GAME";
	$game->missionName = "INVALID GAME";
	$game->description = "INVALID GAME";
	$game->infoForMaster->notes = "INVALID GAME";
	$game->infoForMaster->itemsInWorld = "INVALID GAME";
	$game->difficulty = "INVALID GAME";

	echo json_encode($game);
}	