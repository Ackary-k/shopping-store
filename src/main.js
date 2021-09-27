import Vue from 'vue'
import App from './App.vue'
import router from './router'
import '@/plugins/element.js'
import '@/assets/css/global.css'
import '@/assets/fonts/iconfont.css'
// 导入封装好的请求
import '@/utils/request.js'

// 引入树形表格
import ZkTable from 'vue-table-with-tree-grid'

// 注册
Vue.component('tree-table', ZkTable)

// 创建过滤器将秒数过滤为年月日，时分秒
Vue.filter('dateFormat', function (originVal) {
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')

  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

Vue.config.productionTip = false

new Vue({
  router,
  render: (h) => h(App)
}).$mount('#app')
