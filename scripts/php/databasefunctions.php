<?php

	function NavigateToPage($page)
	{
		header("Location: " . $page);
		echo '<META HTTP-EQUIV="Refresh" Content="0; URL=' . $page . '">'; //failsafe
	}
	
	function TogglePayment($regID)
	{
		$link = Connect();
		
		$result = mysqli_query($link, "SELECT * FROM `reserveringen` WHERE id='$regID'"); //WHERE date=whaterver day is currently selected
		
		$registration = mysqli_fetch_row($result); //0=id 1=name 2=starttime 3=endtime 4=date 5=maxusers, location, price
		
		mysqli_query($link, "UPDATE `reserveringen` SET `betaald` = '" . ($registration[3] == "1"? "0" : "1") . "' WHERE `id` = '$regID';");
		
		return $registration;
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
	
	function RequireAdmin($currentPage, $targetPageWhenNotAdmin)
	{
		StartSessionIfNeeded();
		
		RequireLogin($currentPage);
		
		if($_SESSION['currentUser'][4] == "0")
		{
			$_SESSION['returnPage'] = $targetPageWhenNotAdmin;
			NavigateToPage("login.php");
			die("You need to log in as admin first!");
		}
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
	
	function EmailLessonConfirmation($lessonName)
	{
		StartSessionIfNeeded();
		//NL02INGB0679076808
		$message = "U heeft zich ingeschreven voor de cursus '$lessonName'. De inschrijving is definitief zodra de betaling ontvangen is. U kunt het bedrag overmaken naar rekeningnummer NL02INGB0679076808 TNV GM Nootenboom onder vermelding van je naam, gebruikersnaam en cursusdatum.";
		
		return mail($_SESSION['currentUser'][2], "Inschrijving '$lessonName'", $message, "From: info@bewustwedstrijdrijden.nl"); //extra param for from: 'From: abc@def.com'
	}
	
	function EmailAccountData()
	{
		StartSessionIfNeeded();
		return mail($_SESSION['currentUser'][2], "Je gebruikersaccount op bewustwedstrijdrijden.nl", "Hallo, uw inloggegevens zijn: Naam: " . $_SESSION['currentUser'][1] . ", Wachtwoord: " . $_SESSION['currentUser'][3], "From: info@bewustwedstrijdrijden.nl"); //extra param for from: 'From: abc@def.com'
	}
	
	function Email($to, $from, $title, $message)
	{
		StartSessionIfNeeded();
		return mail($to, $title, $message, "From: " . $from); //extra param for from: 'From
	}
	
	function GetLesson($id)
	{
		$link = Connect();
		
		$result = mysqli_query($link, "SELECT * FROM `cursussen` WHERE `id`=$id"); //WHERE date=whaterver day is currently selected
		
		$lesson = mysqli_fetch_row($result); //0=id 1=name 2=starttime 3=endtime 4=date 5=maxusers

		Disconnect($link);
		
		return $lesson;
	}
	
	function GetAllLessons($includePast = false)
	{
		$link = Connect();
		
		$result = mysqli_query($link, "SELECT * FROM `cursussen`"); //WHERE date=whaterver day is currently selected
		
		$lessons = mysqli_fetch_all($result); //0=id 1=name 2=starttime 3=endtime 4=date 5=maxusers
		
		$lessonsFiltered = array();
		
		for($i = 0; $i < count($lessons); $i++)
		{
			$now = time();
			$lessonDate = strtotime($lessons[$i][4]);
			
			if($lessonDate >= $now -  86400|| $includePast)
				array_push($lessonsFiltered, $lessons[$i]);
		}
		
		return $lessonsFiltered;
	}
	
	function GetRegistrationsForLessons($lessonID)
	{
		$link = Connect();
		
		$result = mysqli_query($link, "SELECT * FROM `reserveringen` WHERE lesid='$lessonID'"); //WHERE date=whaterver day is currently selected
		
		$registrations = mysqli_fetch_all($result); //0=id 1=name 2=starttime 3=endtime 4=date 5=maxusers
		
		$users = array();
		
		for($i = 0; $i < count($registrations); $i++)
		{
			$idToFind = $registrations[$i][1];
			
			$result = mysqli_query($link, "SELECT * FROM `users` WHERE id='$idToFind'"); //WHERE date=whaterver day is currently selected
		
			array_push($users, mysqli_fetch_row($result)); 
		}
		
		return $users;
	}
	
	function GetRegistrationByUserAndLesson($userID, $lessonID)
	{
		$link = Connect();
		
		$result = mysqli_query($link, "SELECT * FROM `reserveringen` WHERE userid='$userID' AND lesid='$lessonID'"); //WHERE date=whaterver day is currently selected
		
		$registration = mysqli_fetch_row($result); //0=id 1=name 2=starttime 3=endtime 4=date 5=maxusers
		
		return $registration;
	}
	
	function GetUserRegistrations($userID)
	{
		$link = Connect();
		
		$result = mysqli_query($link, "SELECT * FROM `reserveringen` WHERE userid='$userID'"); //WHERE date=whaterver day is currently selected
		
		$registrations = mysqli_fetch_all($result); //0=id 1=name 2=starttime 3=endtime 4=date 5=maxusers
		
		$lessons = array();
		
		for($i = 0; $i < count($registrations); $i++)
		{
			$idToFind = $registrations[$i][2];
			
			$result = mysqli_query($link, "SELECT * FROM `cursussen` WHERE id='$idToFind'"); //WHERE date=whaterver day is currently selected
		
			array_push($lessons, mysqli_fetch_row($result)); //0=id 1=name 2=starttime 3=endtime 4=date 5=maxusers	
		}
		
		return $lessons;
	}
	
	function Disconnect($toDisconnect)
	{
		mysqli_close($toDisconnect); //sluit de link
	}
	
	function cancelLesson($lessonID, $userID)
	{
		$returnString = "Je bent niet meer ingeschreven voor deze cursus.";
	
		StartSessionIfNeeded();
		$link = Connect();
		
		$result = mysqli_query($link, "SELECT * FROM `reserveringen` WHERE `lesid`='$lessonID'");
		$lesson = mysqli_fetch_row($result);
		
		$result = mysqli_query($link, "SELECT * FROM `cursussen` WHERE `id`='$lessonID'");
		$lessonInfo = mysqli_fetch_row($result);
		
		$result = mysqli_query($link, "SELECT * FROM `users` WHERE `id`='$userID'");
		$user = mysqli_fetch_row($result);
		
		$hasPaid = false;
		
		if($lesson[3] == "1")
		{
			$hasPaid = true;

			Email("info@bewustwedstrijdrijden.nl", "info@bewustwedstrijdrijden.nl", "Annulering inschrijving", "Gebruiker " . $user[1] . " (email: " . $user[2] . ") heeft zich uitgeschreven voor de cursus " . $lessonInfo[1] . ", maar heeft al betaald (€" . $lessonInfo[7] . ")");
		}
		
		mysqli_query($link, "DELETE FROM `reserveringen` WHERE `lesid` = " . $lessonID . " AND `userid` = " . $userID . "");
		
		if($hasPaid)
			$returnString = $returnString . " Als dit niet de bedoeling was, kunt u zich weer aanmelden. Stuur een e-mail naar info@bewustwedstrijdtrijden.nl zodat de betaling niet geannuleerd wordt.";
		
		return $returnString;
	}
	
	function joinLesson($lessonID)
	{
		$returnString = "ERROR!";
	
		StartSessionIfNeeded();
		$link = Connect();
		
		$result = mysqli_query($link, "SELECT * FROM `cursussen` WHERE id='$lessonID'");
		
		$lesson = mysqli_fetch_row($result); //0=id 1=name 2=starttime 3=endtime 4=date 5=maxusers
		
		$existingRegistrations = mysqli_query($link, "SELECT * FROM `reserveringen` WHERE lesid='$lessonID'");
		$existingRegistrations = mysqli_fetch_all($existingRegistrations);
		
		$amountOfRegistrations = count($existingRegistrations);
		$canJoin = $amountOfRegistrations < $lesson[5];
		
		$userID = $_SESSION["currentUser"][0];
		
		for($i = 0; $i < count($existingRegistrations); $i++)
		{
			if($existingRegistrations[$i][1] == $userID) //0=id, 1=userid, 2=lessonid
			{
				$returnString = "Je bent al geregistreerd voor deze cursus. <a href='cancelLesson.php?id=$lessonID'>Wil je je uitschrijven?</a>";
				$canJoin = false;
			}
		}
		
		if($canJoin)
		{
			mysqli_query($link, "INSERT INTO `reserveringen` (userid, lesid) VALUES ('$userID', '$lessonID')");
			$returnString = "Je bent ingeschreven voor deze cursus. <a href='cancelLesson.php?id=$lessonID'>Ongedaan maken</a>";
			
			EmailLessonConfirmation($lesson[1]);
		}
		else if($amountOfRegistrations >= $lesson[5])
		{
			$returnString = "Je kunt helaas niet ingeschreven worden bij deze cursus. De cursus is al vol.";
		}
		
		//echo "there are " . count($existingRegistrations) . " users registered here, you " . ($canJoin? "have been registered for this lesson!" : "cannot join.");
		return $returnString;
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
	
	function AttemptLogin($username, $password)
	{
		StartSessionIfNeeded();
	
		$link = Connect();
	
		$result = mysqli_query($link, "SELECT * FROM `users` WHERE name='$username'");

		$user = mysqli_fetch_row($result); //0=id 1=name 2=email 3=pw 4=IsAdmin
		
		if($password == $user[3])
		{
			$_SESSION["currentUser"] = $user;
			return true;
		}
		
		return false;
	}
	
	function EditLesson($id, $name, $beginTime, $endTime, $date, $maxUsers, $location, $price)
	{
		$link  = Connect();
	
		$sql = "UPDATE `cursussen` SET `naam` = '$name', `tijdBegin` = '$beginTime', `tijdEind` = '$endTime', `datum` = '$date', `maxusers` = '$maxUsers', `locatie` = '$location', `prijs` = '$price' WHERE `id` = '$id'";
		
		var_dump($sql);
		
		mysqli_query($link, $sql);
		
		Disconnect($link);
	}
	
	function RegisterNewLesson($name, $beginTime, $endTime, $date, $maxUsers, $location, $price)
	{
		$link  = Connect();
	
		$sql = "INSERT INTO `cursussen` (naam, tijdBegin, tijdEind, datum, maxusers, locatie, prijs) VALUES ('$name', '$beginTime', '$endTime', '$date', '$maxUsers', '$location', '$price')";
		
		var_dump($sql);
		
		mysqli_query($link, $sql);
		
		Disconnect($link);
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
	
	function ShowUsers()
	{
		$results = GetAllUsers();
		
		$resultsAsStrings = array(); //maak een lege array
		
		for($i = 0; $i < count($results); $i++)
			array_push($resultsAsStrings, implode($results[$i], ", ")); //stop elke rij in de array als string
	
		echo implode($resultsAsStrings , "<br>"); //implodeer de array met een <br> teken zodat het onder elkaar terecht komt
	}
?>
