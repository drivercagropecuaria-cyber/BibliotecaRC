export const listas = {
  areas: [
    "Vila Canabrava", "Olhos d'Agua", "Santa Maria", "Retiro Uniao", "Vereda Grande",
    "Areiao", "Rancharia", "Mimoso", "Barra do Cedro", "Fazenda Velha", "Barreiros",
    "Bahia", "Sede Administrativa"
  ],
  
  pontos: [
    "Curral de Manejo", "Balanca", "Maternidade", "Pasto de Engorda", "Reserva de Pasto",
    "Cochos e Bebedouros", "Lavoura", "Represa", "Estrada Interna", "Sede", "Escritorio",
    "Galpao de Maquinas", "Casa de Funcionarios", "Pomar", "Horta", "Aprisco", "Pocilga",
    "Almoxarifado", "Salao de Reunioes", "Entrada da Fazenda", "Casa Grande", "Igreja/Capela",
    "Cemiterio", "Trilha/Estrada de Boiada", "Outro"
  ],
  
  tiposProjeto: [
    "Documentario", "Serie", "Rotina de Campo", "Institucional", "Treinamento",
    "Evento ao Vivo", "Making Of", "Drone/Aereo", "Testemunhal", "Podcast/Audio",
    "Fotografia Still", "Time-Lapse", "BTS", "Arquivo Historico", "Outro"
  ],
  
  nucleosPecuaria: [
    "Cria", "Recria", "Engorda", "Reproducao", "Sanidade", "Nutricao", "Genetica", "Comercializacao"
  ],
  
  nucleosAgro: [
    "Agricultura", "Solo", "Pastagens", "Agua", "Irrigacao"
  ],
  
  nucleosOperacoes: [
    "Infraestrutura", "Maquinas e Implementos", "Frota", "Equipe", "Seguranca", "Logistica"
  ],
  
  nucleosMarca: [
    "Posicionamento", "Educacao e Cultura", "Produtos e Projetos", "Comunicacao"
  ],
  
  eventos: [
    "Abertura do Ano", "Estacao de Monta", "Protocolos IATF", "Desmama Geral",
    "Vacinacao em Massa", "Pesagem Oficial", "Leilao Anual", "Visita Tecnica",
    "Dia de Campo", "Festa do Vaqueiro", "Procissao", "Colheita de Silagem",
    "Reforma de Pastagem", "Entrega de Animais", "Treinamento de Equipe",
    "Auditoria", "Inventario", "Manutencao Geral", "Inauguracao", "Certificacao",
    "Premiacao", "Assembleia", "Planejamento Estrategico", "Reuniao de Resultados",
    "Confraternizacao", "Aniversario da Fazenda", "Visita de Clientes",
    "Gravacao Especial", "Lancamento", "Outro"
  ],
  
  funcoesHistoricas: [
    "Origem e Fundacao", "Rito e Tradicao", "Tecnica e Ciencia", "Legado e Continuidade",
    "Desafio e Superacao", "Relacionamento e Comunidade", "Futuro e Visao", "Celebracao"
  ],
  
  temasPrincipais: [
    "Terra e Sertao", "Origem e Proposito", "Legado", "Trabalho", "Fe e Espiritualidade",
    "Familia", "Comunidade", "Inovacao", "Tradicao", "Sustentabilidade", "Qualidade",
    "Excelencia", "Resiliencia", "Planejamento", "Execucao", "Resultados", "Pessoas",
    "Animais", "Natureza", "Tecnologia", "Gestao", "Producao", "Comercializacao",
    "Educacao", "Cultura", "Memoria", "Futuro", "Desafios", "Conquistas", "Celebracao",
    "Parceria", "Confianca", "Dedicacao", "Disciplina", "Cuidado", "Responsabilidade",
    "Desenvolvimento", "Crescimento", "Transformacao", "Preservacao", "Integracao",
    "Cooperacao", "Lideranca", "Inspiracao", "Motivacao", "Reconhecimento", "Gratidao",
    "Esperanca", "Determinacao", "Coragem"
  ],
  
  status: [
    "Entrada (Bruto)", "Em triagem", "Catalogado", "Em revisao", "Editado",
    "Aprovado", "Publicado", "Arquivado", "Descartado"
  ],
  
  capitulos: [
    "A definir", "Capitulo 01", "Capitulo 02", "Capitulo 03", "Capitulo 04",
    "Capitulo 05", "Capitulo 06", "Capitulo 07", "Capitulo 08", "Capitulo 09",
    "Capitulo 10", "Capitulo 11", "Capitulo 12"
  ],
  
  responsaveis: [
    "Equipe Interna", "Producao", "Marketing", "Diretoria", "Consultoria Externa", "Outro"
  ]
}

export const statusColors: Record<string, string> = {
  "Entrada (Bruto)": "bg-neutral-200 text-neutral-700",
  "Em triagem": "bg-amber-100 text-amber-700",
  "Catalogado": "bg-blue-100 text-blue-700",
  "Em revisao": "bg-purple-100 text-purple-700",
  "Editado": "bg-indigo-100 text-indigo-700",
  "Aprovado": "bg-primary-100 text-primary-700",
  "Publicado": "bg-green-100 text-green-700",
  "Arquivado": "bg-neutral-700 text-neutral-100",
  "Descartado": "bg-red-100 text-red-700",
}

export const statusKanbanOrder = [
  "Entrada (Bruto)", "Em triagem", "Catalogado", "Em revisao", 
  "Editado", "Aprovado", "Publicado", "Arquivado"
]
