import { setupTypeAcquisition } from '@typescript/ata'
import typescriprt from 'typescript'

export function createATA(onDownloadFile: (code: string, path: string) => void) {
  const ata = setupTypeAcquisition({
    projectName: 'my-ata',
    typescript: typescriprt,
    logger: console,
    delegate: {
      // 下载正确的类型包后，会调用这个函数
      receivedFile: (code, path) => {
        onDownloadFile(code, path)
      },
    },
  })

  return ata
}
