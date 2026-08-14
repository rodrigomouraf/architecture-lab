export class CPF {
    public value?: string

    constructor(cpf: string) {
        this.value = cpf
    }

    public validar(): boolean {
        return this.value?.length === 11
    }
}