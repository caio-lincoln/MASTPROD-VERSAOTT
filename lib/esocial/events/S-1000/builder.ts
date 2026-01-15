import { S1000Props } from './schema';

export function buildS1000XML(data: S1000Props): string {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtInfoEmpregador/v_S_01_02_00">\n`;
  
  // ID deve ter 36 caracteres: "ID" + tpInsc(1) + nrInsc(14) + timestamp(YYYYMMDDHHMMSS) + seq(5)
  const idDoc = data.nrInsc.padEnd(14, '0');
  const timestamp = new Date().toISOString().replace(/\D/g, '').substring(0, 14);
  const id = `ID${data.tpInsc}${idDoc}${timestamp}00001`; // ID Simplificado para exemplo
  
  xml += `  <evtInfoEmpregador Id="${id}">\n`;
  
  // ideEvento
  xml += `    <ideEvento>\n`;
  xml += `      <tpAmb>1</tpAmb>\n`; // 1 - Produção
  xml += `      <procEmi>1</procEmi>\n`;
  xml += `      <verProc>1.0.0</verProc>\n`;
  xml += `    </ideEvento>\n`;

  // ideEmpregador
  xml += `    <ideEmpregador>\n`;
  xml += `      <tpInsc>${data.tpInsc}</tpInsc>\n`;
  xml += `      <nrInsc>${data.nrInsc}</nrInsc>\n`;
  xml += `    </ideEmpregador>\n`;

  // infoEmpregador
  xml += `    <infoEmpregador>\n`;
  xml += `      <inclusao>\n`;
  xml += `        <idePeriodo>\n`;
  xml += `          <iniValid>${data.iniValid}</iniValid>\n`;
  if (data.fimValid) {
    xml += `          <fimValid>${data.fimValid}</fimValid>\n`;
  }
  xml += `        </idePeriodo>\n`;
  
  xml += `        <infoCadastro>\n`;
  xml += `          <classTrib>${data.classTrib}</classTrib>\n`;
  
  if (data.natJurid) {
    xml += `          <natJurid>${data.natJurid}</natJurid>\n`;
  }
  
  // Indicadores
  if (data.indCoop) xml += `          <indCoop>1</indCoop>\n`;
  if (data.indConstr) xml += `          <indConstr>1</indConstr>\n`;
  if (data.indDesFolha) xml += `          <indDesFolha>1</indDesFolha>\n`;
  if (data.indEntEd) xml += `          <indEntEd>1</indEntEd>\n`; // Verificar layout atual se é indEntEd ou mudou
  if (data.indEtt) xml += `          <indEtt>1</indEtt>\n`;

  // infoProdRural
  if (data.infoProdRural) {
    xml += `          <infoProdRural>\n`;
    xml += `            <indPPS>${data.infoProdRural.indPPS}</indPPS>\n`;
    xml += `            <indCPF>${data.infoProdRural.indCPF}</indCPF>\n`;
    xml += `          </infoProdRural>\n`;
  }

  xml += `        </infoCadastro>\n`;
  xml += `      </inclusao>\n`;
  xml += `    </infoEmpregador>\n`;
  xml += `  </evtInfoEmpregador>\n`;
  xml += `</eSocial>`;

  return xml;
}
