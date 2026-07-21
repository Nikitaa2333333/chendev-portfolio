<?php
/**
 * Приём заявки с /order/ → сообщение в Telegram.
 *
 * ТОКЕН ЗДЕСЬ НЕ ХРАНИТСЯ и его нет в репозитории (репо публичный).
 * tg-config.php собирается на этапе деплоя из GitHub Secrets
 * (TG_BOT_TOKEN / TG_CHAT_ID) — см. .github/workflows/deploy.yml.
 * Наружу файл не отдаётся: прямой доступ закрыт в .htaccess.
 *
 * Поменять бота или получателя — обновить секреты в GitHub и передеплоить,
 * править код не нужно.
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

$name   = trim((string)($_POST['name']   ?? ''));
$phone  = trim((string)($_POST['phone']  ?? ''));
$social = trim((string)($_POST['social'] ?? ''));
$about  = trim((string)($_POST['about']  ?? ''));

/**
 * Российский номер → +7XXXXXXXXXX. Принимаем +7…, 8…, 7… и просто 10 цифр:
 * человек не должен угадывать формат. null — если номер не похож на РФ.
 */
$normalizeRu = static function (string $raw): ?string {
    $d = preg_replace('/\D+/', '', $raw);
    if (strlen($d) === 11 && ($d[0] === '8' || $d[0] === '7')) {
        $d = substr($d, 1);
    }
    if (strlen($d) !== 10 || !preg_match('/^[3489]/', $d)) {
        return null;
    }
    return '+7' . $d;
};

$errors = [];

// Отдельные поля необязательны, но нужен хоть один способ ответить.
if ($phone === '' && $social === '') {
    $errors['phone'] = 'Оставьте телефон или ссылку на соцсеть — иначе я не смогу ответить';
} elseif ($phone !== '') {
    $normalized = $normalizeRu($phone);
    if ($normalized === null) {
        $errors['phone'] = 'Похоже, номер неполный. Российский формат: +7 900 000 00 00';
    } else {
        $phone = $normalized;
    }
}

if (mb_strlen($name) > 100)    { $errors['name']   = 'Слишком длинно'; }
if (mb_strlen($social) > 200)  { $errors['social'] = 'Слишком длинно'; }
if (mb_strlen($about) > 1000)  { $errors['about']  = 'Слишком длинно'; }

if ($errors) {
    http_response_code(422);
    exit(json_encode(['ok' => false, 'errors' => $errors], JSON_UNESCAPED_UNICODE));
}

// Конфиг ищем в двух местах: рядом (его кладёт деплой из GitHub Secrets —
// прямой доступ закрыт .htaccess) и этажом выше public_html (ручной вариант,
// если когда-нибудь захочется держать токен вне зоны деплоя).
$config = null;
foreach ([__DIR__ . '/tg-config.php', __DIR__ . '/../tg-config.php'] as $path) {
    if (is_file($path)) {
        $config = require $path;
        break;
    }
}
if (!is_array($config) || empty($config['token']) || empty($config['chat_id'])) {
    error_log('send.php: не найден или пуст tg-config.php');
    http_response_code(500);
    exit(json_encode(['ok' => false, 'error' => 'config'], JSON_UNESCAPED_UNICODE));
}

// HTML-режим Telegram: экранируем то, что пришло от пользователя.
$esc = static fn (string $s): string => htmlspecialchars($s, ENT_NOQUOTES, 'UTF-8');

$lines = ['<b>Заявка с сайта</b>', ''];
$lines[] = 'Имя: ' . ($name !== '' ? $esc($name) : '—');
if ($phone !== '')  { $lines[] = 'Телефон: ' . $esc($phone); }
if ($social !== '') { $lines[] = 'Соцсеть: ' . $esc($social); }
if ($about !== '')  { $lines[] = 'Чем занимается: ' . $esc($about); }

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
