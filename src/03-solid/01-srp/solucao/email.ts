export class Email {
    public value?: string

    constructor(email: string) {
        this.value = email
    }

    public validar(): boolean {
        return this.value?.includes('@') ?? false
    }
}