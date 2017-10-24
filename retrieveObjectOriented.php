<?php
	/* This example assumes a table friends in the database myDB  */
	/* exists.  The table has at least two fields: name and id.   */
	/* The script displays all the records in the table           */
	
	require_once "dbLogin.php"; 
		
	$db_connection = new mysqli($host, $user, $password, $database);
	if ($db_connection->connect_error) {
		die($db_connection->connect_error);
	} else {
		//echo "Connection to database established<br><br>";
	}
	
	/* Query */
	$order = ["grade", "state", "pollster"];
	$sql = "SELECT * FROM `table 10` order by ".$order[0];
	for ($x = 1; $x < sizeof($order); $x++) {
     $sql .= ",".$order[$x];
	} 
	
			
	/* Executing query */
	$result = $db_connection->query($sql);
	if (!$result) {
		die("Retrieval failed: ". $db_connection->error);
	} else {
		/* Number of rows sfound */
		$num_rows = $result->num_rows;
		if ($num_rows === 0) {
			echo "Empty Table<br>";
		} else {
			
			for ($x = 0; $x < sizeof($order); $x++) {
				$travel[$x] = "EPT";
			}
			$mid = "EPT";
			$json["name"] = "presidential_polls";
			$json["children"] = array();
			$prev = array("EPT","EPT","EPT");
			$i1 = 0; $i2 = 0; $i3 = 0; $i0 = 0;
			
			for ($row_index = 0; $row_index < $num_rows; $row_index++) {
				$result->data_seek($row_index);
				$row = $result->fetch_array(MYSQLI_ASSOC);
				$newData["name"] = $row['poll_id'];
				$newData["size"] = $row['samplesize'];
				$newData["url"] = $row['url'];
				if ($row[$order[0]] == ""){
					$grade = "Undefined";
				} else {
					$grade = $row[$order[0]];
				}
				if ($prev[0] == "EPT"){
					//echo "ept one <br>";
					$json["children"][$i0]["name"] = $order[0].":  ".$grade;
					$json["children"][$i0]["children"][$i1]["name"] = $order[1].":  ".$row[$order[1]];
					$json["children"][$i0]["children"][$i1]["children"][$i2]["name"] = $order[2].":  ".$row[$order[2]];
					$json["children"][$i0]["children"][$i1]["children"][$i2]["children"][0] = $newData;
					$i3++;
				} else if ($prev[0] == $row[$order[0]] && $prev[1] == $row[$order[1]] && $prev[2] == $row[$order[2]]){
					//echo "add one<br>";
					$json["children"][$i0]["children"][$i1]["children"][$i2]["children"][$i3] = $newData;
					$i3++;
				} else if ($prev[0] == $row[$order[0]] && $prev[1] == $row[$order[1]]){
					//echo "change 2<br>";
					$i2++; $i3=1;
					$json["children"][$i0]["children"][$i1]["children"][$i2]["name"] = $order[2].":  ".$row[$order[2]];
					$json["children"][$i0]["children"][$i1]["children"][$i2]["children"][0] = $newData;			
				} else if ($prev[0] == $row[$order[0]]){
					//echo "change 1<br>";
					$i1++; $i2 =0; $i3 = 1;
					$json["children"][$i0]["children"][$i1]["name"] = $order[1].":  ".$row[$order[1]];
					$json["children"][$i0]["children"][$i1]["children"][$i2]["name"] = $order[2].":  ".$row[$order[2]];
					$json["children"][$i0]["children"][$i1]["children"][$i2]["children"][0] = $newData;
				} else {
					//echo "change 0<br>";
					$i0++; $i1 = 0; $i2 = 0; $i3 = 1;
					$json["children"][$i0]["name"] = $order[0].":  ".$grade;
					$json["children"][$i0]["children"][$i1]["name"] = $order[1].":  ".$row[$order[1]];
					$json["children"][$i0]["children"][$i1]["children"][$i2]["name"] = $order[2].":  ".$row[$order[2]];
					$json["children"][$i0]["children"][$i1]["children"][$i2]["children"][0] = $newData;
				}
				
				$prev = array($row[$order[0]],$row[$order[1]],$row[$order[2]]);
				//echo "{$row[$order[0]]}    {$row[$order[1]]}     {$row[$order[2]]}<br>";
			
			}
		}
	}
	

	echo json_encode($json);

	
	
	//var_dump(json_decode($arr));
	/* Freeing memory */
	$result->close();
	
	/* Closing connection */
	$db_connection->close();
?>