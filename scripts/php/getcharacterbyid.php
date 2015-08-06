<?php
include "databasefunctions.php";
include "character.php";

$id = $_GET["id"];

$charData = GetCharacter($id);

$char = new Character($charData);

echo json_encode($char);