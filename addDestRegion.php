<?php
header('Access-Control-Allow-Origin: *');  
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://touristhub.aegean.gr/ttdp/investment/area');
$headers = array();
$headers[] = 'X-Api-Token: e3707fdc-c2c4-49ba-9966-1b6db1134d84';
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

$result = curl_exec($ch);
if (curl_errno($ch)) {
    echo 'Error:' . curl_error($ch);
}
curl_close($ch);

echo substr($result, 0, -1);
//echo $result;

?>


