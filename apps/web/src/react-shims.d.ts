// Minimal shims for React and JSX runtime to satisfy TypeScript when
// `react` / `@types/react` are not installed in the environment.
declare module 'react' {
    export function useState<T = any>(initial?: T): [T, (v: any) => void];
    export const Fragment: any;
    const React: any;
    export default React;
}

declare module 'react/jsx-runtime' {
    export function jsx(type: any, props?: any, key?: any): any;
    export function jsxs(type: any, props?: any, key?: any): any;
    export const Fragment: any;
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            [elemName: string]: any;
        }
    }
}
