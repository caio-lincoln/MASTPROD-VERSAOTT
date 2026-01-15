export const ESOCIAL_COMM_PACKAGE = {
  communicationPackageVersion: "v1_1_0",
  loteEnvioXsdVersion: "v1_1_1",
  retornoEnvioLoteXsdVersion: "v1_1_0",
  retornoProcessamentoLoteXsdVersion: "v1_3_0",
  retornoEventoXsdVersion: "v1_2_0",
  namespaces: {
    envioLoteEventos: "http://www.esocial.gov.br/schema/lote/eventos/envio/v1_1_1",
    retornoEnvioLoteEventos: "http://www.esocial.gov.br/schema/lote/eventos/envio/retornoEnvio/v1_1_0",
    retornoProcessamentoLote: "http://www.esocial.gov.br/schema/lote/eventos/envio/retornoProcessamento/v1_3_0",
  },
  wsdl: {
    enviarLoteEventos: {
      name: "ServicoEnviarLoteEventos",
      targetNamespace: "http://www.esocial.gov.br/servicos/empregador/lote/eventos/envio/v1_1_0",
      soapAction:
        "http://www.esocial.gov.br/servicos/empregador/lote/eventos/envio/v1_1_0/ServicoEnviarLoteEventos/EnviarLoteEventos",
      localPath: "biblioteca/comunicacao/WSDL/WsEnviarLoteEventos-v1_1_0.wsdl",
    },
  },
  xsd: {
    envioLoteEventos: "biblioteca/comunicacao/XSD/Envio/EnvioLoteEventos-v1_1_1.xsd",
    retornoEnvioLoteEventos: "biblioteca/comunicacao/XSD/RetornoEnvio/RetornoEnvioLoteEventos-v1_1_0.xsd",
    retornoEvento: "biblioteca/comunicacao/XSD/RetornoEvento/RetornoEvento-v1_2_0.xsd",
    retornoProcessamentoLote: "biblioteca/comunicacao/XSD/RetornoProcessamento/RetornoProcessamentoLote-v1_3_0.xsd",
  },
} as const

