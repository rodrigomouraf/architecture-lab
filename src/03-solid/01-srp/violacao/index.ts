import * as sql from 'mssql';
import nodemailer from 'nodemailer';

export class Cliente {
  clienteId: number;
  nome: string;
  email: string;
  cpf: string;
  dataCadastro: Date;

  constructor(
    clienteId: number,
    nome: string,
    email: string,
    cpf: string,
    dataCadastro: Date,
  ) {
    this.clienteId = clienteId;
    this.nome = nome;
    this.email = email;
    this.cpf = cpf;
    this.dataCadastro = dataCadastro;
  }

  async adicionarCliente(): Promise<string> {
    if (!this.email.includes('@')) {
      return 'Cliente com e-mail invalido';
    }

    if (this.cpf.length !== 11) {
      return 'Cliente com CPF invalido';
    }

    const configuracaoBanco: sql.config = {
      user: 'sa',
      password: 'MinhaSenha',
      server: 'localhost',
      database: 'MinhaBase',
      options: {
        trustServerCertificate: true,
      },
    };

    const conexao = new sql.ConnectionPool(configuracaoBanco);

    try {
      await conexao.connect();

      const comandoSql = `
        INSERT INTO CLIENTE (NOME, EMAIL, CPF, DATACADASTRO)
        VALUES (
          '${this.nome}',
          '${this.email}',
          '${this.cpf}',
          '${this.dataCadastro.toISOString()}'
        )
      `;

      await conexao.request().query(comandoSql);
    } finally {
      await conexao.close();
    }

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
      to: this.email,
      subject: 'Bem-vindo',
      text: 'Parabens! Voce esta cadastrado.',
    });

    return 'Cliente cadastrado com sucesso!';
  }
}

const cliente = new Cliente(
  1,
  'Joao da Silva',
  'joao@email.com',
  '12345678901',
  new Date(),
);

cliente
  .adicionarCliente()
  .then((resultado) => console.log(resultado))
  .catch((erro: unknown) => console.error('Erro ao cadastrar cliente:', erro));
