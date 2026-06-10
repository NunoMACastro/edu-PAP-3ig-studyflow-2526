// Minimal shims for server packages to avoid TypeScript missing-module errors
// This is a temporary safety net for environments without full deps installed.

declare module '@nestjs/common' {
    export const Injectable: any;
    export const Controller: any;
    export const Get: any;
    export const Post: any;
    export const Body: any;
    export const Param: any;
    export const UseGuards: any;
    export const ForbiddenException: any;
    export const NotFoundException: any;
    export const UnprocessableEntityException: any;
    export const Module: any;
}

declare module '@nestjs/mongoose' {
    export function InjectModel(model: any): any;
    export const MongooseModule: any;
    export function Prop(opts?: any): any;
    export function Schema(opts?: any): any;
    export const SchemaFactory: {
        createForClass: (cls: any) => any;
    };
}

declare module 'mongoose' {
    export const Types: { ObjectId: any };
    export type Types = { ObjectId: any };
    export type Model<T = any> = any;
    export type HydratedDocument<T = any> = any;
}

declare module 'class-validator' {
    export function IsOptional(): any;
    export function IsArray(): any;
    export function ArrayMaxSize(n: number): any;
    export function IsString(opts?: any): any;
    export function MaxLength(n: number): any;
}
