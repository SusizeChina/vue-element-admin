import request from '@/utils/request'
/**
 * 查询用户菜单，返回树形结构,不带功能按钮
 * @returns {AxiosPromise} 树形结构菜单，不带功能按钮
 */
export function getTreeMenu() {
  return request({
    url: '/menu/tree',
    method: 'get'
  })
}
/**
 * 新增菜单
 * @param menu 菜单
 * @returns {AxiosPromise} 成功、失败
 */
export function addMenu(menu) {
  return request({
    url: '/menu',
    method: 'post',
    data: menu
  })
}

/**
 * 修改菜单
 * @param menu 菜单
 * @returns {AxiosPromise} 成功、失败
 */
export function updateMenu(menu) {
  return request({
    url: '/menu',
    method: 'put',
    data: menu
  })
}

/**
 * 删除菜单
 * @param menuId 菜单ID
 * @returns {AxiosPromise} 成功、失败
 */
export function deleteMenu(menuId) {
  return request({
    url: '/menu',
    method: 'delete',
    data: menuId
  })
}
/**
 * 查询菜单详情
 * @param menuId 菜单ID
 * @returns {AxiosPromise} 成功、失败
 */
export function getMenuInfo(menuId) {
  return request({
    url: '/menu',
    method: 'get',
    params: menuId
  })
}
/**
 * 分页查询菜单列表
 * @param data 分页信息
 * @returns {AxiosPromise} 菜单列表
 */
export function getMenus(data) {
  return request({
    url: '/menus',
    method: 'get',
    params: data
  })
}

/**
 * 查询所有菜单列表
 * @param menu 菜单信息
 * @returns {AxiosPromise} 菜单列表
 */
export function getALLMenus(menu) {
  return request({
    url: '/menu/all',
    method: 'get',
    params: menu
  })
}

/**
 * 批量删除菜单
 * @param menuIds 菜单ID集合
 * @returns {AxiosPromise} 成功、失败
 */
export function deleteMenus(menuIds) {
  return request({
    url: '/menus',
    method: 'delete',
    data: menuIds
  })
}

/**
 * 查询角色的所有菜单列表
 * @param roleId 菜单ID
 * @returns {AxiosPromise} 菜单列表
 */
export function getRoleMenus(roleId) {
  return request({
    url: '/menu/role',
    method: 'get',
    params: { 'roleId': roleId }
  })
}
