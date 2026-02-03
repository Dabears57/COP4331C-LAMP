<?php

	$inData = getRequestInfo();
	
	$searchResults = [];

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
	if ($conn->connect_error) 
	{
		returnWithError( $conn->connect_error );
	} 
	else
	{
		$stmt = $conn->prepare("SELECT FirstName, LastName, Phone, Email FROM Users WHERE Name LIKE ? and UserID = ? AND FirstName LIKE ?");
		$contactName = "%" . $inData["search"] . "%";
		$stmt->bind_param("iss", $inData["UserID"], $contactName);
		$stmt->execute();
		
		$result = $stmt->get_result();
		
		while($row = $result->fetch_assoc())
		{
			$searchResults[] = [
				"FirstName" => $row["FirstName"],
				"LastName" => $row["LastName"],
				"Phone" => $row["Phone"],
				"Email" => $row["Email"]
			]
		}
		
		if( count($searchResults) == 0 )
		{
			returnWithError( "No Records Found" );
		}
		else
		{
			returnWithInfo( $searchResults );
		}
		
		$stmt->close();
		$conn->close();
	}

	function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
	}

	function sendResultInfoAsJson( $obj )
	{
		header('Content-type: application/json');
		echo json_encode($obj);
	}
	
	function returnWithError( $err )
	{
		sendResultInfoAsJson([
			"results" => [],
			"error" => $err
		]);
	}
	
	function returnWithInfo( $searchResults )
	{
		sendResultInfoAsJson([
			"results" => $searchResults,
			"error" => ""
		]);
	}
	
?>
