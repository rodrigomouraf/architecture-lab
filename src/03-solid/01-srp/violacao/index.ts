import * as sql from 'mssql';
import nodemailer from 'nodemailer';

export class Cliente {
  clienteId: number
  nome: string
  email: string
  cpf: string
  dataCadastro: Date

  constructor(
    clienteId: number,
    nome: string,
    email: string,
    cpf: string,
    dataCadastro: Date,
  ) {
    this.clienteId = clienteId
    this.nome = nome
    this.email = email
    this.cpf = cpf
    this.dataCadastro = dataCadastro
  }

  validar(): void {
    if (!this.email.includes('@')) {
      throw new Error('Cliente com e-mail invalido')
    }

    if (this.cpf.length !== 11) {
      throw new Error('Cliente com CPF invalido')
    }
  }
}

export class ClienteRepositorio {
  async salvar(cliente: Cliente) {
    const configuracaoBanco: sql.config = {
      user: 'sa',
      password: 'MinhaSenha',
      server: 'localhost',
      database: 'MinhaBase',
      options: {
        trustServerCertificate: true,
      },
    }

    const conexao = new sql.ConnectionPool(configuracaoBanco)

    try {
      await conexao.connect()

      const comandoSql = `
        INSERT INTO CLIENTE (NOME, EMAIL, CPF, DATACADASTRO)
        VALUES (
          '${cliente.nome}',
          '${cliente.email}',
          '${cliente.cpf}',
          '${cliente.dataCadastro.toISOString()}'
        )
      `

      await conexao.request().query(comandoSql)
    } finally {
      await conexao.close()
    }
  }
}

export class EmailServico {
  async enviarBoasVindas(email: string) {
    const transportador = nodemailer.createTransport({
      host: 'smtp.google.com',
      port: 25,
      secure: false,
      auth: {
        user: 'empresa@empresa.com',
        pass: 'MinhaSenha',
      },
    });

    await transportador.sendMail({
      from: 'empresa@empresa.com',
      to: email,
      subject: 'Bem-vindo',
      text: 'Parabens! Voce esta cadastrado.',
    });
  }
}

export class ClienteServico {
  constructor(
    private readonly repositorio: ClienteRepositorio,
    private readonly emailServico: EmailServico,
  ) {}

  async adicionarCliente(cliente: Cliente): Promise<string> {
    cliente.validar()

    await this.repositorio.salvar(cliente)
    await this.emailServico.enviarBoasVindas(cliente.email)

    return 'Cliente cadastrado com sucesso!'
  }
}

const cliente = new Cliente(
  1,
  'Joao da Silva',
  'joao@email.com',
  '12345678901',
  new Date(),
);

const clienteServico = new ClienteServico(
  new ClienteRepositorio(),
  new EmailServico(),
);

clienteServico
  .adicionarCliente(cliente)
  .then((resultado) => console.log(resultado))
  .catch((erro: unknown) => console.error('Erro ao cadastrar cliente:', erro))
