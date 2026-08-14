import { Cliente } from "./cliente"
import { ClienteRepository } from "./cliente.repository"
import { EmailService } from "./email.service"

export class ClientService {
  static async adicionarCliente(client: Cliente): Promise<string> {
    const repository = new ClienteRepository()

    await repository.adicionarCliente(client)

    await EmailService.enviar(
      'empresa@empresa.com',
      client.email.value ?? '',
      'Bem-vindo',
      'Parabens! Voce esta cadastrado.',
    )

    return 'Cliente cadastrado com sucesso!'
  }
}