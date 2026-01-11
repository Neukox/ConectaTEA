import {
  differenceInDays,
  differenceInYears,
  endOfDay,
  endOfMonth,
  endOfWeek,
  intlFormat,
  parse,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";

/**
 * Utilitários para manipulação e cálculo de datas.
 */

import { PeriodoType } from "../constants/periodo.constant";

export default class DateUtils {
  static readonly IntlOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "America/Sao_Paulo",
  };

  /**
   * Método para calcular a idade com base na data de nascimento fornecida.
   * @param {string | number | Date} date Data de nascimento como Date, string ou número (timestamp).
   * @returns Idade calculada em anos.
   * @throws Erro se a data fornecida for inválida.
   */
  static parseDate(date: string | number | Date): Date {
    if (date instanceof Date) {
      return date;
    }

    if (typeof date === "number") {
      return new Date(date);
    }

    // Tenta analisar a string usando o formato ISO 8601
    const parsedDate = parse(date, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx", new Date());

    if (!isNaN(parsedDate.getTime())) {
      return parsedDate;
    }

    // Se não conseguir fazer parse, tenta usar o construtor Date padrão
    const fallbackDate = new Date(date);
    if (!isNaN(fallbackDate.getTime())) {
      return fallbackDate;
    }

    // Se tudo falhar, lança um erro
    throw new Error(`Invalid date format: ${date}`);
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

    // Usa differenceInYears do date-fns para calcular anos completos
    return differenceInYears(today, birth);
  }

  /**
   * Converte um período em um intervalo de datas.
   * O intervalo de datas é definido com base no período fornecido.
   * Se o período for "HOJE", a data de início e fim será o dia atual.
   * Se o período for "SEMANAL", as data de início será 7 dias atrás e a data de fim será o dia atual.
   * Se o período for "MENSAL", a data de início será 30 dias atrás e a data de fim será o dia atual.
   * @param periodo Período a ser convertido (HOJE, SEMANAL, MENSAL).
   * @returns Objeto contendo a data de início e a data de fim do intervalo.
   */

  static periodToDateRange(periodo: PeriodoType) {
    const now = new Date();
    let endDate: Date;
    let startDate: Date;

    switch (periodo) {
      case "HOJE":
        startDate = startOfDay(now);
        endDate = endOfDay(now);
        break;
      case "SEMANAL":
        startDate = startOfWeek(now);
        endDate = endOfWeek(now);
        break;
      case "MENSAL":
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case "SEMESTRAL":
        startDate = startOfMonth(
          new Date(now.getFullYear(), now.getMonth() - 6, 1)
        );
        endDate = endOfMonth(now);
        break;
      case "ANUAL":
        startDate = startOfMonth(
          new Date(now.getFullYear() - 1, now.getMonth(), 1)
        );
        endDate = endOfMonth(now);
        break;
      default:
        throw new Error(`Período desconhecido: ${periodo}`);
    }

    return { startDate, endDate };
  }

  /**
   * Calcula a diferença em dias entre duas datas.
   * @param startDate Data de início.
   * @param endDate Data de fim.
   * @returns Diferença em dias entre as duas datas.
   */
  static daysDifference(startDate: Date, endDate: Date): number {
    return differenceInDays(endDate, startDate);
  }

  /**
   * Formata uma data para o formato local especificado.
   * @param date Data a ser formatada (Date, string ou número).
   * @param options Opções de formatação de data (padrão: IntlOptions).
   * @param locale Localização para formatação (padrão: "pt-BR").
   * @returns Data formatada como string.
   */

  static localeDate(
    date: Date | string | number,
    options: Intl.DateTimeFormatOptions = this.IntlOptions,
    locale = "pt-BR"
  ): string {
    const d = this.parseDate(date);
    return intlFormat(d, options, { locale });
  }
}
