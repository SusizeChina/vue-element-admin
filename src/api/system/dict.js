import request from '@/utils/request'
/**
 * 查询用户字典，返回树形结构
 * @returns {AxiosPromise} 树形结构字典
 */
export function getTreeDict() {
  return request({
    url: '/dict/tree',
    method: 'get'
  })
}

/**
 * 新增字典
 * @param dict 字典
 * @returns {AxiosPromise} 成功、失败
 */
export function addDict(dict) {
  return request({
    url: '/dict',
    method: 'post',
    data: dict
  })
}

/**
 * 修改字典
 * @param dict 字典
 * @returns {AxiosPromise} 成功、失败
 */
export function updateDict(dict) {
  return request({
    url: '/dict',
    method: 'put',
    data: dict
  })
}

/**
 * 删除字典
 * @param dictId 字典ID
 * @returns {AxiosPromise} 成功、失败
 */
export function deleteDict(dictId) {
  return request({
    url: '/dict/' + dictId,
    method: 'delete'
  })
}
/**
 * 查询字典详情
 * @param dictId 字典ID
 * @returns {AxiosPromise} 成功、失败
 */
export function getDictInfo(dictId) {
  return request({
    url: '/dict/' + dictId,
    method: 'get'
  })
}
/**
 * 分页查询字典列表
 * @param data 分页信息
 * @returns {AxiosPromise} 字典列表
 */
export function getDicts(data) {
  return request({
    url: '/dicts',
    method: 'get',
    params: data
  })
}

/**
 * 批量删除字典
 * @param dictIds 字典ID集合
 * @returns {AxiosPromise} 成功、失败
 */
export function deleteDicts(dictIds) {
  return request({
    url: '/dicts',
    method: 'delete',
    data: dictIds
  })
}

/**
 * 查询指定字典类型参数
 * @param dictType 字典类型
 * @returns {AxiosPromise} 字典参数列表
 */
export function getDictTypes(dictType) {
  return request({
    url: '/dict_type?dictType=' + dictType,
    method: 'get'
  })
}

/**
 * 查询指定字典类型参数
 * @param type 字典类型
 * @returns {AxiosPromise} 字典参数列表
 */
export function exportDictData(type) {
  return request({
    url: '/dicts?type=' + type,
    method: 'get'
  })
}
