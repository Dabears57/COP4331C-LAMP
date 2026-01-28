<?php

	$inData = getRequestInfo();
	
	$contact = $inData["contact"];
	$userId = $inData["userId"];

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
	if ($conn->connect_error) 
	{
		returnWithError($conn->connect_error);
	} 
	else
	{
        // The contact is deleted only if it belongs to the given user
		$stmt = $conn->prepare("DELETE FROM Contacts WHERE UserId=? AND Name=?");
		$stmt->bind_param("ss", $userId, $contact);
		$stmt->execute();

        if ($stmt->affected_rows > 0)
		{
			returnWithError("");
		}
		else
		{
			returnWithError("Delete failed: Record not found.");
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
