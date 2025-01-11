import type { PluginObj } from '@babel/core'
import type { File, Files } from '../../PlaygroundContext'
import { packages, transform } from '@babel/standalone'
import { ENTRY_FILE_NAME } from '../../files'
import externalMap from '../../template/externalMap'

// 如果当前文件是 jsx 或者 tsx 文件，且没有引入 React，则自动引入 React
export function beforeTransformCode(filename: string, code: string) {
  let _code = code
  const regexReact = /import\s+React/g
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
    console.log('result', result)
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
  const js = `
(() => {
    const stylesheet = document.createElement('style')
    stylesheet.setAttribute('id', 'style_${randomId}_${file.name}')
    document.head.appendChild(stylesheet)

    const styles = document.createTextNode(\`${file.value}\`)
    stylesheet.innerHTML = ''
    stylesheet.appendChild(styles)
})()
    `
  return URL.createObjectURL(new Blob([js], { type: 'application/javascript' }))
}

function customResolver(files: Files): PluginObj {
  return {
    visitor: {
      ImportDeclaration(path) {
        const modulePath = path.node.source.value
        if (Object.keys(externalMap).includes(modulePath)) {
          const pkName = externalMap[modulePath as keyof typeof externalMap]
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
            str = `const ${allKey} = window.${pkName}`
          }
          if (keys?.length) {
            str += `const { ${keys?.join(',')} } = window.${pkName}`
          }

          const astTemplate = packages.template.default.ast(str)
          path.insertBefore(astTemplate)
          path.remove()
          return
        }
        if (modulePath.startsWith('.')) {
          const file = getModuleFile(files, modulePath)
          if (!file)
            return
          // 针对 css 文件做导出处理，将内容注入到 ObjectURL 中
          if (file.name.endsWith('.css')) {
            path.node.source.value = css2Js(file)
          }
          else if (file.name.endsWith('.json')) {
            path.node.source.value = json2Js(file)
          }
          else {
            // 递归解析依赖文件，将依赖文件内容注入到 ObjectURL 中
            path.node.source.value = URL.createObjectURL(
              new Blob([babelTransform(file.name, file.value, files)], {
                type: 'application/javascript',
              }),
            )
          }
        }
      },
    },
  }
}

export function compile(files: Files) {
  const main = files[ENTRY_FILE_NAME]
  return babelTransform(ENTRY_FILE_NAME, main.value, files)
}

globalThis.addEventListener('message', async ({ data }) => {
  try {
    console.log('received img')
    globalThis.postMessage({
      type: 'COMPILED_CODE',
      data: compile(data),
    })
  }
  catch (e) {
    globalThis.postMessage({ type: 'ERROR', error: e })
  }
})
