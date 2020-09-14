<?php
header('Access-Control-Allow-Origin: *');  
$ch = curl_init();

$data = json_decode($_GET['data2b']);

$id = $data->activityId;
$language = $data->language;

curl_setopt($ch, CURLOPT_URL, 'https://touristhub.aegean.gr/ttdp/investment/activity/byId?activityId='.$id.'&language='.$language);

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

echo substr($result,0,-1);

?>


