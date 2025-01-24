/// <reference types="@rsbuild/core/types" />

// CSS
declare module '*.css' {
  /**
   * @deprecated Use `import style from './style.css?inline'` instead.
   */
  const css: string
  export default css
}

declare module '*?raw' {
  const content: string
  export default content
}
