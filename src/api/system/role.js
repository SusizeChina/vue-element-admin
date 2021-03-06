import request from '@/utils/request'

/**
 * 新增角色
 * @param role 角色
 * @returns {AxiosPromise} 成功、失败
 */
export function addRole(role) {
  return request({
    url: '/role',
    method: 'post',
    data: role
  })
}

/**
 * 修改角色
 * @param role 角色
 * @returns {AxiosPromise} 成功、失败
 */
export function updateRole(role) {
  return request({
    url: '/role',
    method: 'put',
    data: role
  })
}

/**
 * 删除角色
 * @param roleId 角色ID
 * @returns {AxiosPromise} 成功、失败
 */
export function deleteRole(roleId) {
  return request({
    url: '/role',
    method: 'delete',
    data: { 'roleId': roleId }
  })
}
/**
 * 查询角色详情
 * @param roleId 角色ID
 * @returns {AxiosPromise} 成功、失败
 */
export function getRoleInfo(roleId) {
  return request({
    url: '/role',
    method: 'get',
    params: { 'roleId': roleId }
  })
}
/**
 * 分页查询角色列表
 * @param data 分页信息
 * @returns {AxiosPromise} 角色列表
 */
export function getRoles(data) {
  return request({
    url: '/roles',
    method: 'get',
    params: data
  })
}
/**
 * 查询所有角色列表
 * @param data 角色信息
 * @returns {AxiosPromise} 角色列表
 */
export function getAllRoles(role) {
  return request({
    url: '/role/all',
    method: 'get',
    params: role
  })
}

/**
 * 批量删除角色
 * @param roleIds 角色ID集合
 * @returns {AxiosPromise} 成功、失败
 */
export function deleteRoles(roleIds) {
  return request({
    url: '/roles',
    method: 'delete',
    data: roleIds
  })
}
/**
 * 导出角色
 * @param role 角色信息
 * @returns {AxiosPromise} 成功、失败
 */
export function roleExport(role) {
  return request({
    url: '/role/export',
    method: 'get',
    params: role
  })
}

/**
 * 下载角色导入模板
 * @returns {AxiosPromise} 成功、失败
 */
export function roleTemplate() {
  return request({
    url: '/role/template',
    method: 'get'
  })
}

/**
 * 导入角色
 * @param file 角色ID集合
 * @returns {AxiosPromise} 成功、失败
 */
export function roleImport(file) {
  return request({
    url: '/role/import',
    method: 'post',
    data: file
  })
}
