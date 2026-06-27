// main.js — bootstrap (impuro). Carrega conteúdo + save, monta o estado e renderiza.
import { CONFIG } from "./config.js";
import { loadContent } from "./content/registry.js";
import { load } from "./persistence/save.js";
import { initUI } from "./ui/ui.js";

function boot() {
  const content = loadContent(CONFIG.env); // valida o conteúdo no boot
  if (content.report && content.report.skipped > 0) {
    console.warn(`[conteúdo] ${content.report.skipped} desafio(s) descartado(s) por inconsistência.`);
  }
  const save = load();

  const APP = {
    cfg: CONFIG,
    content,
    save,
    run: null,
    menu: "home",
    ui: { tutIdx: 0, report: null },
  };
  window.__ARQUITETO = APP; // útil para depuração
  initUI(APP);
}

boot();
