import Vue from 'vue'

import Cookies from 'js-cookie'

import 'normalize.css/normalize.css' // a modern alternative to CSS resets

import Element from 'element-ui'
import './styles/element-variables.scss'
import enLang from 'element-ui/lib/locale/lang/en'// 如果使用中文语言包请默认支持，无需额外引入，请删除该依赖

import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'

import './icons' // icon
import './permission' // permission control
import './utils/error-log' // error log
import permission from '@/directive/permission'
import * as filters from './filters' // global filters
import RightToolbar from '@/components/RightToolbar'
import Pagination from '@/components/Pagination'
import { getConfigKey } from '@/api/system/config'
import { resetForm, addDateRange, selectDictLabel, selectDictLabels, download, handleTree } from '@/utils/common'
import { parseTime, formatDate, formatTime } from '@/utils/index'
import { getDictTypes } from '@/api/system/dict/data'

import { SYS_USER_SEX, SYS_USER_STATUS, SYS_ROLE_STATUS, SYS_OFFICE_STATUS, SYS_DICT_STATUS, SYS_MENU_TYPE, SYS_SHOW_HIDE, STATUS } from '@/utils/constant'
// 全局方法挂载
Vue.prototype.getDictTypes = getDictTypes
Vue.prototype.getConfigKey = getConfigKey
Vue.prototype.parseTime = parseTime
Vue.prototype.resetForm = resetForm
Vue.prototype.addDateRange = addDateRange
Vue.prototype.selectDictLabel = selectDictLabel
Vue.prototype.selectDictLabels = selectDictLabels
Vue.prototype.download = download
Vue.prototype.handleTree = handleTree
Vue.prototype.formatTime = formatTime
Vue.prototype.formatDate = formatDate

// 全局常量挂载
Vue.prototype.SYS_USER_SEX = SYS_USER_SEX
Vue.prototype.SYS_USER_STATUS = SYS_USER_STATUS
Vue.prototype.SYS_ROLE_STATUS = SYS_ROLE_STATUS
Vue.prototype.SYS_OFFICE_STATUS = SYS_OFFICE_STATUS
Vue.prototype.SYS_DICT_STATUS = SYS_DICT_STATUS
Vue.prototype.SYS_MENU_TYPE = SYS_MENU_TYPE
Vue.prototype.SYS_SHOW_HIDE = SYS_SHOW_HIDE
Vue.prototype.STATUS = STATUS
/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online ! ! !
 */
if (process.env.NODE_ENV === 'production') {
  const { mockXHR } = require('../mock')
  mockXHR()
}
Vue.use(permission)
Vue.component('RightToolbar', RightToolbar)
Vue.component('Pagination', Pagination)
Vue.use(Element, {
  size: Cookies.get('size') || 'medium', // set element-ui default size
  locale: enLang // 如果使用中文，无需设置，请删除
})

// register global utility filters
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
