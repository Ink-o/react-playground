import antfu from '@antfu/eslint-config'
import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat()

export default antfu({
  ...compat.config({
    extends: [
      'no-console:0'
    ]
  })
})
