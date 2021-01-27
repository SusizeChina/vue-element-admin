import request from '@/utils/request'

// 查询通知管理列表
export function listNoticeManage(query) {
  return request({
    url: '/system/noticeManage/list',
    method: 'get',
    params: query
  })
}

// 查询通知管理详细
export function getNoticeManage(id) {
  return request({
    url: '/system/noticeManage/' + id,
    method: 'get'
  })
}

// 新增通知管理
export function addNoticeManage(data) {
  return request({
    url: '/system/noticeManage',
    method: 'post',
    data: data
  })
}

// 修改通知管理
export function updateNoticeManage(data) {
  return request({
    url: '/system/noticeManage',
    method: 'put',
    data: data
  })
}

// 删除通知管理
export function delNoticeManage(id) {
  return request({
    url: '/system/noticeManage/' + id,
    method: 'delete'
  })
}

// 导出通知管理
export function exportNoticeManage(query) {
  return request({
    url: '/system/noticeManage/export',
    method: 'get',
    params: query
  })
}