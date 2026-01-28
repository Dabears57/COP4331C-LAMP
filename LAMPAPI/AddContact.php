<?php
	$inData = getRequestInfo();
	
	$contact = $inData["contact"];
	$userId = $inData["userId"];

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
	if ($conn->connect_error) 
	{
		returnWithError( $conn->connect_error );
	} 
	else
	{
<<<<<<< HEAD
<<<<<<<< HEAD:LAMPAPI/AddContact.php
		$stmt = $conn->prepare("INSERT into Contacts (UserId,Name) VALUES(?,?)");
========
		$stmt = $conn->prepare("DELETE FROM Contacts WHERE UserId=$userId");
>>>>>>>> 4aae53f (Updated AddContact, SearchContact, and DeleteContact (WIP)):LAMPAPI/DeleteContact.php
=======
		$stmt = $conn->prepare("INSERT into Contacts (UserId,Name) VALUES(?,?)");
>>>>>>> 4aae53f (Updated AddContact, SearchContact, and DeleteContact (WIP))
		$stmt->bind_param("ss", $userId, $contact);
		$stmt->execute();
		$stmt->close();
		$conn->close();
		returnWithError("");
	}

	function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
	}

	function sendResultInfoAsJson( $obj )
	{
		header('Content-type: application/json');
		echo $obj;
	}
	
	function returnWithError( $err )
	{
		$retValue = '{"error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}
	
<<<<<<< HEAD
<<<<<<<< HEAD:LAMPAPI/AddContact.php

========
>>>>>>>> 4aae53f (Updated AddContact, SearchContact, and DeleteContact (WIP)):LAMPAPI/DeleteContact.php
=======
>>>>>>> 4aae53f (Updated AddContact, SearchContact, and DeleteContact (WIP))
?>
