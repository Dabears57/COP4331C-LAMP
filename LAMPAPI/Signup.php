
<?php

	$inData = getRequestInfo();

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331"); 	
	if( $conn->connect_error )
	{
		returnWithError( $conn->connect_error );
	}
	else
	{
		$stmt = $conn->prepare("INSERT INTO Users (FirstName, LastName, Login, Password) VALUES (?,?,?,?)");
		$stmt->bind_param("ssss",  $inData["firstName"],  $inData["lastName"], $inData["login"], $inData["password"]);

		if($stmt->execute())
		{
			returnWithSuccess();
		}
		else
		{
			returnWithError("Unable to Register Account");
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
		echo $obj;
	}

	function returnWithError( $err )
	{
		$retValue = '{"username":"","password":"","error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}

	function returnWithSuccess()
	{
		$retValue = '{"error":""}';
		sendResultInfoAsJson( $retValue );
	}
	
?>