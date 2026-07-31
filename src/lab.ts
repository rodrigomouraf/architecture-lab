import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

type Programa = {
  nome: string;
  executar: () => Promise<unknown>;
};

const programas = {
  casa: {
    nome: 'OOP - Classes e objetos',
    executar: () => import('./01-oop/01-classes-e-objetos/index.js'),
  },
  'srp-violacao': {
    nome: 'SOLID - SRP (violacao)',
    executar: () => import('./03-solid/01-srp/violacao/index.js'),
  },
} satisfies Record<string, Programa>;

type Apelido = keyof typeof programas;

function obterApelidos(): Apelido[] {
  return Object.keys(programas) as Apelido[];
}

function mostrarProgramas(): void {
  console.log('\nExercicios disponiveis:\n');

  obterApelidos().forEach((apelido, indice) => {
    console.log(`${indice + 1}. ${programas[apelido].nome} (${apelido})`);
  });
}

function encontrarPrograma(escolha: string): Apelido | undefined {
  const apelidos = obterApelidos();
  const numero = Number(escolha);

  if (Number.isInteger(numero) && numero >= 1 && numero <= apelidos.length) {
    return apelidos[numero - 1];
  }

  return apelidos.find((apelido) => apelido === escolha);
}

async function selecionarPrograma(): Promise<Apelido> {
  const argumento = process.argv[2];

  if (argumento) {
    const programa = encontrarPrograma(argumento);

    if (!programa) {
      throw new Error(`Exercicio desconhecido: ${argumento}`);
    }

    return programa;
  }

  mostrarProgramas();

  const terminal = createInterface({ input: stdin, output: stdout });
  const escolha = await terminal.question('\nQual exercicio deseja executar? ');
  terminal.close();

  const programa = encontrarPrograma(escolha.trim());

  if (!programa) {
    throw new Error(`Escolha invalida: ${escolha}`);
  }

  return programa;
}

async function main(): Promise<void> {
  const apelido = await selecionarPrograma();

  console.log(`\nExecutando: ${programas[apelido].nome}\n`);
  await programas[apelido].executar();
}

main().catch((erro: unknown) => {
  console.error(erro);
  process.exitCode = 1;
});
