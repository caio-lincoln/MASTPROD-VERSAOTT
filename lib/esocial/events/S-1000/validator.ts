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
  if (data.indDesFolha === undefined) errors.push('Indicativo de Desoneração da Folha é obrigatório.');
  if (data.indOptRegEletron === undefined) {
    errors.push("Campo 'indOptRegEletron' é obrigatório conforme XSD do S-1000 (S-1.2).");
  } else if (data.indOptRegEletron !== '0' && data.indOptRegEletron !== '1') {
    errors.push("Campo 'indOptRegEletron' deve ser '0' ou '1'.");
  }

  // 4. Validar Regras de Negócio (XSD)
  // Regra indDesFolha: Pode ser igual a [1] apenas se classTrib = [02, 03, 99]. Nos demais casos, deve ser igual a [0].
  const classTribPermiteDesoneracao = ['02', '03', '99'].includes(data.classTrib);
  if (data.indDesFolha === true && !classTribPermiteDesoneracao) {
    errors.push(`Indicativo de Desoneração da Folha não é permitido para a Classificação Tributária '${data.classTrib}'.`);
  }
  if (data.indDesFolha === false && classTribPermiteDesoneracao) {
    // Aviso ou erro? O XSD diz "Pode ser igual a [1]". Não obriga a ser 1.
    // Mas diz "Nos demais casos, deve ser igual a [0]".
    // Então se classTrib NÃO permite, TEM QUE SER 0. (Já validado acima).
    // Se classTrib PERMITE, pode ser 0 ou 1. (OK).
  }

  return errors;
}
