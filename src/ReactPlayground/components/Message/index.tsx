import React, { useEffect, useMemo, useState } from 'react'

export interface MessageProps {
  type: 'error' | 'warn'
  content: string
}

export const Message: React.FC<MessageProps> = (props) => {
  const { type, content } = props
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    setVisible(!!content)
  }, [content])

  const themeColor = useMemo(() => {
    const colorMap = {
      error: {
        color: '#f56c6c',
        bgColor: '#fef0f0',
      },
      warn: {
        color: '#e6a23c',
        bgColor: '#fdf6ec',
      },
    }
    return colorMap[type] || colorMap.warn
  }, [type])

  return visible
    ? (
        <div className={`[--color:${themeColor.color}] [--bgColor:${themeColor.bgColor}] absolute right-[8px] bottom-0 left-[8px] z-[10px] flex max-h-[calc(100% - 300px)] min-h-[40px] mb-[8px] rounded-[6px] border-[2px] border-solid border-[--color] text-[--color] bg-[--bgColor]`}>
          <pre className="px-[20px] py-[12px] overflow-auto whitespace-break-spaces" dangerouslySetInnerHTML={{ __html: content }}></pre>
          <button className="absolute top-[2px] right-[2px] block w-[18px] h-[18px] p-0 text-[9px] text-[--color] text-center cursor-pointer border-none bg[--bgColor] rounded-[9px] leading-[18px]" onClick={() => setVisible(false)}>
            ✕
          </button>
        </div>
      )
    : null
}
