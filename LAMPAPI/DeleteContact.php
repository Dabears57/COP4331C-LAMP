<?php
	// Read raw request body once
	$raw = file_get_contents("php://input");
	$inData = json_decode($raw, true);

	// Validate JSON parsing
	if ($inData === null)
	{
		returnWithError("Invalid JSON: " . json_last_error_msg());
		exit;
	}

	// Validate required fields exist
	if (!isset($inData["contactId"]) || !isset($inData["userId"]))
	{
		returnWithError("Missing contactId or userId");
		exit;
	}

	$contactId = (int)$inData["contactId"];
	$userId    = (int)$inData["userId"];

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
	if ($conn->connect_error)
	{
		returnWithError($conn->connect_error);
		exit;
	}

    // The contact is deleted only if it belongs to the given user
	$stmt = $conn->prepare(
		"UPDATE Contacts
		 SET DeletedAt = CURRENT_TIMESTAMP
		 WHERE ID=? AND UserID=? AND DeletedAt IS NULL"
	);

	$stmt->bind_param("ii", $contactId, $userId);
	$stmt->execute();

	if ($stmt->affected_rows > 0)
	{
		returnWithError("");
	}
	else
	{
		returnWithError("Delete failed: record not found or already deleted.");
	}

	$stmt->close();
	$conn->close();

	function sendResultInfoAsJson($obj)
	{
		header("Content-type: application/json");
		echo $obj;
	}

	function returnWithError($err)
	{
		sendResultInfoAsJson('{"error":"' . $err . '"}');
	}
?>
