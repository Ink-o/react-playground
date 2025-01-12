import type { NodePath, PluginObj } from '@babel/core'
import type { ImportDeclaration } from '@babel/types'
import type { ExternalMap } from '../../files'
import type { File, Files } from '../../PlaygroundContext'
import { packages, transform } from '@babel/standalone'
import { FILE_NAME_MAP } from '../../files'

const compileResMap = new Map()

// 如果当前文件是 jsx 或者 tsx 文件，且没有引入 React，则自动引入 React
export function beforeTransformCode(filename: string, code: string) {
  let _code = code
  const regexReact = /import\s+React/
  if ((filename.endsWith('.jsx') || filename.endsWith('.tsx')) && !regexReact.test(code)) {
    _code = `import React from 'react';\n${code}`
  }
  return _code
}

export function babelTransform(filename: string, code: string, files: Files) {
  const _code = beforeTransformCode(filename, code)
  let result = ''
  try {
    result = transform(
      _code,
      {
        presets: ['react', 'typescript'],
        filename,
        plugins: [customResolver(files)],
        retainLines: true,
      },
    ).code!
  }
  catch (e) {
    console.error('编译出错', e)
  }
  return result
}

function getModuleFile(files: Files, modulePath: string) {
  let moduleName = modulePath.split('./').pop() || ''
  if (!moduleName.includes('.')) {
    const realModuleName = Object.keys(files).filter((key) => {
      return key.endsWith('.ts')
        || key.endsWith('.tsx')
        || key.endsWith('.js')
        || key.endsWith('.jsx')
    }).find((key) => {
      return key.split('.').includes(moduleName)
    })
    if (realModuleName) {
      moduleName = realModuleName
    }
  }
  return files[moduleName]
}

function json2Js(file: File) {
  const js = `export default ${file.value}`
  return URL.createObjectURL(new Blob([js], { type: 'application/javascript' }))
}

function css2Js(file: File) {
  const randomId = new Date().getTime()
  const js = `(() => {
  const stylesheet = document.createElement('style')
  stylesheet.setAttribute('id', 'style_${randomId}_${file.name}')
  document.head.appendChild(stylesheet)

  const styles = document.createTextNode(\`${file.value}\`)
  stylesheet.innerHTML = ''
  stylesheet.appendChild(styles)
})()
  `
  return js
}

function externalHandle(externalObj: ExternalMap, path: NodePath<ImportDeclaration>) {
  const modulePath = path.node.source.value
  const pkName = externalObj[modulePath as keyof typeof externalObj].var
  let allKey = ''
  const keys: string[] = []
  path.node?.specifiers?.forEach((item) => {
    if (item.local?.name) {
      if (item.type === 'ImportDefaultSpecifier') {
        allKey = item.local.name
      }
      if (item.type === 'ImportSpecifier') {
        keys.push(item.local.name)
      }
    }
  })
  let str = ''
  if (allKey) {
    str = `const ${allKey} = window['${pkName}']`
  }
  if (keys?.length) {
    str += `const { ${keys?.join(',')} } = window['${pkName}']`
  }

  const astTemplate = packages.template.default.ast(str)
  path.insertBefore(astTemplate)
  path.remove()
}

function customResolver(files: Files): PluginObj {
  let externalObj = {}
  try {
    externalObj = JSON.parse(files[FILE_NAME_MAP.EXTERNAL_NAME].value) || {}
  }
  catch (error) {
    console.error('json 解析错误', error)
  }
  return {
    visitor: {
      ImportDeclaration(path) {
        const modulePath = path.node.source.value
        // 处理 external
        if (Object.keys(externalObj).includes(modulePath)) {
          externalHandle(externalObj, path)
          return
        }
        if (modulePath.startsWith('.')) {
          const file = getModuleFile(files, modulePath)
          if (!file)
            return
          let res = ''
          // 针对 css 文件做导出处理，将内容注入到 ObjectURL 中
          if (file.name.endsWith('.css')) {
            res = css2Js(file)
            path.node.source.value = URL.createObjectURL(new Blob([res], { type: 'application/javascript' }))
          }
          else if (file.name.endsWith('.json')) {
            res = json2Js(file)
            path.node.source.value = res
          }
          else {
            res = babelTransform(file.name, file.value, files)
            // 递归解析依赖文件，将依赖文件内容注入到 ObjectURL 中
            path.node.source.value = URL.createObjectURL(
              new Blob([res], {
                type: 'application/javascript',
              }),
            )
          }
          compileResMap.set(file.name, res)
        }
      },
    },
  }
}

export function compile(files: Files) {
  const main = files[FILE_NAME_MAP.ENTRY_FILE_NAME]
  return babelTransform(FILE_NAME_MAP.ENTRY_FILE_NAME, main.value, files)
}

globalThis.addEventListener('message', async ({ data }) => {
  try {
    const entryData = compile(data)
    console.log('entryData: ', entryData)
    compileResMap.set(FILE_NAME_MAP.ENTRY_FILE_NAME, entryData)
    globalThis.postMessage({
      type: 'COMPILED_CODE',
      data: {
        compileResMap,
      },
    })
  }
  catch (e) {
    globalThis.postMessage({ type: 'ERROR', error: e })
  }
})
