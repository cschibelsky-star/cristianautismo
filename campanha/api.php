<?php
session_start();
$dir = __DIR__ . '/data';
$file = $dir . '/apoios.json';
$adminFile = $dir . '/admin.json';
if (!is_dir($dir)) { mkdir($dir, 0755, true); }
if (!file_exists($file)) { file_put_contents($file, '[]'); }

function json_out($data, $code = 200) {
  http_response_code($code);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode($data, JSON_UNESCAPED_UNICODE);
  exit;
}
function read_items($file) {
  $raw = file_get_contents($file);
  $arr = json_decode($raw, true);
  return is_array($arr) ? $arr : [];
}
function read_admin($adminFile) {
  if (!file_exists($adminFile)) { return []; }
  $raw = file_get_contents($adminFile);
  $arr = json_decode($raw, true);
  return is_array($arr) ? $arr : [];
}
function save_admin($adminFile, $data) {
  file_put_contents($adminFile, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
}
function is_admin() {
  return !empty($_SESSION['cristian_admin_ok']) && $_SESSION['cristian_admin_ok'] === true;
}
function stored_hash($adminFile) {
  $admin = read_admin($adminFile);
  return $admin['password_hash'] ?? null;
}
function validate_new_password($pass, $confirm) {
  if ($pass !== $confirm) { return 'As senhas não conferem.'; }
  if (mb_strlen($pass) < 8) { return 'A senha precisa ter no mínimo 8 caracteres.'; }
  return '';
}

$action = $_GET['action'] ?? $_POST['action'] ?? 'count';

if ($action === 'status') {
  $hash = stored_hash($adminFile);
  json_out(['ok' => true, 'setup_required' => !$hash, 'authenticated' => is_admin()]);
}

if ($action === 'count') {
  $items = read_items($file);
  json_out(['ok' => true, 'total' => count($items)]);
}

if ($action === 'save') {
  $items = read_items($file);
  $nome = trim($_POST['nome'] ?? '');
  $whatsapp = trim($_POST['whatsapp'] ?? '');
  $cidade = trim($_POST['cidade'] ?? '');
  $bairro = trim($_POST['bairro'] ?? '');
  if (!$nome || !$whatsapp || !$cidade || !$bairro) {
    json_out(['ok' => false, 'error' => 'campos_obrigatorios'], 422);
  }
  $items[] = [
    'id' => uniqid('apoio_', true),
    'nome' => $nome,
    'whatsapp' => $whatsapp,
    'email' => trim($_POST['email'] ?? ''),
    'cidade' => $cidade,
    'bairro' => $bairro,
    'tipo' => trim($_POST['tipo'] ?? ''),
    'mensagem' => trim($_POST['mensagem'] ?? ''),
    'autorizo' => ($_POST['autorizo'] ?? '') === 'sim',
    'data' => date('c'),
    'ip' => $_SERVER['REMOTE_ADDR'] ?? ''
  ];
  file_put_contents($file, json_encode($items, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
  json_out(['ok' => true, 'total' => count($items)]);
}

if ($action === 'setup') {
  if (stored_hash($adminFile) && !is_admin()) {
    json_out(['ok' => false, 'error' => 'senha_ja_cadastrada'], 403);
  }
  $pass = $_POST['pass'] ?? '';
  $confirm = $_POST['confirm'] ?? '';
  $error = validate_new_password($pass, $confirm);
  if ($error) { json_out(['ok' => false, 'message' => $error], 422); }
  save_admin($adminFile, [
    'password_hash' => password_hash($pass, PASSWORD_DEFAULT),
    'created_at' => date('c'),
    'updated_at' => date('c')
  ]);
  session_regenerate_id(true);
  $_SESSION['cristian_admin_ok'] = true;
  json_out(['ok' => true]);
}

if ($action === 'login') {
  $hash = stored_hash($adminFile);
  if (!$hash) { json_out(['ok' => false, 'error' => 'setup_required'], 409); }
  $pass = $_POST['pass'] ?? '';
  if (password_verify($pass, $hash)) {
    session_regenerate_id(true);
    $_SESSION['cristian_admin_ok'] = true;
    json_out(['ok' => true]);
  }
  json_out(['ok' => false, 'error' => 'senha_invalida'], 403);
}

if ($action === 'change_password') {
  if (!is_admin()) { json_out(['ok' => false, 'error' => 'nao_autorizado'], 403); }
  $hash = stored_hash($adminFile);
  $current = $_POST['current'] ?? '';
  $pass = $_POST['pass'] ?? '';
  $confirm = $_POST['confirm'] ?? '';
  if ($hash && !password_verify($current, $hash)) {
    json_out(['ok' => false, 'message' => 'Senha atual inválida.'], 403);
  }
  $error = validate_new_password($pass, $confirm);
  if ($error) { json_out(['ok' => false, 'message' => $error], 422); }
  $admin = read_admin($adminFile);
  $admin['password_hash'] = password_hash($pass, PASSWORD_DEFAULT);
  $admin['updated_at'] = date('c');
  save_admin($adminFile, $admin);
  json_out(['ok' => true]);
}

if ($action === 'logout') {
  $_SESSION = [];
  if (ini_get('session.use_cookies')) {
    $p = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000, $p['path'], $p['domain'], $p['secure'], $p['httponly']);
  }
  session_destroy();
  json_out(['ok' => true]);
}

if ($action === 'list') {
  if (!is_admin()) { json_out(['ok' => false, 'error' => 'nao_autorizado'], 403); }
  $items = read_items($file);
  json_out(['ok' => true, 'total' => count($items), 'items' => $items]);
}

if ($action === 'csv') {
  if (!is_admin()) { http_response_code(403); echo 'Nao autorizado'; exit; }
  $items = read_items($file);
  header('Content-Type:text/csv; charset=utf-8');
  header('Content-Disposition: attachment; filename=apoios-cristian-autismo.csv');
  $out = fopen('php://output', 'w');
  fputcsv($out, ['data', 'nome', 'whatsapp', 'email', 'cidade', 'bairro', 'tipo', 'mensagem']);
  foreach ($items as $i) {
    fputcsv($out, [$i['data'] ?? '', $i['nome'] ?? '', $i['whatsapp'] ?? '', $i['email'] ?? '', $i['cidade'] ?? '', $i['bairro'] ?? '', $i['tipo'] ?? '', $i['mensagem'] ?? '']);
  }
  fclose($out);
  exit;
}

json_out(['ok' => false, 'error' => 'acao_invalida'], 400);
