<?php
$data = json_decode(file_get_contents('php://input'), true);
if(!$data) { echo json_encode(['success'=>false]); exit; }

$customer = $data['customer'];
$items = json_encode($data['items']);
$total = $data['total'];
$date = $data['date'];

// koneksi database
$conn = new mysqli('localhost','root','','dimsum_db');
$stmt = $conn->prepare("INSERT INTO orders (customer, items, total, date) VALUES (?,?,?,?)");
$stmt->bind_param("ssis", $customer, $items, $total, $date);
if($stmt->execute()) {
    echo json_encode(['success'=>true, 'order'=>$data]);
} else {
    echo json_encode(['success'=>false]);
}
?>