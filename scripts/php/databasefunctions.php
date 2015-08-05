<?php

	function NavigateToPage($page)
	{
		header("Location: " . $page);
		echo '<META HTTP-EQUIV="Refresh" Content="0; URL=' . $page . '">'; //failsafe
	}

	function StartSessionIfNeeded()
	{
		$shouldStart = false;
		
		if ( php_sapi_name() !== 'cli' ) 
		{
			if ( version_compare(phpversion(), '5.4.0', '>=') ) 
			{
				$shouldStart = !(session_status() === PHP_SESSION_ACTIVE ? TRUE : FALSE);
			} 
			else 
			{
				$shouldStart = !(session_id() === '' ? FALSE : TRUE);
			}
		}
	
		if ($shouldStart) //No session active? Start one.
			session_start();
	}
	
	function RequireLogin($targetPage)
	{
		StartSessionIfNeeded();
		
		if(!isset($_SESSION['currentUser']) || $_SESSION['currentUser'] == null)
		{
			$_SESSION['returnPage'] = $targetPage;
			NavigateToPage("login.php");
			die("You need to log in first!");
		}
	}
	
	function Connect()
	{
		include "config.php";
		
		$link = mysqli_connect($serverName, $databaseUserName, $databasePassword, $databaseName); 
	
		if(!$link)
			die( "Lol database failed" . mysql_error($link) ); //Er ging iets mis, dump de database-error op het scherm
			
		return $link;
	}
	
	function Email($to, $from, $title, $message)
	{
		StartSessionIfNeeded();
		return mail($to, $title, $message, "From: " . $from); //extra param for from: 'From
	}
	
	function GetCharacters($id)
	{
		$link = Connect();
		
		$result = mysqli_query($link, "SELECT * FROM `characters` WHERE `id`=$id"); 
		
		$lesson = mysqli_fetch_row($result); 

		Disconnect($link);
		
		return $lesson;
	}
	
	function Disconnect($toDisconnect)
	{
		mysqli_close($toDisconnect); //sluit de link
	}
	
	function EditUserData($idToEdit, $newName, $newEmail, $newPassword, $newAdmin, $newPhone, $thenLogin = true)
	{
		$link = Connect();
	
		$sql = "UPDATE `users` SET `name` = '$newName', `email` = '$newEmail', `password` = '$newPassword', `administrator` = '$newAdmin', `phonenumber` = '$newPhone' WHERE `id` = '$idToEdit';";
		
		mysqli_query($link, $sql);
		
		echo mysql_error();
		
		if($thenLogin)
			AttemptLogin($newName, $newPassword);
			
		Email($newEmail, "info@bewustwedstrijdrijden.nl", "Je gebruikersaccount", "Uw gebruikersinfo is gewijzigd. De nieuwe info is: Name: " . $newName . ", Wachtwoord: " . $newPassword . ". Bekijk je hele profiel op bewustwedstrijdrijden.nl/aanmelden/");
	}
	
	function AttemptLogin($email, $password)
	{
		StartSessionIfNeeded();
	
		$link = Connect();
	
		$result = mysqli_query($link, "SELECT * FROM `users` WHERE email='$email'");

		$user = mysqli_fetch_row($result);
		
		if($password == $user[3])
		{
			$_SESSION["currentUser"] = $user;
			return true;
		}
		
		return false;
	}
	
	function RegisterNewUser($username, $email, $password, $phoneNumber)
	{
		$success = false;
	
		$link  = Connect();
	
		$sql = "INSERT INTO `users` (name, email, password, phonenumber) VALUES ('$username', '$email', '$password', '$phoneNumber')";

		$result = mysqli_query($link, "SELECT * FROM `users` WHERE name='$username'"); 
		
		$existingUser = mysqli_fetch_row($result);
		
		if($existingUser == null)
		{
			mysqli_query($link, $sql);
			
			EmailAccountData();
			
			$success = true;
		}
		
		Disconnect($link);
		
		return $success;
	}
	
	function GetAllUsers()
	{
		$link = Connect();
		
		$result = mysqli_query($link, "SELECT * FROM `users`"); 
		
		if (false === $result)  //als de query misgaat;
		{
			die ('Error: ' . mysqli_error($link)); //Er ging iets mis, dump de database-error op het scherm
		}
		else
		{
			$results = mysqli_fetch_all($result); //haal alle rijen uit het query-result object
		}
		
		Disconnect($link);
		
		return $results;
	}
?>
