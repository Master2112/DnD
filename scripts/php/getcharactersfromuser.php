<?php
include "databasefunctions.php";
include "character.php";

$id = $_GET["id"];

$charData = GetCharactersFromUser($id);

$chars = array();

for($i = 0; $i < count($charData); $i++)
{
	array_push($chars, new Character($charData[$i]));
}

echo json_encode($chars);