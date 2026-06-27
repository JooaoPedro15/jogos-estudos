// save.js — persistência local (casca impura fina sobre localStorage).
// Degrada de forma segura quando localStorage não está disponível.

import { migrate, newSave, sanitize } from "./migrate.js";

const KEY = "arquiteto_save_v1";

function storage() {
  try {
    if (typeof localStorage !== "undefined") return localStorage;
  } catch {
    /* acesso bloqueado */
  }
  return null;
}

export function load() {
  const s = storage();
  if (!s) return newSave();
  try {
    const raw = s.getItem(KEY);
    if (!raw) return newSave();
    return migrate(JSON.parse(raw));
  } catch {
    return newSave();
  }
}

export function save(state) {
  const s = storage();
  if (!s) return false;
  try {
    s.setItem(KEY, JSON.stringify(sanitize(state)));
    return true;
  } catch {
    return false;
  }
}

export function reset() {
  const s = storage();
  if (s) {
    try {
      s.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }
  return newSave();
}
