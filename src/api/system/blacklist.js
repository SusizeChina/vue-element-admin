import request from '@/utils/request'

// 查询IP黑名单管理列表
export function listBlacklist(query) {
  return request({
    url: '/system/blacklist/list',
    method: 'get',
    params: query
  })
}

// 查询IP黑名单管理详细
export function getBlacklist(id) {
  return request({
    url: '/system/blacklist/' + id,
    method: 'get'
  })
}

// 新增IP黑名单管理
export function addBlacklist(data) {
  return request({
    url: '/system/blacklist',
    method: 'post',
    data: data
  })
}

// 修改IP黑名单管理
export function updateBlacklist(data) {
  return request({
    url: '/system/blacklist',
    method: 'put',
    data: data
  })
}

// 删除IP黑名单管理
export function delBlacklist(id) {
  return request({
    url: '/system/blacklist/' + id,
    method: 'delete'
  })
}

// 导出IP黑名单管理
export function exportBlacklist(query) {
  return request({
    url: '/system/blacklist/export',
    method: 'get',
    params: query
  })
}