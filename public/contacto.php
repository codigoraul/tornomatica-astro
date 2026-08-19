<?php

declare(strict_types=1);

$BASE_PATH = '';
$SITE_URL = (isset($_SERVER['HTTP_HOST']) && is_string($_SERVER['HTTP_HOST']) && $_SERVER['HTTP_HOST'] !== '')
  ? ('https://' . $_SERVER['HTTP_HOST'])
  : 'https://tornomatica.cl';

$TO_EMAILS_BASE = 'info@tornomatica.cl';
$TO_EMAIL = $TO_EMAILS_BASE;
$FROM_EMAIL = 'info@tornomatica.cl';
$FROM_NAME = 'Tornomatica';
$BCC_EMAILS = '';

$CONFIG_USED_PATH = '';

$ENV_BASE_PATH = getenv('ASTRO_BASE');
if ($ENV_BASE_PATH !== false && $ENV_BASE_PATH !== '') {
  $BASE_PATH = $ENV_BASE_PATH;
}

$ENV_SITE_URL = getenv('SITE_URL');
if ($ENV_SITE_URL !== false && $ENV_SITE_URL !== '') {
  $SITE_URL = $ENV_SITE_URL;
}

$ENV_TO_EMAIL = getenv('CONTACT_TO_EMAIL');
if ($ENV_TO_EMAIL !== false && $ENV_TO_EMAIL !== '') {
  $TO_EMAIL = $TO_EMAILS_BASE . ', ' . $ENV_TO_EMAIL;
}

$ENV_FROM_EMAIL = getenv('CONTACT_FROM_EMAIL');
if ($ENV_FROM_EMAIL !== false && $ENV_FROM_EMAIL !== '') {
  $FROM_EMAIL = $ENV_FROM_EMAIL;
}

$ENV_FROM_NAME = getenv('CONTACT_FROM_NAME');
if ($ENV_FROM_NAME !== false && $ENV_FROM_NAME !== '') {
  $FROM_NAME = $ENV_FROM_NAME;
}

$ENV_BCC_EMAILS = getenv('CONTACT_BCC_EMAILS');
if ($ENV_BCC_EMAILS !== false && $ENV_BCC_EMAILS !== '') {
  $BCC_EMAILS = $ENV_BCC_EMAILS;
}

$CONFIG_PATHS = [
  __DIR__ . '/contacto-config.php',
  dirname(__DIR__) . '/contacto-config.php',
];

foreach ($CONFIG_PATHS as $configPath) {
  if (is_file($configPath)) {
    $config = include $configPath;
    if (is_array($config)) {
      if (isset($config['BASE_PATH']) && is_string($config['BASE_PATH'])) $BASE_PATH = $config['BASE_PATH'];
      if (isset($config['SITE_URL']) && is_string($config['SITE_URL'])) $SITE_URL = $config['SITE_URL'];
      if (isset($config['TO_EMAIL']) && is_string($config['TO_EMAIL'])) $TO_EMAIL = $TO_EMAILS_BASE . ', ' . $config['TO_EMAIL'];
      if (isset($config['FROM_EMAIL']) && is_string($config['FROM_EMAIL'])) $FROM_EMAIL = $config['FROM_EMAIL'];
      if (isset($config['FROM_NAME']) && is_string($config['FROM_NAME'])) $FROM_NAME = $config['FROM_NAME'];
      if (isset($config['BCC_EMAILS']) && is_string($config['BCC_EMAILS'])) $BCC_EMAILS = $config['BCC_EMAILS'];
    }
    $CONFIG_USED_PATH = $configPath;
    break;
  }
}

function redirect_to(string $url): void {
  header('Location: ' . $url, true, 303);
  exit;
}

function base_url(string $siteUrl, string $basePath, string $path): string {
  $basePath = rtrim($basePath, '/');
  $path = '/' . ltrim($path, '/');
  return rtrim($siteUrl, '/') . ($basePath ? $basePath : '') . $path;
}

function contacto_url(string $siteUrl, string $basePath, string $status): string {
  $base = base_url($siteUrl, $basePath, '/contacto');
  $qs = http_build_query(['status' => $status]);
  return $base . '?' . $qs . '#contacto';
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  if (isset($_GET['debug']) && $_GET['debug'] === '1') {
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode([
      'handler' => 'contacto.php',
      'site_url' => $SITE_URL,
      'base_path' => $BASE_PATH,
      'to_email' => $TO_EMAIL,
      'from_email' => $FROM_EMAIL,
      'from_name' => $FROM_NAME,
      'bcc_emails' => $BCC_EMAILS !== '' ? $BCC_EMAILS : null,
      'config_used' => $CONFIG_USED_PATH !== '' ? basename($CONFIG_USED_PATH) : null,
      'config_used_path' => $CONFIG_USED_PATH !== '' ? $CONFIG_USED_PATH : null,
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
  }
  redirect_to(base_url($SITE_URL, $BASE_PATH, '/contacto#contacto'));
}

// Honeypot anti-spam
$gotcha = trim((string)($_POST['_gotcha'] ?? ''));
if ($gotcha !== '') {
  header('Content-Type: application/json');
  echo json_encode(['success' => true, 'message' => '¡Mensaje enviado exitosamente! Nos pondremos en contacto contigo pronto.']);
  exit;
}

$nombre = trim((string)($_POST['nombre'] ?? ''));
$empresa = trim((string)($_POST['empresa'] ?? ''));
$email = trim((string)($_POST['email'] ?? ''));
$telefono = trim((string)($_POST['telefono'] ?? ''));
$ciudad = trim((string)($_POST['ciudad'] ?? ''));
$cantidad = trim((string)($_POST['cantidad'] ?? ''));
$material = trim((string)($_POST['material'] ?? ''));
$mensaje = trim((string)($_POST['mensaje'] ?? ''));

if ($nombre === '' || $email === '' || $mensaje === '') {
  header('Content-Type: application/json');
  echo json_encode(['success' => false, 'message' => 'Por favor completa todos los campos obligatorios.']);
  exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  header('Content-Type: application/json');
  echo json_encode(['success' => false, 'message' => 'El correo electrónico ingresado no es válido.']);
  exit;
}

$subject = 'Nueva solicitud de cotización desde tornomatica.cl';

$escape = static function (string $value): string {
  return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
};

$sanitizeHeaderValue = static function (string $value): string {
  $value = str_replace(["\r", "\n"], ' ', $value);
  return trim($value);
};

$encodeDisplayName = static function (string $value) use ($sanitizeHeaderValue): string {
  $value = $sanitizeHeaderValue($value);
  if ($value === '') return '';
  return '=?UTF-8?B?' . base64_encode($value) . '?=';
};

$parseEmailList = static function (string $value) use ($sanitizeHeaderValue): array {
  $value = $sanitizeHeaderValue($value);
  if ($value === '') return [];

  $parts = preg_split('/[\s,;]+/', $value, -1, PREG_SPLIT_NO_EMPTY);
  if ($parts === false) return [];

  $emails = [];
  foreach ($parts as $part) {
    $email = $sanitizeHeaderValue($part);
    if ($email === '') continue;
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) continue;
    $emails[] = $email;
  }

  return array_values(array_unique($emails));
};

// Adjunto (plano, foto o croquis) — campo opcional "adjunto"
$ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'heic'];
$ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
];
$MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

$attachment = null; // ['filename' => ..., 'mime' => ..., 'data' => ...]
$attachmentError = null;

if (isset($_FILES['adjunto']) && is_array($_FILES['adjunto']) && $_FILES['adjunto']['error'] !== UPLOAD_ERR_NO_FILE) {
  $file = $_FILES['adjunto'];

  if ($file['error'] !== UPLOAD_ERR_OK) {
    $attachmentError = 'No se pudo recibir el archivo adjunto. Intenta nuevamente.';
  } elseif (!is_uploaded_file($file['tmp_name'])) {
    $attachmentError = 'No se pudo procesar el archivo adjunto.';
  } elseif ($file['size'] > $MAX_FILE_BYTES) {
    $attachmentError = 'El archivo adjunto supera el tamaño máximo permitido (10 MB).';
  } else {
    $originalName = is_string($file['name']) ? $file['name'] : 'adjunto';
    $extension = strtolower((string)pathinfo($originalName, PATHINFO_EXTENSION));

    $mimeType = 'application/octet-stream';
    if (function_exists('finfo_open')) {
      $finfo = finfo_open(FILEINFO_MIME_TYPE);
      if ($finfo !== false) {
        $detected = finfo_file($finfo, $file['tmp_name']);
        if (is_string($detected) && $detected !== '') $mimeType = $detected;
        finfo_close($finfo);
      }
    }

    if (!in_array($extension, $ALLOWED_EXTENSIONS, true) || !in_array($mimeType, $ALLOWED_MIME_TYPES, true)) {
      $attachmentError = 'Formato de archivo no permitido. Sube un PDF, JPG, PNG, WEBP o HEIC.';
    } else {
      $data = file_get_contents($file['tmp_name']);
      if ($data === false) {
        $attachmentError = 'No se pudo leer el archivo adjunto.';
      } else {
        $safeName = preg_replace('/[^A-Za-z0-9._-]/', '_', $originalName);
        if (!is_string($safeName) || $safeName === '') $safeName = 'adjunto.' . $extension;
        $attachment = ['filename' => $safeName, 'mime' => $mimeType, 'data' => $data];
      }
    }
  }
}

if ($attachmentError !== null) {
  header('Content-Type: application/json');
  echo json_encode(['success' => false, 'message' => $attachmentError]);
  exit;
}

$empresaCell = $empresa !== '' ? $escape($empresa) : '-';
$telefonoCell = $telefono !== '' ? $escape($telefono) : '-';
$ciudadCell = $ciudad !== '' ? $escape($ciudad) : '-';
$cantidadCell = $cantidad !== '' ? $escape($cantidad) : '-';
$materialCell = $material !== '' ? $escape($material) : '-';
$adjuntoCell = $attachment !== null ? $escape($attachment['filename']) : 'No se adjuntó archivo';
$mensajeHtml = nl2br($escape($mensaje));

$bodyHtml = '<!doctype html><html><head><meta charset="UTF-8"></head><body style="font-family:Arial,Helvetica,sans-serif; color:#111827;">'
  . '<h2 style="margin:0 0 16px; font-size:18px;">Nueva solicitud de cotización — Tornomatica</h2>'
  . '<table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; width:100%; max-width:640px;">'
  . '<tbody>'
  . '<tr><td style="padding:8px 10px; border:1px solid #E5E7EB; font-weight:700; width:180px;">Nombre</td><td style="padding:8px 10px; border:1px solid #E5E7EB;">' . $escape($nombre) . '</td></tr>'
  . '<tr><td style="padding:8px 10px; border:1px solid #E5E7EB; font-weight:700;">Empresa</td><td style="padding:8px 10px; border:1px solid #E5E7EB;">' . $empresaCell . '</td></tr>'
  . '<tr><td style="padding:8px 10px; border:1px solid #E5E7EB; font-weight:700;">Email</td><td style="padding:8px 10px; border:1px solid #E5E7EB;">' . $escape($email) . '</td></tr>'
  . '<tr><td style="padding:8px 10px; border:1px solid #E5E7EB; font-weight:700;">Teléfono</td><td style="padding:8px 10px; border:1px solid #E5E7EB;">' . $telefonoCell . '</td></tr>'
  . '<tr><td style="padding:8px 10px; border:1px solid #E5E7EB; font-weight:700;">Ciudad</td><td style="padding:8px 10px; border:1px solid #E5E7EB;">' . $ciudadCell . '</td></tr>'
  . '<tr><td style="padding:8px 10px; border:1px solid #E5E7EB; font-weight:700;">Cantidad estimada</td><td style="padding:8px 10px; border:1px solid #E5E7EB;">' . $cantidadCell . '</td></tr>'
  . '<tr><td style="padding:8px 10px; border:1px solid #E5E7EB; font-weight:700;">Material</td><td style="padding:8px 10px; border:1px solid #E5E7EB;">' . $materialCell . '</td></tr>'
  . '<tr><td style="padding:8px 10px; border:1px solid #E5E7EB; font-weight:700;">Adjunto</td><td style="padding:8px 10px; border:1px solid #E5E7EB;">' . $adjuntoCell . '</td></tr>'
  . '<tr><td style="padding:8px 10px; border:1px solid #E5E7EB; font-weight:700; vertical-align:top;">Mensaje</td><td style="padding:8px 10px; border:1px solid #E5E7EB;">' . $mensajeHtml . '</td></tr>'
  . '</tbody></table>'
  . '</body></html>';

$bodyText = "Nueva solicitud de cotización — Tornomatica\n\n"
  . "Nombre: {$nombre}\n"
  . "Empresa: " . ($empresa !== '' ? $empresa : '-') . "\n"
  . "Email: {$email}\n"
  . "Teléfono: " . ($telefono !== '' ? $telefono : '-') . "\n"
  . "Ciudad: " . ($ciudad !== '' ? $ciudad : '-') . "\n"
  . "Cantidad estimada: " . ($cantidad !== '' ? $cantidad : '-') . "\n"
  . "Material: " . ($material !== '' ? $material : '-') . "\n"
  . "Adjunto: " . ($attachment !== null ? $attachment['filename'] : 'No se adjuntó archivo') . "\n\n"
  . "Mensaje:\n{$mensaje}\n";

$altBoundary = 'tornomatica_alt_' . bin2hex(random_bytes(12));
$altBody = "--{$altBoundary}\r\n"
  . "Content-Type: text/plain; charset=UTF-8\r\n"
  . "Content-Transfer-Encoding: 8bit\r\n\r\n"
  . $bodyText . "\r\n\r\n"
  . "--{$altBoundary}\r\n"
  . "Content-Type: text/html; charset=UTF-8\r\n"
  . "Content-Transfer-Encoding: 8bit\r\n\r\n"
  . $bodyHtml . "\r\n\r\n"
  . "--{$altBoundary}--\r\n";

$headers = [];
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Date: ' . date(DATE_RFC2822);
$host = parse_url($SITE_URL, PHP_URL_HOST);
if (!is_string($host) || $host === '') {
  $host = 'tornomatica.cl';
}
$headers[] = 'Message-ID: <' . bin2hex(random_bytes(16)) . '@' . $host . '>';
$headers[] = 'From: ' . $encodeDisplayName($FROM_NAME) . ' <' . $sanitizeHeaderValue($FROM_EMAIL) . '>';
$replyToName = $encodeDisplayName($nombre);
$replyToEmail = $sanitizeHeaderValue($email);
$headers[] = 'Reply-To: ' . ($replyToName !== '' ? ($replyToName . ' ') : '') . '<' . $replyToEmail . '>';

$toEmails = $parseEmailList($TO_EMAIL);
$toHeader = $toEmails !== [] ? implode(', ', $toEmails) : $sanitizeHeaderValue($TO_EMAIL);

$bccEmails = $parseEmailList($BCC_EMAILS);
if ($bccEmails !== []) {
  $headers[] = 'Bcc: ' . implode(', ', $bccEmails);
}

if ($attachment !== null) {
  // multipart/mixed: contiene el multipart/alternative (texto+html) y el adjunto
  $mixedBoundary = 'tornomatica_mixed_' . bin2hex(random_bytes(12));
  $headers[] = 'Content-Type: multipart/mixed; boundary="' . $mixedBoundary . '"';

  $encodedFile = chunk_split(base64_encode($attachment['data']));
  $attachmentFilename = $sanitizeHeaderValue($attachment['filename']);

  $body = "--{$mixedBoundary}\r\n"
    . "Content-Type: multipart/alternative; boundary=\"{$altBoundary}\"\r\n\r\n"
    . $altBody . "\r\n"
    . "--{$mixedBoundary}\r\n"
    . "Content-Type: {$attachment['mime']}; name=\"{$attachmentFilename}\"\r\n"
    . "Content-Transfer-Encoding: base64\r\n"
    . "Content-Disposition: attachment; filename=\"{$attachmentFilename}\"\r\n\r\n"
    . $encodedFile . "\r\n"
    . "--{$mixedBoundary}--\r\n";
} else {
  $headers[] = 'Content-Type: multipart/alternative; boundary="' . $altBoundary . '"';
  $body = $altBody;
}

$params = '-f ' . $sanitizeHeaderValue($FROM_EMAIL);
$ok = @mail($toHeader, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, implode("\r\n", $headers), $params);
if (!$ok) {
  $ok = @mail($toHeader, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, implode("\r\n", $headers));
}

header('Content-Type: application/json');
if ($ok) {
  echo json_encode(['success' => true, 'message' => '¡Mensaje enviado exitosamente! Nos pondremos en contacto contigo pronto.']);
  exit;
}

echo json_encode(['success' => false, 'message' => 'No se pudo enviar el mensaje. Por favor intenta nuevamente o contáctanos por teléfono.']);
