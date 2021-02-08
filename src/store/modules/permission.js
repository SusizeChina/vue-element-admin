import { asyncRoutes, constantRoutes } from '@/router'
import { getTreeMenu } from '@/api/system/menu'
import Layout from '@/layout/index'
/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  return res
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  generateRoute({ commit }, roles) {
    return new Promise(resolve => {
      let accessedRoutes
      if (roles.includes('admin')) {
        accessedRoutes = asyncRoutes || []
      } else {
        accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
      }
      commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes)
    })
  },
  // 动态路由
  generateRoutes({ commit }, roles) {
    return new Promise(resolve => {
      // 向后端请求路由数据
      getTreeMenu().then(res => {
        const accessedRoutes = formatRouter(res.data)
        accessedRoutes.push({ path: '*', redirect: '/404', hidden: true })
        commit('SET_ROUTES', accessedRoutes)
        resolve(accessedRoutes)
      })
    })
  }
}
function getRouterPath(menuPath) {
  return '/' + menuPath
}
function getRouterName(menuPath) {
  if (menuPath) {
    const routerName = menuPath.charAt(0).toUpperCase() + menuPath.slice(1)
    return routerName
  }
  return menuPath
}

// 遍历后台传来的路由字符串，转换为组件对象
function formatRouter(asyncRouterMap) {
  const routes = []
  if (!asyncRouterMap) {
    return true
  }
  asyncRouterMap.filter(menu => {
    const route = {}
    route.name = getRouterName(menu.path)
    route.hidden = menu.visible === '1'

    const meta = {}
    meta.title = menu.menuName
    meta.icon = menu.icon
    meta.noCache = menu.isCache === '1'

    const roles = []
    roles.push(menu.perms)
    meta.roles = roles
    route.meta = meta

    if (menu.menuType === 'M') {
      route.path = getRouterPath(menu.path)
      route.component = Layout
    } else {
      route.path = menu.path
      route.component = loadView(menu.component)
    }
    if (menu.children != null && menu.children && menu.children.length) {
      route.children = formatRouter(menu.children)
    }
    routes.push(route)
    return true
  })
  return routes
}

export const loadView = (view) => { // 路由懒加载
  return (resolve) => require([`@/views/${view}`], resolve)
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
