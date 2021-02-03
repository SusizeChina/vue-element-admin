import request from '@/utils/request'
import { version } from '@/utils/common'
export function login(data) {
  return request({
    url: version + '/user/login',
    method: 'post',
    data
  })
}

export function logout() {
  return request({
    url: version + '/user/logout',
    method: 'post'
  })
}
