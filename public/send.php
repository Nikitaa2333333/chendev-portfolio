<?php
/**
 * Приём заявки с /order/ → сообщение в Telegram.
 *
 * ТОКЕН ЗДЕСЬ НЕ ХРАНИТСЯ. Репозиторий публичный, а деплой (FTP-Deploy-Action)
 * синхронизирует public_html с dist/ и стирает всё лишнее — поэтому конфиг
 * лежит ЭТАЖОМ ВЫШЕ корня сайта, куда деплой не дотягивается:
 *
 *   /domains/chendev1.ru/tg-config.php   ← залить по FTP ОДИН РАЗ вручную
 *
 *   <?php return ['token' => '123456:AA...', 'chat_id' => '123456789'];
 *
 * Файл вне public_html — по HTTP его не скачать даже зная имя.
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit(json_encode(['ok' => false, 'error' => 'method']));
}

// Ловушка для ботов: поле спрятано от людей (CSS), заполнить его может только
// автозаполнялка спамера. Отвечаем «успех», чтобы бот не подбирал обход.
if (!empty($_POST['company'])) {
    exit(json_encode(['ok' => true]));
}

$name  = trim((string)($_POST['name']  ?? ''));
$phone = trim((string)($_POST['phone'] ?? ''));
$about = trim((string)($_POST['about'] ?? ''));

$errors = [];
if ($name === '' || mb_strlen($name) > 100) {
    $errors['name'] = 'Как к вам обращаться?';
}
// Телефон принимаем в любом виде, проверяем только количество цифр (10–15).
$digits = preg_replace('/\D+/', '', $phone);
if (strlen($digits) < 10 || strlen($digits) > 15) {
    $errors['phone'] = 'Проверьте номер телефона';
}
if (mb_strlen($about) > 1000) {
    $errors['about'] = 'Слишком длинно';
}

if ($errors) {
    http_response_code(422);
    exit(json_encode(['ok' => false, 'errors' => $errors], JSON_UNESCAPED_UNICODE));
}

$configPath = __DIR__ . '/../tg-config.php';
if (!is_file($configPath)) {
    error_log('send.php: нет tg-config.php этажом выше public_html');
    http_response_code(500);
    exit(json_encode(['ok' => false, 'error' => 'config'], JSON_UNESCAPED_UNICODE));
}
$config = require $configPath;

// HTML-режим Telegram: экранируем то, что пришло от пользователя.
$esc = static fn (string $s): string => htmlspecialchars($s, ENT_NOQUOTES, 'UTF-8');

$lines = [
    '<b>Заявка с сайта</b>',
    '',
    'Имя: ' . $esc($name),
    'Телефон: ' . $esc($phone),
];
if ($about !== '') {
    $lines[] = 'Чем занимается: ' . $esc($about);
}

$ch = curl_init('https://api.telegram.org/bot' . $config['token'] . '/sendMessage');
curl_setopt_array($ch, [
    CURLOPT_POST           => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => 10,
    CURLOPT_POSTFIELDS     => [
        'chat_id'    => $config['chat_id'],
        'text'       => implode("\n", $lines),
        'parse_mode' => 'HTML',
    ],
]);
$response = curl_exec($ch);
$status   = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($status !== 200) {
    // Заявку терять нельзя: пишем в лог, человеку отвечаем честной ошибкой.
    error_log('send.php: Telegram ответил ' . $status . ' — ' . (string)$response);
    http_response_code(502);
    exit(json_encode(['ok' => false, 'error' => 'telegram'], JSON_UNESCAPED_UNICODE));
}

echo json_encode(['ok' => true]);
