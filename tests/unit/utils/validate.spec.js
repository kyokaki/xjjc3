import { validuserNo, isExternal } from '@/utils/validate.js'

describe('Utils:validate', () => {
  it('validuserNo', () => {
    expect(validuserNo('admin')).toBe(true)
    expect(validuserNo('editor')).toBe(true)
    expect(validuserNo('xxxx')).toBe(false)
  })
  it('isExternal', () => {
    expect(isExternal('https://github.com/PanJiaChen/vue-element-admin')).toBe(true)
    expect(isExternal('http://github.com/PanJiaChen/vue-element-admin')).toBe(true)
    expect(isExternal('github.com/PanJiaChen/vue-element-admin')).toBe(false)
    expect(isExternal('/dashboard')).toBe(false)
    expect(isExternal('./dashboard')).toBe(false)
    expect(isExternal('dashboard')).toBe(false)
  })
})
