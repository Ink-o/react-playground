import { Popconfirm } from 'antd'
import classnames from 'classnames'
import React, { useEffect, useRef, useState } from 'react'

export interface FileNameItemProps {
  value: string
  actived: boolean
  creating: boolean
  readonly: boolean
  onEditComplete: (name: string) => void
  onRemove: () => void
  onClick: () => void
}

export const FileNameItem: React.FC<FileNameItemProps> = (props) => {
  const {
    value,
    actived = false,
    creating,
    onClick,
    onRemove,
    onEditComplete,
    readonly,
  } = props

  const [name, setName] = useState(value)
  const [editing, setEditing] = useState(creating)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDoubleClick = () => {
    setEditing(true)
    setTimeout(() => {
      inputRef?.current?.focus()
    }, 0)
  }

  useEffect(() => {
    if (creating) {
      inputRef?.current?.focus()
    }
  }, [creating])

  const hanldeInputBlur = () => {
    setEditing(false)
    onEditComplete(name)
  }

  return (
    <div
      className={classnames('inline-flex pt-[8px] pr-[10px] pb-[6px] pl-[8px] text-[13px] leading-[20px] cursor-pointer items-center border-b-[3px] border-[solid] border-transparent', actived ? 'text-themeColor border-themeColor' : null)}
      onClick={onClick}
    >
      {
        editing
          ? (
              <input
                ref={inputRef}
                className="w-[90px] py-[4px] pl-[10px] pr-0 text-[13px] text-[#444] bg-[#ddd] rounded-[4px] outline-none border-[1px] border-solid border-[#ddd]"
                value={name}
                onBlur={hanldeInputBlur}
                onChange={e => setName(e.target.value)}
              />
            )
          : (
              <>
                <span onDoubleClick={!readonly ? handleDoubleClick : () => { }}>{name}</span>
                {
                  !readonly
                    ? (
                        <Popconfirm
                          title="确认删除该文件吗？"
                          okText="确定"
                          cancelText="取消"
                          onConfirm={(e) => {
                            e.stopPropagation()
                            onRemove()
                          }}
                        >
                          <span style={{ marginLeft: 5, display: 'flex' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24">
                              <line stroke="#999" x1="18" y1="6" x2="6" y2="18"></line>
                              <line stroke="#999" x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </span>
                        </Popconfirm>
                      )
                    : null
                }
              </>
            )
      }
    </div>
  )
}
