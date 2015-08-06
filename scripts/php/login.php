<?php
include "databasefunctions.php";

$email = $_GET["email"];
$password = $_GET["password"];

$user = AttemptLogin($email, $password);

$returnUser = new Collection();

$returnUser->id = (int)$user[0];
$returnUser->name = $user[1];
$returnUser->email = $user[2];
$returnUser->password = $user[3];
$returnUser->ratings = new Collection();

$returnUser->ratings->asPlayer = new Collection();
$returnUser->ratings->asMaster = new Collection();

$returnUser->ratings->asPlayer->positive = (int)$user[4];
$returnUser->ratings->asPlayer->negative = (int)$user[5];
$returnUser->ratings->asMaster->positive = (int)$user[6];
$returnUser->ratings->asMaster->negative = (int)$user[7];

echo json_encode($returnUser);