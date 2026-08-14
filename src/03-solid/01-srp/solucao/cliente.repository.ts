import * as sql from 'mssql'
import { Cliente } from './cliente'

export class ClienteRepository {
  async adicionarCliente(cliente: Cliente): Promise<void> {
    const conexao = await sql.connect({
      user: 'sa',
      password: 'MinhaSenha',
      server: 'localhost',
      database: 'MinhaBase',
      options: {
        trustServerCertificate: true,
      },
    })

    await conexao
      .request()
      .input('nome', cliente.nome)
      .input('email', cliente.email)
      .input('cpf', cliente.cpf)
      .input('dataCad', cliente.dataCadastro)
      .query(`
        INSERT INTO CLIENTE (NOME, EMAIL, CPF, DATACADASTRO)
        VALUES (@nome, @email, @cpf, @dataCad)
      `)
  }
}