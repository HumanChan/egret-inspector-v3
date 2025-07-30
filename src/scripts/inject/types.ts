// Inject script types

export interface InjectMessage {
  type: string;
  data?: any;
  timestamp: number;
}

export interface InjectConfig {
  enabled: boolean;
  debug: boolean;
  features: string[];
}

export interface InjectEvent {
  name: string;
  target: EventTarget;
  data?: any;
} 