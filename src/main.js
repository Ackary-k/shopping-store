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

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
