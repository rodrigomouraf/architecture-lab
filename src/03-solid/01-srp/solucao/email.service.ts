import nodemailer from 'nodemailer'

export class EmailService {
  static async enviar(
    de: string,
    para: string,
    assunto: string,
    mensagem: string,
  ): Promise<void> {
    const transportador = nodemailer.createTransport({
      host: 'smtp.google.com',
      port: 25,
      secure: false,
    })

    await transportador.sendMail({
      from: de,
      to: para,
      subject: assunto,
      text: mensagem,
    })
  }
}