import request from '@/utils/request'
/**
 * 查询机构/部门，返回树形结构
 * @returns {AxiosPromise} 树形结构机构/部门
 */
export function getTreeOffice() {
  return request({
    url: '/office/tree',
    method: 'get'
  })
}

/**
 * 新增机构/部门
 * @param office 机构/部门
 * @returns {AxiosPromise} 成功、失败
 */
export function addOffice(office) {
  return request({
    url: '/office',
    method: 'post',
    data: office
  })
}

/**
 * 修改机构/部门
 * @param office 机构/部门
 * @returns {AxiosPromise} 成功、失败
 */
export function updateOffice(office) {
  return request({
    url: '/office',
    method: 'put',
    data: office
  })
}

/**
 * 删除机构/部门
 * @param officeId 机构/部门ID
 * @returns {AxiosPromise} 成功、失败
 */
export function deleteOffice(officeId) {
  return request({
    url: '/office',
    method: 'delete',
    data: { 'officeId': officeId }
  })
}
/**
 * 查询机构/部门详情
 * @param officeId 机构/部门ID
 * @returns {AxiosPromise} 成功、失败
 */
export function getOfficeInfo(officeId) {
  return request({
    url: '/office',
    method: 'get',
    params: { 'officeId': officeId }
  })
}
/**
 * 分页查询机构/部门列表
 * @param data 分页信息
 * @returns {AxiosPromise} 机构/部门列表
 */
export function getOffices(data) {
  return request({
    url: '/offices',
    method: 'get',
    params: data
  })
}

/**
 * 批量删除机构/部门
 * @param officeIds 机构/部门ID集合
 * @returns {AxiosPromise} 成功、失败
 */
export function deleteOffices(officeIds) {
  return request({
    url: '/offices',
    method: 'delete',
    data: officeIds
  })
}
/**
 * 查询所有机构/部门列表
 * @param data 分页信息
 * @returns {AxiosPromise} 机构/部门列表
 */
export function getAllOffices(data) {
  return request({
    url: '/office/all',
    method: 'get',
    params: data
  })
}
/**
 * 查询角色机构/部门列表
 * @param roleId 角色Id
 * @returns {AxiosPromise} 机构/部门列表
 */
export function getRoleOffices(roleId) {
  return request({
    url: '/office/role',
    method: 'get',
    params: { 'roleId': roleId }
  })
}
