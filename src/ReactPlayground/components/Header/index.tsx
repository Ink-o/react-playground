import { DownloadOutlined, MoonOutlined, ShareAltOutlined, SunOutlined } from '@ant-design/icons'
import { message } from 'antd'
import copy from 'copy-to-clipboard'
import { useContext } from 'react'
import { PlaygroundContext } from '../../PlaygroundContext'
import { downloadFiles } from '../../utils'
import logoSvg from './icons/logo.svg'

export default function Header() {
  const { theme, setTheme, files } = useContext(PlaygroundContext)
  return (
    <div className="h-[50px] py-0 px-[20px] flex items-center justify-between bg-[--bg] text-[--text]">
      <div className="flex tx-[20px] items-center">
        <img className="h-[24px] mr-[10px]" alt="logo" src={logoSvg} />
        <span>Inkk Playground</span>
      </div>
      <div>
        {theme === 'light' && (
          <MoonOutlined
            title="切换暗色主题"
            onClick={() => setTheme('dark')}
          />
        )}
        {theme === 'dark' && (
          <SunOutlined
            title="切换亮色主题"
            onClick={() => setTheme('light')}
          />
        )}
        <ShareAltOutlined
          className="ml-[10px]"
          onClick={() => {
            copy(window.location.href)
            message.success('分享链接已复制。')
          }}
        />
        <DownloadOutlined
          className="ml-[10px]"
          onClick={async () => {
            await downloadFiles(files)
            message.success('下载完成')
          }}
        />
      </div>
    </div>
  )
}
