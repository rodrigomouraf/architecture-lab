import { Cliente } from './cliente.js'
import { ClienteService } from './cliente.service.js'

const cliente = new Cliente(
  1,
  'Joao da Silva',
  'joao@email.com',
  '12345678901',
  new Date(),
)

const clienteService = new ClienteService()

clienteService
  .adicionarCliente(cliente)
  .then((resultado) => console.log(resultado))
  .catch((erro: unknown) => console.error('Erro ao cadastrar cliente:', erro))
