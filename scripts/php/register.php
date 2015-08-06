<?php
include "databasefunctions.php";

$username = $_GET["name"];
$email = $_GET["email"];
$password = $_GET["password"];

$result = RegisterNewUser($username, $email, $password);

echo $result;