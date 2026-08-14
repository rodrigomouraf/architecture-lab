export class EmailValidator {
  validar(email: string): boolean {
    return email.includes('@')
  }
}
