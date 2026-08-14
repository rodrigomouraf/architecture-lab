import { Cliente, ClientService } from './exports'

const client = Cliente.create(
  1,
  'Joao da Silva',
  'joao@email.com',
  '12345678901',
  new Date(),
)

ClientService.adicionarCliente(client)
  .then(resultado => console.log(resultado))
  .catch(erro => console.error(erro))

console.log('Cliente cadastrado com sucesso!')