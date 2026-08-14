import * as sql from 'mssql'
import nodemailer from 'nodemailer'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('mssql', () => ({
  ConnectionPool: vi.fn(),
}))

import { Cliente } from './cliente.js'
import { ClienteRepository } from './cliente.repository.js'
import { ClienteService } from './cliente.service.js'
import { CpfValidator } from './cpf.validator.js'
import { EmailService } from './email.service.js'
import { EmailValidator } from './email.validator.js'

const clienteValido = new Cliente(
  1,
  'Joao da Silva',
  'joao@email.com',
  '12345678901',
  new Date('2026-01-01T00:00:00.000Z'),
)

describe('EmailValidator', () => {
  it('aceita um e-mail que contém arroba', () => {
    expect(new EmailValidator().validar('pessoa@email.com')).toBe(true)
  })

  it('rejeita um e-mail sem arroba', () => {
    expect(new EmailValidator().validar('pessoa-email.com')).toBe(false)
  })
})

describe('CpfValidator', () => {
  it('aceita CPF com onze caracteres', () => {
    expect(new CpfValidator().validar('12345678901')).toBe(true)
  })

  it('rejeita CPF com quantidade diferente de onze caracteres', () => {
    expect(new CpfValidator().validar('123')).toBe(false)
  })
})

describe('ClienteService', () => {
  const criarDependencias = () => ({
    emailValidator: { validar: vi.fn(() => true) },
    cpfValidator: { validar: vi.fn(() => true) },
    clienteRepository: { salvar: vi.fn(async () => undefined) },
    emailService: { enviarBoasVindas: vi.fn(async () => undefined) },
  })

  it('retorna erro e não persiste quando o e-mail é inválido', async () => {
    const dependencias = criarDependencias()
    dependencias.emailValidator.validar.mockReturnValue(false)
    const service = new ClienteService(
      dependencias.emailValidator,
      dependencias.cpfValidator,
      dependencias.clienteRepository,
      dependencias.emailService,
    )

    await expect(service.adicionarCliente(clienteValido)).resolves.toBe(
      'Cliente com e-mail invalido',
    )
    expect(dependencias.clienteRepository.salvar).not.toHaveBeenCalled()
  })

  it('retorna erro e não persiste quando o CPF é inválido', async () => {
    const dependencias = criarDependencias()
    dependencias.cpfValidator.validar.mockReturnValue(false)
    const service = new ClienteService(
      dependencias.emailValidator,
      dependencias.cpfValidator,
      dependencias.clienteRepository,
      dependencias.emailService,
    )

    await expect(service.adicionarCliente(clienteValido)).resolves.toBe(
      'Cliente com CPF invalido',
    )
    expect(dependencias.clienteRepository.salvar).not.toHaveBeenCalled()
  })

  it('persiste e envia boas-vindas para um cliente válido', async () => {
    const dependencias = criarDependencias()
    const service = new ClienteService(
      dependencias.emailValidator,
      dependencias.cpfValidator,
      dependencias.clienteRepository,
      dependencias.emailService,
    )

    await expect(service.adicionarCliente(clienteValido)).resolves.toBe(
      'Cliente cadastrado com sucesso!',
    )
    expect(dependencias.clienteRepository.salvar).toHaveBeenCalledWith(
      clienteValido,
    )
    expect(dependencias.emailService.enviarBoasVindas).toHaveBeenCalledWith(
      clienteValido.email,
    )
  })
})

describe('ClienteRepository', () => {
  it('salva os dados do cliente com parâmetros SQL', async () => {
    const query = vi.fn(async () => undefined)
    const input = vi.fn().mockReturnThis()
    const request = vi.fn(() => ({ input, query }))
    const connect = vi.fn(async () => undefined)
    const close = vi.fn(async () => undefined)
    const pool = { connect, close, request }

    vi.mocked(sql.ConnectionPool).mockImplementation(
      function ConnectionPoolMock() {
        return pool as unknown as sql.ConnectionPool
      },
    )

    await new ClienteRepository().salvar(clienteValido)

    expect(connect).toHaveBeenCalledOnce()
    expect(input).toHaveBeenCalledWith('nome', clienteValido.nome)
    expect(input).toHaveBeenCalledWith('email', clienteValido.email)
    expect(input).toHaveBeenCalledWith('cpf', clienteValido.cpf)
    expect(input).toHaveBeenCalledWith(
      'dataCadastro',
      clienteValido.dataCadastro,
    )
    expect(query).toHaveBeenCalledOnce()
    expect(close).toHaveBeenCalledOnce()
  })
})

describe('EmailService', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('envia a mensagem de boas-vindas para o cliente', async () => {
    const sendMail = vi.fn(async () => undefined)
    vi.spyOn(nodemailer, 'createTransport').mockReturnValue({
      sendMail,
    } as unknown as nodemailer.Transporter)

    await new EmailService().enviarBoasVindas(clienteValido.email)

    expect(sendMail).toHaveBeenCalledWith({
      from: 'empresa@empresa.com',
      to: clienteValido.email,
      subject: 'Bem-vindo',
      text: 'Parabens! Voce esta cadastrado.',
    })
  })
})
