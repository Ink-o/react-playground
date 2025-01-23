import type { Files } from './PlaygroundContext'
import AppCss from './template/App.css?raw'
import App from './template/App.tsx?raw'
import externalMap from './template/externalMap.json?raw'
import importMap from './template/import-map.json?raw'
import main from './template/main.tsx?raw'
import remotesMap from './template/remotesMap.json?raw'
import { fileName2Language } from './utils'

export enum FILE_NAME_MAP {
  /** app 文件名 */
  APP_COMPONENT_FILE_NAME = 'App.tsx',
  /** esm 模块映射文件名 */
  IMPORT_MAP_FILE_NAME = 'import-map.json',
  /** app 入口文件名 */
  ENTRY_FILE_NAME = 'main.tsx',
  /** external 资源 */
  EXTERNAL_NAME = 'externalMap.json',
  /** remotes 资源 */
  REMOTES_NAME = 'remotes.json',
}

export interface ExternalMap {
  [k: string]: {
    var: string
    scriptUrl: string[]
    styleUrl?: string[]
  }
}

// 下面的 value 是文件字符串内容
export const initFiles: Files = {
  [FILE_NAME_MAP.ENTRY_FILE_NAME]: {
    name: FILE_NAME_MAP.ENTRY_FILE_NAME,
    language: fileName2Language(FILE_NAME_MAP.ENTRY_FILE_NAME),
    value: main,
  },
  [FILE_NAME_MAP.APP_COMPONENT_FILE_NAME]: {
    name: FILE_NAME_MAP.APP_COMPONENT_FILE_NAME,
    language: fileName2Language(FILE_NAME_MAP.APP_COMPONENT_FILE_NAME),
    value: App,
  },
  'App.css': {
    name: 'App.css',
    language: 'css',
    value: AppCss,
  },
  [FILE_NAME_MAP.IMPORT_MAP_FILE_NAME]: {
    name: FILE_NAME_MAP.IMPORT_MAP_FILE_NAME,
    language: fileName2Language(FILE_NAME_MAP.IMPORT_MAP_FILE_NAME),
    value: importMap,
  },
  [FILE_NAME_MAP.EXTERNAL_NAME]: {
    name: FILE_NAME_MAP.EXTERNAL_NAME,
    language: fileName2Language(FILE_NAME_MAP.EXTERNAL_NAME),
    value: externalMap,
  },
  [FILE_NAME_MAP.REMOTES_NAME]: {
    name: FILE_NAME_MAP.REMOTES_NAME,
    language: fileName2Language(FILE_NAME_MAP.REMOTES_NAME),
    value: remotesMap,
  },
}
