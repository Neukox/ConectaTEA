const Periodos = {
    HOJE: "HOJE",
    SEMANAL: "SEMANAL",
    MENSAL: "MENSAL",
} as const;

export type PeriodoType = typeof Periodos[keyof typeof Periodos];

export { Periodos };