const Periodos = {
  HOJE: "HOJE",
  SEMANAL: "SEMANAL",
  MENSAL: "MENSAL",
  SEMESTRAL: "SEMESTRAL",
  ANUAL: "ANUAL",
} as const;

export type PeriodoType = (typeof Periodos)[keyof typeof Periodos];

export { Periodos };
