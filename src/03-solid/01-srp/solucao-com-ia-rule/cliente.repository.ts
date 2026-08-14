import * as sql from 'mssql'
import type { Cliente } from './cliente.js'

const configuracaoBanco: sql.config = {
  user: 'sa',
  password: 'MinhaSenha',
  server: 'localhost',
  database: 'MinhaBase',
  options: {
    trustServerCertificate: true,
  },
}

export class ClienteRepository {
  async salvar(cliente: Cliente): Promise<void> {
    const conexao = new sql.ConnectionPool(configuracaoBanco)

    try {
      await conexao.connect()
      await conexao
        .request()
        .input('nome', cliente.nome)
        .input('email', cliente.email)
        .input('cpf', cliente.cpf)
        .input('dataCadastro', cliente.dataCadastro)
        .query(`
          INSERT INTO CLIENTE (NOME, EMAIL, CPF, DATACADASTRO)
          VALUES (@nome, @email, @cpf, @dataCadastro)
        `)
    } finally {
      await conexao.close()
    }
  }
}
