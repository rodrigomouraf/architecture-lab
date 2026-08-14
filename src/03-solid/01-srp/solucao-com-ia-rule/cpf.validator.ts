export class CpfValidator {
  validar(cpf: string): boolean {
    return cpf.length === 11
  }
}
