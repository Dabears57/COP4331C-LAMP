<?php
	$inData = getRequestInfo();

	$contactId = $inData["contactId"];
	$userId    = $inData["userId"];
	$firstName = $inData["firstName"];
	$lastName  = $inData["lastName"];
	$phone     = $inData["phone"];
	$email     = $inData["email"];
	$company   = $inData["company"];
	$address   = $inData["address"];
	$note      = $inData["note"];

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
	if ($conn->connect_error)
	{
		returnWithError($conn->connect_error);
	}
	else
	{
         // Ensures the contact belongs to the logged-in user
		$stmt = $conn->prepare(
			"UPDATE Contacts
			 SET firstName=?, lastName=?, phone=?, email=?, company=?, address=?, note=?
			 WHERE contactId=? AND userId=? AND deletedAt IS NULL"
		);

        // Bind the changes
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

        if ($stmt->affected_rows > 0)
        {
            returnWithError("");
        }
        else if ($stmt->errno === 0)
        {
            // Query succeeded but data was identical
            returnWithError("");
        }
        else
        {
            returnWithError("Update failed.");
        }

		$stmt->close();
		$conn->close();
	}

	function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
	}

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
