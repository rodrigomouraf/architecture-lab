export class Cliente {
  constructor(
    public readonly clienteId: number,
    public readonly nome: string,
    public readonly email: string,
    public readonly cpf: string,
    public readonly dataCadastro: Date,
  ) {}
}
