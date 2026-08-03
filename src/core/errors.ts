export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NetworkError extends DomainError {}
export class ParseError extends DomainError {}
export class StorageError extends DomainError {}
export class ConfigurationError extends DomainError {}
