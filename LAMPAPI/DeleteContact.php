<?php
	$inData = getRequestInfo();

    $raw = file_get_contents("php://input");
    returnWithError("RAW=" . $raw);
    exit;

    if (!isset($contactId) || !isset($userId))
    {
        returnWithError("Missing contactId or userId");
        exit;
    }

	$contactId = $inData["contactId"];
	$userId    = $inData["userId"];

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
	if ($conn->connect_error)
	{
		returnWithError($conn->connect_error);
	}
	else
	{
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
            returnWithError("Delete failed: record not found.");
        }

		$stmt->close();
		$conn->close();
	}

	function getRequestInfo()
    {
        $data = file_get_contents("php://input");
        return json_decode($data, true);
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
