import { S1000Props } from './schema';

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

  // 4) Geração de ID (ID + tpInsc + nrInsc + timestamp + seq)
  // Conforme solicitação: nrInsc deve ter 8 (Raiz CNPJ) ou 14 (CNPJ Completo) ou 11 (CPF), sem padding forçado para 14.
  const idDoc = onlyDigitsNrInsc; 
  const now = new Date();

  // timestamp: YYYYMMDDHHMMSS
  const yyyy = String(now.getUTCFullYear());
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(now.getUTCDate()).padStart(2, '0');
  const HH = String(now.getUTCHours()).padStart(2, '0');
  const MM = String(now.getUTCMinutes()).padStart(2, '0');
  const SS = String(now.getUTCSeconds()).padStart(2, '0');
  const timestamp = `${yyyy}${mm}${dd}${HH}${MM}${SS}`;

  const seq = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  const id = `ID${data.tpInsc}${idDoc}${timestamp}${seq}`;

  // 5) Montagem do XML (somente tags permitidas no XSD do S-1.2)
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtInfoEmpregador/v_S_01_02_00">\n`;
  xml += `  <evtInfoEmpregador Id="${id}">\n`;

  // ideEvento
  xml += `    <ideEvento>\n`;
  xml += `      <tpAmb>1</tpAmb>\n`; // 1=Produção | (ajuste se você tiver homologação)
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

  // natJurid: PROIBIDO no S-1.2 do S-1000 -> não gerar

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
