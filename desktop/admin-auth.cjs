'use strict';
// This file runs ONLY inside Electron's trusted main process, never in Vite or
// GitHub Pages. A password is deliberately not bundled or stored in plaintext.
const { randomBytes, scryptSync, timingSafeEqual } = require('node:crypto');
const { readFileSync, writeFileSync, mkdirSync } = require('node:fs');
const { dirname } = require('node:path');

const MAX_FAILS = 5;
const LOCK_MS = 15 * 60 * 1000;
const HASH_SIZE = 64;
const SCRYPT = { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const MIN_LENGTH = 12;

function validPassword(password) {
  return typeof password === 'string' &&
    password.length >= MIN_LENGTH && password.length <= 128 &&
    /[A-Za-z\u3131-\u318e\uac00-\ud7a3]/u.test(password) && /\d/.test(password);
}

function readCredential(path) {
  let raw;
  try {
    raw = readFileSync(path, 'utf8');
  } catch (e) {
    if (e.code === 'ENOENT') return null;
    throw e;
  }
  if (raw.length > 2048) throw new Error('INVALID_ADMIN_CREDENTIAL_FILE');
  const value = JSON.parse(raw);
  if (value.version !== 1 || !/^[a-f0-9]{32}$/.test(value.salt) ||
      !/^[a-f0-9]{128}$/.test(value.hash)) throw new Error('INVALID_ADMIN_CREDENTIAL_FILE');
  return value;
}

function createAdminAuth(path, options = {}) {
  let failures = 0;
  let lockedUntil = 0;
  const now = options.now || Date.now;

  function status() {
    // Invalid storage always fails closed. Never claim an absent password is safe.
    let configured;
    try { configured = readCredential(path) !== null; }
    catch { return { ready: false, configured: true, error: '관리자 인증 파일 오류: 담당자가 복구해야 합니다.' }; }
    return { ready: true, configured, lockedSeconds: Math.max(0, Math.ceil((lockedUntil - now()) / 1000)) };
  }

  function setup(password, confirmation) {
    if (!validPassword(password)) return { ok: false, message: '비밀번호는 12~128자이며 문자와 숫자를 포함해야 합니다.' };
    if (password !== confirmation) return { ok: false, message: '비밀번호 확인이 일치하지 않습니다.' };
    if (!status().ready) return { ok: false, message: '관리자 인증 파일을 확인할 수 없습니다.' };
    if (status().configured) return { ok: false, message: '이 PC에는 이미 관리자 비밀번호가 설정되었습니다.' };
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password, Buffer.from(salt, 'hex'), HASH_SIZE, SCRYPT).toString('hex');
    try {
      mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
      // exclusive create stops two windows racing to replace an existing secret.
      writeFileSync(path, JSON.stringify({ version: 1, salt, hash }), { flag: 'wx', mode: 0o600 });
      return { ok: true, message: '관리자 비밀번호가 이 Windows 사용자 프로필에 설정되었습니다.' };
    } catch {
      return { ok: false, message: '인증 정보를 안전하게 저장하지 못했습니다. PC 권한을 확인하세요.' };
    }
  }

  function verify(password) {
    if (now() < lockedUntil) {
      return { ok: false, message: '로그인 시도 횟수를 초과했습니다. 잠시 후 다시 시도하세요.', lockedSeconds: Math.ceil((lockedUntil - now())/1000) };
    }
    let credential;
    try { credential = readCredential(path); }
    catch { return { ok: false, message: '관리자 인증 파일을 확인할 수 없습니다.' }; }
    if (!credential) return { ok: false, message: '먼저 관리자 비밀번호를 설정하세요.' };
    const supplied = typeof password === 'string' && password.length <= 128 ? password : '';
    const actual = scryptSync(supplied, Buffer.from(credential.salt, 'hex'), HASH_SIZE, SCRYPT);
    const expected = Buffer.from(credential.hash, 'hex');
    if (timingSafeEqual(actual, expected)) {
      failures = 0;
      lockedUntil = 0;
      return { ok: true };
    }
    failures++;
    if (failures >= MAX_FAILS) {
      failures = 0;
      lockedUntil = now() + LOCK_MS;
      return { ok: false, message: '5회 실패하여 15분간 관리자 로그인이 제한됩니다.', lockedSeconds: Math.ceil(LOCK_MS / 1000) };
    }
    return { ok: false, message: '비밀번호가 일치하지 않습니다.' };
  }

  return { status, setup, verify };
}
module.exports = { createAdminAuth, validPassword, MIN_LENGTH, LOCK_MS };
