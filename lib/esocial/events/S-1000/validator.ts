import { S1000Props } from './schema';
import { RULES } from './rules';

export function validateS1000(data: S1000Props): string[] {
  const errors: string[] = [];

  // 1. Validar tpInsc x natJurid
  if (data.tpInsc === RULES.TP_INSC.CPF && data.natJurid) {
    errors.push('Empregador Pessoa Física (CPF) NÃO deve informar Natureza Jurídica.');
  }
  if (data.tpInsc === RULES.TP_INSC.CNPJ && !data.natJurid) {
    errors.push('Empregador Pessoa Jurídica (CNPJ) DEVE informar Natureza Jurídica.');
  }

  // 2. Validar Classificação Tributária Bloqueada
  if (data.classTrib === RULES.CLASS_TRIB.BLOCKED_DEFAULT) {
    errors.push(`Classificação Tributária '${data.classTrib}' não é permitida neste fluxo.`);
  }

  // 3. Validar Campos Obrigatórios Básicos
  if (!data.nrInsc) errors.push('Número de Inscrição é obrigatório.');
  if (!data.classTrib) errors.push('Classificação Tributária é obrigatória.');
  if (!data.iniValid) errors.push('Início de Validade é obrigatório.');

  return errors;
}
