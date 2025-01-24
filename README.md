# React playground
fork 自神光 React playground
https://github.com/QuarkGluonPlasma/react-course-code/tree/main/react-playground-project

# 启动
pnpm i

pnpm dev

# 改动

1、ModuleFederation 组件引入支持
2、external 支持
3、打包 JS 查看
4、tailwindcss 接入
5、Vite 改 Rsbuild

# externalMap.json 字段说明
主要用于资源 external
```json
{
  "antd": { // 对应 ts 引入包名
    "var": "antd", // umd 暴露出的全局变量名
    "scriptUrl": [ // 对应 js 资源
      "https://unpkg.com/antd@4.21.5/dist/antd.min.js"
    ],
    "styleUrl": [ // 对应 样式资源
      "https://unpkg.com/antd@4.21.5/dist/antd.min.css"
    ]
  }
}
```

# remotes.json 字段说明
主要用于配置 ModuleFederation 字段配置
```json
{
  "testCompo": { // 包名
    "url": "http:localhost:3000/remoteEntry.js", // 对应资源
    "format": "var", // 格式化类型，目前只支持 var
    "from": "webpack" // 来源 from，目前只支持 webpack
  }
}
```

使用：
```tsx
import TestButton from 'testCompo/Button'

export default () => {
  return <TestButton>测试按钮</TestButton>
}
```
