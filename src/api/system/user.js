import request from '@/utils/request'

/**
 * 查询登录用户信息
 * @returns {AxiosPromise} 用户详情
 */
export function getLoginUserInfo(user) {
  return request({
    url: '/user/info',
    method: 'get'
  })
}

/**
 * 新增用户
 * @param user 用户
 * @returns {AxiosPromise} 成功、失败
 */
export function addUser(user) {
  return request({
    url: '/user',
    method: 'post',
    data: user
  })
}

/**
 * 修改用户
 * @param user 用户
 * @returns {AxiosPromise} 成功、失败
 */
export function updateUser(user) {
  return request({
    url: '/user',
    method: 'put',
    data: user
  })
}

/**
 * 删除用户
 * @param userId 用户ID
 * @returns {AxiosPromise} 成功、失败
 */
export function deleteUser(userId) {
  return request({
    url: '/user/' + userId,
    method: 'delete'
  })
}
/**
 * 查询用户详情
 * @param userId 用户ID
 * @returns {AxiosPromise} 成功、失败
 */
export function getUserInfo(userId) {
  return request({
    url: '/user/' + userId,
    method: 'get'
  })
}
/**
 * 分页查询用户列表
 * @param data 分页信息
 * @returns {AxiosPromise} 用户列表
 */
export function getUsers(data) {
  return request({
    url: '/users',
    method: 'get',
    params: data
  })
}

/**
 * 批量删除用户
 * @param userIds 用户ID集合
 * @returns {AxiosPromise} 成功、失败
 */
export function deleteUsers(userIds) {
  return request({
    url: '/users',
    method: 'delete',
    data: userIds
  })
}
