// fontes.js — registro das fontes (materiais da disciplina).
// challenge.fonte.material DEVE referenciar uma chave daqui (validação cruzada).
// Conteúdo confirmado a partir dos materiais em "D:\CC\AC 2".

export const FONTES = {
  lista1_teoria: {
    titulo: "Lista 1 — Teoria (AC2 2026/1)",
    arquivo: "Lista1_AC2_Teoria_2026_1.pdf",
  },
  lista3: {
    titulo: "Lista 3 (AC2 2026/1)",
    arquivo: "Lista 3_AC2_2026_1.pdf",
  },
  gabarito_prova: {
    titulo: "Gabarito Lista/Prova",
    arquivo: "gabarito_lista_prova.pdf",
  },
  prova_resolvida: {
    titulo: "Prova resolvida",
    arquivo: "Prova resolvida.pdf",
  },
  guia: {
    titulo: "Guia completo AC2",
    arquivo: "guia_completo_AC2.pdf",
  },
  slides_aritmetica: { titulo: "Slides — Aritmética computacional", arquivo: "a_aritmetica_computacional_f.pdf" },
  slides_cla: { titulo: "Slides — CLA", arquivo: "b_CLA_fotos do quadro.pdf" },
  slides_amdahl: { titulo: "Slides — Lei de Amdahl", arquivo: "d_Lei_amdahl.pdf" },
  slides_desempenho: { titulo: "Slides — Desempenho", arquivo: "e_desempenho.pdf" },
  slides_memoria: { titulo: "Slides — Hierarquia de memória", arquivo: "f_memoria_hierarquia.pdf" },
  slides_mips_intro: { titulo: "Slides — Introdução MIPS", arquivo: "g_introducao_MIPS.pdf" },
  slides_mips_maquina: { titulo: "Slides — Linguagem de máquina MIPS", arquivo: "h_mips_ling_maquina.pdf" },
  slides_mips_funcoes: { titulo: "Slides — Funções MIPS", arquivo: "i_mips_ling_maquina_funcoes.pdf" },
  slides_datapath: { titulo: "Slides — Caminho de dados", arquivo: "j_caminho_dados_2024_1.pdf" },
};

export function fonteKeys() {
  return new Set(Object.keys(FONTES));
}
