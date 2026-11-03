import { S1000Props } from './schema';
import { ambienteAtual, eventNamespace, generateEventId } from '../common';

export function buildS1000XML(data: S1000Props): string {
  // 1) Fail-fast: obrigatórios mínimos para montar o evento
  if (data.tpInsc === undefined || data.tpInsc === null) {
    throw new Error("S-1000: 'tpInsc' é obrigatório.");
  }
  if (!data.nrInsc) {
    throw new Error("S-1000: 'nrInsc' é obrigatório.");
  }
  if (!data.classTrib) {
    throw new Error("S-1000: 'classTrib' é obrigatório.");
  }
  if (!data.iniValid) {
    throw new Error("S-1000: 'iniValid' é obrigatório (formato YYYY-MM).");
  }

  // 2) Validações de formato simples
  if (data.tpInsc !== '1' && data.tpInsc !== '2') {
    throw new Error("S-1000: 'tpInsc' inválido. Use 1=CNPJ ou 2=CPF.");
  }

  const onlyDigitsNrInsc = String(data.nrInsc).replace(/\D/g, '');
  const natJuridClean = data.natJurid ? data.natJurid.replace(/\D/g, '') : undefined;

  if (data.tpInsc === '1') {
    if (!natJuridClean) {
      throw new Error("S-1000: 'natJurid' é obrigatório para CNPJ para aplicar a regra de 8 ou 14 dígitos do nrInsc.");
    }

    const natJuridFullCnpj = ['1015', '1040', '1074', '1163', '1341'];
    const len = onlyDigitsNrInsc.length;

    if (natJuridFullCnpj.includes(natJuridClean)) {
      if (len !== 14) {
        throw new Error("S-1000: para natureza jurídica especial, 'nrInsc' (CNPJ) deve ter 14 dígitos.");
      }
    } else {
      if (len !== 8) {
        throw new Error("S-1000: para demais naturezas jurídicas, 'nrInsc' (CNPJ) deve ter 8 dígitos (raiz/base).");
      }
    }
  }

  if (data.tpInsc === '2' && onlyDigitsNrInsc.length !== 11) {
    throw new Error("S-1000: 'nrInsc' deve ter 11 dígitos quando tpInsc=2 (CPF).");
  }

  // iniValid e fimValid no formato YYYY-MM
  const reCompet = /^\d{4}-(0[1-9]|1[0-2])$/;
  if (!reCompet.test(data.iniValid)) {
    throw new Error("S-1000: 'iniValid' inválido. Use o formato YYYY-MM (ex: 2026-01).");
  }
  if (data.fimValid && !reCompet.test(data.fimValid)) {
    throw new Error("S-1000: 'fimValid' inválido. Use o formato YYYY-MM (ex: 2026-12).");
  }

  // 3) Validação lógica de negócio (minimalista e segura)
  // Se indDesFolha=1, impede combinações claramente incompatíveis.
  // Observação: regras completas variam por cenário; mantenha isso como "guardrail".
  const classTribPermiteDesoneracao = ['02', '03', '99'].includes(data.classTrib);
  if (data.indDesFolha === true && !classTribPermiteDesoneracao) {
    throw new Error(
      `S-1000: Conflito de regra. classTrib='${data.classTrib}' não permite indDesFolha=1.`
    );
  }

  if (data.indDesFolha === undefined) {
    throw new Error("S-1000: 'indDesFolha' é obrigatório.");
  }

  if (data.indOptRegEletron === undefined) {
    throw new Error("S-1000: 'indOptRegEletron' é obrigatório.");
  }

  // 4) Id do evento (36 caracteres, nrInsc completado com zeros à direita)
  const id = generateEventId({ tpInsc: data.tpInsc, nrInsc: onlyDigitsNrInsc, documento: onlyDigitsNrInsc });

  // 5) Montagem do XML (leiaute S-1.3)
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<eSocial xmlns="${eventNamespace('evtInfoEmpregador')}">\n`;
  xml += `  <evtInfoEmpregador Id="${id}">\n`;

  // ideEvento
  xml += `    <ideEvento>\n`;
  xml += `      <tpAmb>${ambienteAtual().tpAmb}</tpAmb>\n`;
  xml += `      <procEmi>1</procEmi>\n`;
  xml += `      <verProc>1.0.0</verProc>\n`;
  xml += `    </ideEvento>\n`;

  // ideEmpregador
  xml += `    <ideEmpregador>\n`;
  xml += `      <tpInsc>${data.tpInsc}</tpInsc>\n`;
  xml += `      <nrInsc>${onlyDigitsNrInsc}</nrInsc>\n`;
  xml += `    </ideEmpregador>\n`;

  // infoEmpregador / inclusao / idePeriodo
  xml += `    <infoEmpregador>\n`;
  xml += `      <inclusao>\n`;
  xml += `        <idePeriodo>\n`;
  xml += `          <iniValid>${data.iniValid}</iniValid>\n`;
  if (data.fimValid) {
    xml += `          <fimValid>${data.fimValid}</fimValid>\n`;
  }
  xml += `        </idePeriodo>\n`;

  // infoCadastro
  xml += `        <infoCadastro>\n`;
  xml += `          <classTrib>${data.classTrib}</classTrib>\n`;

  // natJurid não faz parte do infoCadastro do S-1000

  // opcionais: só se existirem
  if (data.indCoop !== undefined) {
    xml += `          <indCoop>${data.indCoop ? '1' : '0'}</indCoop>\n`;
  }

  if (data.indConstr !== undefined) {
    xml += `          <indConstr>${data.indConstr ? '1' : '0'}</indConstr>\n`;
  }

  xml += `          <indDesFolha>${data.indDesFolha ? '1' : '0'}</indDesFolha>\n`;
  xml += `          <indOptRegEletron>${data.indOptRegEletron}</indOptRegEletron>\n`;

  xml += `        </infoCadastro>\n`;
  xml += `      </inclusao>\n`;
  xml += `    </infoEmpregador>\n`;
  xml += `  </evtInfoEmpregador>\n`;
  xml += `</eSocial>`;

  return xml;
}
