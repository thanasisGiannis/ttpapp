<?php
header('Access-Control-Allow-Origin: *');  
$ch = curl_init();

$data = $_GET['data2b'];

curl_setopt($ch, CURLOPT_URL, 'https://83.212.74.62/ttdp/investment/explore');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);

curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);

$headers = array();
$headers[] = 'X-Api-Token: e3707fdc-c2c4-49ba-9966-1b6db1134d84';
$headers[] = 'Content-Type: application/json; charset=utf-8';
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

$result = curl_exec($ch);
if (curl_errno($ch)) {
    echo 'Error:' . curl_error($ch);
}
curl_close($ch);

echo $result;

?>


