import request from '@/utils/request'

/**
 * 新增岗位
 * @param post 岗位
 * @returns {AxiosPromise} 成功、失败
 */
export function addPost(post) {
  return request({
    url: '/post',
    method: 'post',
    data: post
  })
}

/**
 * 修改岗位
 * @param post 岗位
 * @returns {AxiosPromise} 成功、失败
 */
export function updatePost(post) {
  return request({
    url: '/post',
    method: 'put',
    data: post
  })
}

/**
 * 删除岗位
 * @param postId 岗位ID
 * @returns {AxiosPromise} 成功、失败
 */
export function deletePost(postId) {
  return request({
    url: '/post',
    method: 'delete',
    data: { 'postId': postId }
  })
}
/**
 * 查询岗位详情
 * @param postId 岗位ID
 * @returns {AxiosPromise} 成功、失败
 */
export function getPostInfo(postId) {
  return request({
    url: '/post',
    method: 'get',
    params: { 'postId': postId }
  })
}
/**
 * 分页查询岗位列表
 * @param data 分页信息
 * @returns {AxiosPromise} 岗位列表
 */
export function getPosts(data) {
  return request({
    url: '/posts',
    method: 'get',
    params: data
  })
}
/**
 * 查询所有岗位列表
 * @param post 岗位信息
 * @returns {AxiosPromise} 岗位列表
 */
export function getAllPosts(post) {
  return request({
    url: '/post/all',
    method: 'get',
    params: post
  })
}

/**
 * 批量删除岗位
 * @param postIds 岗位ID集合
 * @returns {AxiosPromise} 成功、失败
 */
export function deletePosts(postIds) {
  return request({
    url: '/posts',
    method: 'delete',
    data: postIds
  })
}
/**
 * 导出岗位
 * @param post 岗位信息
 * @returns {AxiosPromise} 成功、失败
 */
export function postExport(post) {
  return request({
    url: '/post/export',
    method: 'get',
    params: post
  })
}

/**
 * 下载岗位导入模板
 * @returns {AxiosPromise} 成功、失败
 */
export function postTemplate() {
  return request({
    url: '/post/template',
    method: 'get'
  })
}

/**
 * 导入岗位
 * @param file 岗位ID集合
 * @returns {AxiosPromise} 成功、失败
 */
export function postImport(file) {
  return request({
    url: '/post/import',
    method: 'post',
    data: file
  })
}
