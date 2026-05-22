export const priorityOptions = [
  { value: 'BAIXA', label: 'Baixa' },
  { value: 'MEDIA', label: 'Media' },
  { value: 'ALTA', label: 'Alta' },
  { value: 'CRITICA', label: 'Critica' },
]

export const projectStatusOptions = [
  { value: 'PLANEJADO', label: 'Planejado' },
  { value: 'EM_ANDAMENTO', label: 'Em andamento' },
  { value: 'PAUSADO', label: 'Pausado' },
  { value: 'CONCLUIDO', label: 'Concluido' },
  { value: 'CANCELADO', label: 'Cancelado' },
]

export const activityStatusOptions = [
  { value: 'NAO_INICIADA', label: 'Nao iniciada' },
  { value: 'EM_ANDAMENTO', label: 'Em andamento' },
  { value: 'BLOQUEADA', label: 'Bloqueada' },
  { value: 'CONCLUIDA', label: 'Concluida' },
  { value: 'CANCELADA', label: 'Cancelada' },
]

export const accessRoleOptions = [
  { value: 'ADMINISTRADOR_PROJETO', label: 'Administrador do projeto' },
  { value: 'COORDENADOR', label: 'Coordenador' },
  { value: 'EXECUTOR', label: 'Executor' },
  { value: 'VISUALIZADOR', label: 'Visualizador' },
]

export const resourceTypeOptions = [
  { value: 'HUMANO', label: 'Humano' },
  { value: 'MATERIAL', label: 'Material' },
  { value: 'TECNOLOGICO', label: 'Tecnologico' },
  { value: 'FINANCEIRO', label: 'Financeiro' },
  { value: 'SERVICO', label: 'Servico' },
]

export const costTypeOptions = [
  { value: 'PLANEJADO', label: 'Planejado' },
  { value: 'OPERACIONAL', label: 'Operacional' },
  { value: 'AQUISICAO', label: 'Aquisicao' },
  { value: 'RH', label: 'RH' },
  { value: 'IMPREVISTO', label: 'Imprevisto' },
]

export const riskCategoryOptions = [
  { value: 'ESCOPO', label: 'Escopo' },
  { value: 'PRAZO', label: 'Prazo' },
  { value: 'CUSTO', label: 'Custo' },
  { value: 'QUALIDADE', label: 'Qualidade' },
  { value: 'RECURSOS', label: 'Recursos' },
  { value: 'TECNOLOGIA', label: 'Tecnologia' },
  { value: 'COMUNICACAO', label: 'Comunicacao' },
  { value: 'EXTERNO', label: 'Externo' },
]

export const riskStatusOptions = [
  { value: 'IDENTIFICADO', label: 'Identificado' },
  { value: 'EM_ANALISE', label: 'Em analise' },
  { value: 'EM_TRATAMENTO', label: 'Em tratamento' },
  { value: 'MITIGADO', label: 'Mitigado' },
  { value: 'ENCERRADO', label: 'Encerrado' },
]

export const entityCrudConfigs = {
  projects: {
    title: 'Projetos',
    singular: 'projeto',
    description: 'Crie, edite e exclua projetos cadastrados na API.',
    getTitle: (item) => item.name,
    getDescription: (item) => item.description || item.objetivo || 'Sem descricao cadastrada.',
    columns: [
      { label: 'Status', value: 'status', format: 'label' },
      { label: 'Prioridade', value: 'priority', format: 'label' },
      { label: 'Prazo', value: 'endDate', format: 'date' },
      { label: 'Orcamento', value: 'budget', format: 'money' },
      { label: 'Progresso', value: (item) => `${item.completion}%` },
    ],
    fields: [
      { name: 'nome', label: 'Nome', type: 'text', required: true, maxLength: 150 },
      { name: 'status', label: 'Status', type: 'select', required: true, options: projectStatusOptions },
      { name: 'prioridade', label: 'Prioridade', type: 'select', required: true, options: priorityOptions },
      { name: 'descricao', label: 'Descricao', type: 'textarea', fullWidth: true, maxLength: 1000 },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', fullWidth: true, maxLength: 1000 },
      { name: 'dataInicio', label: 'Data de inicio', type: 'date' },
      { name: 'dataFim', label: 'Data final', type: 'date' },
      { name: 'orcamentoPrevisto', label: 'Orcamento previsto', type: 'number', min: 0, step: '0.01' },
      {
        name: 'percentualConcluido',
        label: 'Percentual concluido',
        type: 'integer',
        required: true,
        defaultValue: 0,
        min: 0,
        max: 100,
      },
    ],
  },
  activities: {
    title: 'Atividades',
    singular: 'atividade',
    description: 'Gerencie tarefas, prazos e responsaveis vinculados aos projetos.',
    getTitle: (item) => item.title,
    getDescription: (item) => item.description || item.projectName || 'Sem descricao cadastrada.',
    columns: [
      { label: 'Projeto', value: 'projectName' },
      { label: 'Status', value: 'status', format: 'label' },
      { label: 'Responsavel', value: 'responsibleName' },
      { label: 'Prazo', value: 'dueDate', format: 'date' },
      { label: 'Progresso', value: (item) => `${item.completion}%` },
    ],
    fields: [
      { name: 'titulo', label: 'Titulo', type: 'text', required: true, maxLength: 150 },
      { name: 'projetoId', label: 'Projeto', type: 'select', required: true, optionsKey: 'projects' },
      { name: 'responsavelId', label: 'Responsavel', type: 'select', optionsKey: 'participants' },
      { name: 'status', label: 'Status', type: 'select', required: true, options: activityStatusOptions },
      { name: 'prioridade', label: 'Prioridade', type: 'select', required: true, options: priorityOptions },
      { name: 'descricao', label: 'Descricao', type: 'textarea', fullWidth: true, maxLength: 1000 },
      { name: 'dataInicio', label: 'Data de inicio', type: 'date' },
      { name: 'prazo', label: 'Prazo', type: 'date' },
      { name: 'dataConclusao', label: 'Data de conclusao', type: 'date' },
      {
        name: 'percentualConclusao',
        label: 'Percentual de conclusao',
        type: 'integer',
        required: true,
        defaultValue: 0,
        min: 0,
        max: 100,
      },
    ],
  },
  participants: {
    title: 'Participantes',
    singular: 'participante',
    description: 'Associe usuarios aos projetos com papeis e funcoes.',
    getTitle: (item) => item.userName,
    getDescription: (item) => item.projectName || 'Sem projeto vinculado.',
    columns: [
      { label: 'Projeto', value: 'projectName' },
      { label: 'Funcao', value: 'role' },
      { label: 'Acesso', value: 'accessRole', format: 'label' },
      { label: 'Ativo', value: 'active', format: 'boolean' },
    ],
    fields: [
      { name: 'usuarioId', label: 'Usuario', type: 'select', required: true, optionsKey: 'users' },
      { name: 'projetoId', label: 'Projeto', type: 'select', required: true, optionsKey: 'projects' },
      { name: 'funcaoNoProjeto', label: 'Funcao no projeto', type: 'text', required: true, maxLength: 100 },
      { name: 'papelAcesso', label: 'Papel de acesso', type: 'select', required: true, options: accessRoleOptions },
      { name: 'ativo', label: 'Ativo', type: 'boolean', defaultValue: true },
    ],
  },
  resources: {
    title: 'Recursos',
    singular: 'recurso',
    description: 'Controle recursos humanos, materiais, tecnologicos, financeiros e servicos.',
    getTitle: (item) => item.name,
    getDescription: (item) => item.description || item.projectName || 'Sem descricao cadastrada.',
    columns: [
      { label: 'Projeto', value: 'projectName' },
      { label: 'Tipo', value: 'type', format: 'label' },
      { label: 'Quantidade', value: 'quantity' },
      { label: 'Custo unitario', value: 'unitCost', format: 'money' },
    ],
    fields: [
      { name: 'nome', label: 'Nome', type: 'text', required: true, maxLength: 120 },
      { name: 'projetoId', label: 'Projeto', type: 'select', required: true, optionsKey: 'projects' },
      { name: 'tipo', label: 'Tipo', type: 'select', required: true, options: resourceTypeOptions },
      { name: 'descricao', label: 'Descricao', type: 'textarea', fullWidth: true, maxLength: 1000 },
      { name: 'quantidade', label: 'Quantidade', type: 'integer', required: true, min: 1 },
      { name: 'custoUnitario', label: 'Custo unitario', type: 'number', required: true, min: 0, step: '0.01' },
    ],
  },
  costs: {
    title: 'Custos',
    singular: 'custo',
    description: 'Gerencie custos previstos e realizados por projeto.',
    getTitle: (item) => item.description,
    getDescription: (item) => item.projectName || item.activityTitle || 'Sem projeto vinculado.',
    columns: [
      { label: 'Projeto', value: 'projectName' },
      { label: 'Tipo', value: 'type', format: 'label' },
      { label: 'Previsto', value: 'plannedValue', format: 'money' },
      { label: 'Real', value: 'realValue', format: 'money' },
      { label: 'Data', value: 'date', format: 'date' },
    ],
    fields: [
      { name: 'descricao', label: 'Descricao', type: 'text', required: true, maxLength: 255 },
      { name: 'projetoId', label: 'Projeto', type: 'select', required: true, optionsKey: 'projects' },
      { name: 'tipo', label: 'Tipo', type: 'select', required: true, options: costTypeOptions },
      { name: 'valorPrevisto', label: 'Valor previsto', type: 'number', required: true, min: 0, step: '0.01' },
      { name: 'valorReal', label: 'Valor real', type: 'number', min: 0, step: '0.01' },
      { name: 'dataLancamento', label: 'Data de lancamento', type: 'date' },
      { name: 'atividadeId', label: 'Atividade', type: 'select', optionsKey: 'activities' },
      { name: 'recursoId', label: 'Recurso', type: 'select', optionsKey: 'resources' },
    ],
  },
  risks: {
    title: 'Riscos',
    singular: 'risco',
    description: 'Registre riscos, criticidade e planos de resposta.',
    getTitle: (item) => item.title,
    getDescription: (item) => item.description || item.strategy || 'Sem descricao cadastrada.',
    columns: [
      { label: 'Projeto', value: 'projectName' },
      { label: 'Categoria', value: 'category', format: 'label' },
      { label: 'Status', value: 'status', format: 'label' },
      { label: 'Criticidade', value: 'criticality' },
    ],
    fields: [
      { name: 'titulo', label: 'Titulo', type: 'text', required: true, maxLength: 150 },
      { name: 'projetoId', label: 'Projeto', type: 'select', required: true, optionsKey: 'projects' },
      { name: 'categoria', label: 'Categoria', type: 'select', required: true, options: riskCategoryOptions },
      { name: 'status', label: 'Status', type: 'select', required: true, options: riskStatusOptions },
      { name: 'descricao', label: 'Descricao', type: 'textarea', fullWidth: true, maxLength: 1000 },
      { name: 'probabilidade', label: 'Probabilidade', type: 'integer', required: true, min: 1, max: 5 },
      { name: 'impacto', label: 'Impacto', type: 'integer', required: true, min: 1, max: 5 },
      { name: 'criticidade', label: 'Criticidade', type: 'integer', required: true, min: 1, max: 25 },
      { name: 'estrategiaResposta', label: 'Estrategia de resposta', type: 'textarea', fullWidth: true, maxLength: 500 },
      { name: 'planoMitigacao', label: 'Plano de mitigacao', type: 'textarea', fullWidth: true, maxLength: 1000 },
    ],
  },
}
