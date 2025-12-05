<?php
$input = file_get_contents('php://input');
$data = json_decode($input, true);
if (!is_array($data) || !isset($data['message'])) {
    http_response_code(400);
    exit;
}
$line = date('c') . "\t" . str_replace(["\r","\n"], ' ', $data['message']) . "\n";
$file = __DIR__ . DIRECTORY_SEPARATOR . 'game.log';
file_put_contents($file, $line, FILE_APPEND | LOCK_EX);
header('Content-Type: application/json');
echo json_encode(['ok' => true]);
