export interface Todo {
  id: number;
  content: string;
}

export interface Meta {
  totalCount: number;
}

// FlowCanvas related types and interfaces
export interface ConnectionPoint {
  itemId: number;
  side: 'left' | 'right' | 'top' | 'bottom';
}

export interface Connection {
  id: number;
  source: ConnectionPoint;
  target: ConnectionPoint;
  isInProgress?: boolean;
  mousePosX?: number;
  mousePosY?: number;
}

// Define skill type
export type SkillType = 'script' | 'dados_contato' | 'dados_entidade' | 'live_chat' | 
                'definir_unidade' | 'rag' | 'smart_content' | 'registrar_sdm' | 
                'enviar_midia' | 'mensagem_interativa';

// Define channel type
export type ChannelType = 'whatsapp' | 'instagram' | 'facebook' | 'widget';

// Define agent type
export type AgentType = 'conversational' | 'controller' | 'revisor' | 'extractor';

// Define model type
export type ModelType = 'gpt-4.1' | 'gpt-4.1-mini' | 'gemini-2.5-flash' | 'gemini-2.5-pro';

// Define comparison operators
export type ComparisonOperator = 'existe' | 'nao_existe' | 'igual_a' | 'diferente_de' | 
                          'maior_que' | 'maior_ou_igual' | 'menor_que' | 'menor_ou_igual' | 
                          'comeca_com' | 'termina_com' | 'contem';

// Define logical operator
export type LogicalOperator = 'AND' | 'OR';

// Define condition type
export interface Condition {
  id: number;
  logicType: LogicalOperator;
  memoryVariable: string;
  operator: ComparisonOperator;
  value: string;
}

// Define version language variant
export interface LanguageVariant {
  content: string;
  html: string;
}

// Define prompt version
export interface PromptVersion {
  name: string;
  timestamp: string;
  content: string;
  html: string;
  languages?: {
    [langCode: string]: LanguageVariant;
  };
}

export interface FlowItem {
  id: number;
  type: 'channel' | 'agent' | 'skill';
  x: number;
  y: number;
  title?: string;
  description?: string;
  skillType?: SkillType;
  channelType?: ChannelType;
  agentType?: AgentType;
  modelType?: ModelType;
  memory?: string;
  conditions?: Condition[];
  prompt?: {
    content: string;
    html: string;
    versions?: PromptVersion[];
    currentVersionIndex?: number | null;
  };
}

export interface Position {
  x: number;
  y: number;
}
