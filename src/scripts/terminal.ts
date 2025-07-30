export class Chunk {
  private text: string;
  private colorValue: string = "";
  private backgroundColorValue: string = "";
  private boldValue: boolean = false;
  private paddingValue: string = "";
  private marginValue: string = "";

  constructor(text: string, newline: boolean = false) {
    this.text = text + (newline ? "\n" : "");
  }

  color(color: string): Chunk {
    this.colorValue = color;
    return this;
  }

  background(color: string): Chunk {
    this.backgroundColorValue = color;
    return this;
  }

  bold(): Chunk {
    this.boldValue = true;
    return this;
  }

  padding(padding: string): Chunk {
    this.paddingValue = padding;
    return this;
  }

  margin(margin: string): Chunk {
    this.marginValue = margin;
    return this;
  }

  toString(): string {
    return this.text;
  }

  getText(): string {
    return this.text;
  }

  getColor(): string {
    return this.colorValue;
  }

  getBackgroundColor(): string {
    return this.backgroundColorValue;
  }

  isBold(): boolean {
    return this.boldValue;
  }

  getPadding(): string {
    return this.paddingValue;
  }

  getMargin(): string {
    return this.marginValue;
  }
}

export class Terminal {
  private name: string;
  private messages: string[] = [];

  constructor(name: string) {
    this.name = name;
  }

  init(): string[] {
    return this.log(`[${this.name}] Initialized`, true);
  }

  log(message: string = "", newline: boolean = false): string[] {
    const timestamp = new Date().toLocaleString();
    const logMessage = `[${this.name}] ${timestamp}: ${message}`;
    this.messages.push(logMessage);
    
    if (newline) {
      this.messages.push("");
    }
    
    return this.messages;
  }

  blue(message: string): string[] {
    return this.log(`%c${message}`, false);
  }

  green(message: string): string[] {
    return this.log(`%c${message}`, false);
  }

  red(message: string): string[] {
    return this.log(`%c${message}`, false);
  }

  yellow(message: string): string[] {
    return this.log(`%c${message}`, false);
  }

  disconnect(message: string): string[] {
    return this.log(`[DISCONNECT] ${message}`, true);
  }

  chunkMessage(chunks: Chunk[]): string[] {
    const message = chunks.map(chunk => chunk.toString()).join(" ");
    return this.log(message, false);
  }

  chunkSend(chunks: Chunk[]): string[] {
    const message = chunks.map(chunk => chunk.toString()).join(" ");
    return this.log(`[SEND] ${message}`, false);
  }

  getMessages(): string[] {
    return [...this.messages];
  }

  clear(): void {
    this.messages = [];
  }
} 