import request from '@/utils/request'

export function queryAccountBlockList(data) {
  return request({
    url: '/open/Compute/queryAccountBlockList',
    method: 'post',
    data
  })
}

export function queryAccountBalance(data) {
  return request({
    url: '/open/Compute/queryAccountBalance',
    method: 'post',
    data
  })
}
