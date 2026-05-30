declare module '@nestjs/mongoose' {
  export const Prop: any;
  export const Schema: any;
  export const SchemaFactory: any;
}

declare module 'mongoose' {
  export type HydratedDocument<T> = T & { _id: any };

  export namespace Types {
    class ObjectId {
      constructor(id?: any);
      toString(): string;
    }
  }
}
declare module '@nestjs/common' {
  export class BadRequestException extends Error {
    constructor(message?: any);
  }
  export class PayloadTooLargeException extends Error {
    constructor(message?: any);
  }
}

declare module 'express' {
  export namespace Express {
    export namespace Multer {
      export interface File {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        destination?: string;
        filename?: string;
        path?: string;
        buffer?: any;
        [key: string]: any;
      }
    }
  }
}

declare module 'path' {
  export function extname(path: string): string;
  export function basename(path: string, ext?: string): string;
  export function join(...paths: string[]): string;
}
