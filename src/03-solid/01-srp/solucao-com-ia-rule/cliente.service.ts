import type { Cliente } from './cliente.js'
import { ClienteRepository } from './cliente.repository.js'
import { CpfValidator } from './cpf.validator.js'
import { EmailService } from './email.service.js'
import { EmailValidator } from './email.validator.js'

export class ClienteService {
  constructor(
    private readonly emailValidator = new EmailValidator(),
    private readonly cpfValidator = new CpfValidator(),
    private readonly clienteRepository = new ClienteRepository(),
    private readonly emailService = new EmailService(),
  ) {}

  async adicionarCliente(cliente: Cliente): Promise<string> {
    if (!this.emailValidator.validar(cliente.email)) {
      return 'Cliente com e-mail invalido'
    }

    if (!this.cpfValidator.validar(cliente.cpf)) {
      return 'Cliente com CPF invalido'
    }

    await this.clienteRepository.salvar(cliente)
    await this.emailService.enviarBoasVindas(cliente.email)

    return 'Cliente cadastrado com sucesso!'
  }
}
