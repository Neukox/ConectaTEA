/**
 * Utilitários para manipulação e cálculo de datas.
 */

import { PeriodoType } from "../constants/periodo.constant";

export default class DateUtils {
  /**
   * Método para calcular a idade com base na data de nascimento fornecida.
   * @param {string | number | Date} date Data de nascimento como Date, string ou número (timestamp).
   * @returns Idade calculada em anos.
   * @throws Erro se a data fornecida for inválida.
   */
  static parseDate(date: string | number | Date): Date {
    if (date instanceof Date) {
      const d = new Date(date.getTime());
      if (isNaN(d.getTime())) throw new Error("Data inválida");
      return d;
    }

    if (typeof date === "number") {
      const d = new Date(date);
      if (isNaN(d.getTime())) throw new Error("Data inválida");
      return d;
    }

    if (typeof date === "string") {
      const d = new Date(date);
      if (isNaN(d.getTime())) throw new Error("Data inválida");
      return d;
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) throw new Error("Data inválida");
    return parsedDate;
  }

  /**
   * Calcula a idade com base na data de nascimento fornecida.
   * @param birthDate Data de nascimento como Date, string ou número (timestamp).
   * @returns Idade calculada em anos.
   * @throws Erro se a data fornecida for inválida.
   */
  static calculateAge(birthDate: Date | string | number): number {
    const birth = this.parseDate(birthDate);
    const today = new Date();

    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    const dayDiff = today.getDate() - birth.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    return age;
  }

  /**
   * Converte um período em um intervalo de datas.
   * O intervalo de datas é definido com base no período fornecido.
   * Se o período for "DIARIO", a data de início e fim será o dia atual.
   * Se o período for "SEMANAL", as data de início será 7 dias atrás e a data de fim será o dia atual.
   * Se o período for "MENSAL", a data de início será 30 dias atrás e a data de fim será o dia atual.
   * @param periodo Período a ser convertido (DIARIO, SEMANAL, MENSAL).
   * @returns Objeto contendo a data de início e a data de fim do intervalo.
   */

  static periodToDateRange(periodo: PeriodoType) {
    const endDate = new Date();
    let startDate: Date;

    switch (periodo) {
      case "HOJE":
        startDate = new Date(endDate);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "SEMANAL":
        startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "MENSAL":
        startDate = new Date(endDate);
        startDate.setMonth(endDate.getMonth() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      default:
        startDate = new Date(0); // Data mínima possível
    }

    return { startDate, endDate };
  }
}
