import { CPF } from "./cpf";
import { Email } from "./email";

export type ClienteProps = {
  clienteId: number
  nome: string
  email: string
  cpf: string
  dataCadastro: Date
};

export class Cliente {
  readonly clienteId: number
  readonly nome: string
  readonly email: Email
  readonly cpf: CPF
  readonly dataCadastro: Date

  private constructor(
    clienteId: number,
    nome: string,
    email: string,
    cpf: string,
    dataCadastro: Date,
  ) {
    this.clienteId = clienteId
    this.nome = nome
    this.email = new Email(email)
    this.cpf = new CPF(cpf)
    this.dataCadastro = dataCadastro
  }

  static create(
    clienteId: number,
    nome: string,
    email: string,
    cpf: string,
    dataCadastro: Date,
  ): Cliente {
    const client = new Cliente(clienteId, nome, email, cpf, dataCadastro)

    if (!client.validar()) {
      throw new Error("Cliente inválido")
    }

    return client
  }

  // comentar sobre extender erros e usar classes mais específicas
  private validar(): boolean {
    return this.email.validar() && this.cpf.validar()
  }
}
