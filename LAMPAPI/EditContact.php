<?php
	// Read raw request body once
	$raw = file_get_contents("php://input");
	$inData = json_decode($raw, true);

	if ($inData === null)
	{
		returnWithError("Invalid JSON: " . json_last_error_msg());
		exit;
	}

	// Needed identifiers
	if (!isset($inData["contactId"]) || !isset($inData["userId"]))
	{
		returnWithError("Missing contactId or userId");
		exit;
	}

	$contactId = (int)$inData["contactId"];
	$userId    = (int)$inData["userId"];

	if (!isset($inData["firstName"]) || $inData["firstName"] === "")
	{
		returnWithError("Missing firstName");
		exit;
	}

	$firstName = $inData["firstName"];
	$lastName  = $inData["lastName"]  ?? "";
	$phone     = $inData["phone"]     ?? "";
	$email     = $inData["email"]     ?? "";
	$company   = $inData["company"]   ?? "";
	$address   = $inData["address"]   ?? "";
	$note      = $inData["note"]      ?? "";

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
	if ($conn->connect_error)
	{
		returnWithError($conn->connect_error);
		exit;
	}

	$stmt = $conn->prepare(
		"UPDATE Contacts
		 SET FirstName=?, LastName=?, Phone=?, Email=?, Company=?, Address=?, Note=?
		 WHERE ID=? AND UserID=?"
	);

	if ($stmt === false)
	{
		returnWithError("Prepare failed: " . $conn->error);
		$conn->close();
		exit;
	}

	$stmt->bind_param(
		"sssssssii",
		$firstName,
		$lastName,
		$phone,
		$email,
		$company,
		$address,
		$note,
		$contactId,
		$userId
	);

	$stmt->execute();

	// Treat "no changes" as success
	if ($stmt->errno !== 0)
	{
		returnWithError("Update failed: " . $stmt->error);
	}
	else
	{
		returnWithError("");
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
