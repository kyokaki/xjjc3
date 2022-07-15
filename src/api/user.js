import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/sso/Auth/login',
    method: 'post',
    data
  })
}

export function getInfo(data) {
  return request({
    url: '/sso/UserInfo/query',
    method: 'post',
    data
  })
}

export function logout(data) {
  return request({
    url: '/sso/Auth/logout',
    method: 'post',
    data
  })
}

// 修改当前用户密码
export function modifySelfUserInfo(data) {
  return request({
    url: '/sso/UserInfo/modifySelf',
    method: 'post',
    data
  })
}
