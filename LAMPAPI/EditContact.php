<?php

	$inData = getRequestInfo();
	
	$oldContact = $inData["oldContact"];
	$newContact = $inData["newContact"];
	$userId = $inData["userId"];

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
	if ($conn->connect_error) 
	{
		returnWithError($conn->connect_error);
	} 
	else
	{
        // Ensures the contact belongs to the logged-in user
		$stmt = $conn->prepare("UPDATE Contacts SET Name=? WHERE UserId=? AND Name=?");

        // Bind new name, user ID, and old name to the SQL statement
		$stmt->bind_param("sss", $newContact, $userId, $oldContact);
		$stmt->execute();

        if ($stmt->affected_rows > 0)
		{
			returnWithError("");
		}
		else
		{
			returnWithError("Update failed: Record not found or no changes made.");
		}

		$stmt->close();
		$conn->close();
		returnWithError("");
	}

	function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
	}

	function sendResultInfoAsJson($obj)
	{
		header('Content-type: application/json');
		echo $obj;
	}
	
	function returnWithError($err)
	{
		$retValue = '{"error":"' . $err . '"}';
		sendResultInfoAsJson($retValue);
	}
?>
