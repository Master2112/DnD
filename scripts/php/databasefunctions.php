<?php

	class Collection{}

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
		return mail($to, $title, $message, "From: " . $from);
	}
	
	function GetCharacter($id)
	{
		$link = Connect();
		
		$result = mysqli_query($link, "SELECT * FROM `characters` WHERE `id`=$id"); 
		
		$obj = mysqli_fetch_row($result); 

		Disconnect($link);
		
		return $obj;
	}
	
	function GetGame($id)
	{
		$link = Connect();
		
		$result = mysqli_query($link, "SELECT * FROM `games` WHERE `id`=$id"); 
		
		if($result != false)
		{
			$obj = mysqli_fetch_row($result); 
		}
		else
		{
			$obj = null;
		}
		
		Disconnect($link);
		
		return $obj;
	}
	
	function GetCharactersInGame($gameId)
	{
		$link = Connect();
		
		$result = mysqli_query($link, "SELECT * FROM `characters` WHERE `assignedgameid`=$gameId"); 
		
		$obj = mysqli_fetch_all($result); 

		Disconnect($link);
		
		return $obj;
	}
	
	function GetCharactersFromUser($userId)
	{
		$link = Connect();
		
		$result = mysqli_query($link, "SELECT * FROM `characters` WHERE `assignedgameid`=$userId"); 
		
		$obj = mysqli_fetch_all($result); 

		Disconnect($link);
		
		return $obj;
	}
	
	function GetPlayerById($id)
	{
		$link = Connect();
		
		$result = mysqli_query($link, "SELECT * FROM `users` WHERE `id`=$id"); 
		
		$obj = mysqli_fetch_row($result); 

		Disconnect($link);
		
		return $obj;
	}
	
	function Disconnect($toDisconnect)
	{
		mysqli_close($toDisconnect); //sluit de link
	}
	
	function EditUserData($idToEdit, $newName, $newEmail, $newPassword, $thenLogin = true)
	{
		$link = Connect();
	
		$sql = "UPDATE `users` SET `name` = '$newName', `email` = '$newEmail', `password` = '$newPassword' WHERE `id` = '$idToEdit';";
		
		mysqli_query($link, $sql);
		
		echo mysql_error();
		
		if($thenLogin)
			AttemptLogin($newName, $newPassword);
			
		Email($newEmail, "robot@timfalken.com", "DnD Account", "Your info has been edited! Your new name is: " . $newName . ", your password is: " . $newPassword . ". Check all other stuff online on http://www.timfalken.com/dnd/");
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
		}
		
		return $user;
	}
	
	function RegisterNewUser($username, $email, $password)
	{
		$success = false;
	
		$link  = Connect();
	
		$sql = "INSERT INTO `users` (name, email, password) VALUES ('$username', '$email', '$password')";

		$result = mysqli_query($link, "SELECT * FROM `users` WHERE email='$email'"); 
		
		$existingUser = mysqli_fetch_row($result);
		
		if($existingUser == null)
		{
			mysqli_query($link, $sql);
			
			//EmailAccountData();
			
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
