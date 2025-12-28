/**
 * Utilitários para manipulação e cálculo de datas.
 */

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
}
