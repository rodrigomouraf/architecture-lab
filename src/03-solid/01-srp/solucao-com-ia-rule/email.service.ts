import nodemailer from 'nodemailer'

const remetente = 'empresa@empresa.com'

export class EmailService {
  async enviarBoasVindas(email: string): Promise<void> {
    const transportador = nodemailer.createTransport({
      host: 'smtp.google.com',
      port: 25,
      secure: false,
      auth: {
        user: remetente,
        pass: 'MinhaSenha',
      },
    })

    await transportador.sendMail({
      from: remetente,
      to: email,
      subject: 'Bem-vindo',
      text: 'Parabens! Voce esta cadastrado.',
    })
  }
}
