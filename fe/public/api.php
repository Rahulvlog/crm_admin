<?php
// Simple PHP Proxy to bypass mod_proxy firewall restrictions
// Get the path from the query parameter
$path = isset($_GET['path']) ? '/' . ltrim($_GET['path'], '/') : (isset($_SERVER['PATH_INFO']) ? $_SERVER['PATH_INFO'] : '/');

$target_url = "http://72.61.229.236/api" . $path;

// Append query parameters if any exist
$queryString = $_SERVER['QUERY_STRING'];
// Remove the 'path=' parameter from the query string
$queryString = preg_replace('/(^|&)path=[^&]*/', '', $queryString);
$queryString = ltrim($queryString, '&');

if (!empty($queryString)) {
    $target_url .= '?' . $queryString;
}

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $target_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, false);

// Forward the request method (POST, GET, etc)
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'OPTIONS') {
    // Handle preflight requests gracefully
    http_response_code(200);
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    exit;
}
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);

// Forward the request body (for POST/PUT)
$input = file_get_contents('php://input');
if (!empty($input)) {
    curl_setopt($ch, CURLOPT_POSTFIELDS, $input);
}

// Set custom headers to bypass backend checks
$headers = array(
    'Origin: https://admin.townsgenie.in',
    'Referer: https://admin.townsgenie.in/',
    'Content-Type: application/json'
);

// We need to pass the Authorization header!
if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
    $headers[] = 'Authorization: ' . $_SERVER['HTTP_AUTHORIZATION'];
} else {
    // Sometimes apache strips it, so check getallheaders()
    if (function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        if (isset($requestHeaders['Authorization'])) {
            $headers[] = 'Authorization: ' . $requestHeaders['Authorization'];
        }
    }
}

curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

// Execute proxy request
$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);

// Handle errors
if (curl_errno($ch)) {
    http_response_code(503);
    echo json_encode(['error' => 'Proxy connection failed: ' . curl_error($ch)]);
    curl_close($ch);
    exit;
}

curl_close($ch);

// Send back the response
http_response_code($http_code);
header('Content-Type: application/json');
echo $response;
?>
