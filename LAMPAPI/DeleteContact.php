<?php
	$inData = getRequestInfo();

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
			returnWithError("");
		else
            returnWithError(
                "contactId=" . var_export($contactId, true) .
                ", userId=" . var_export($userId, true)
            );
          

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
