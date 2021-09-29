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

// 导入格式化插件 moment
import moment from 'moment'

// 导入富文本插件以及样式
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

// 注册富文本插件
Vue.use(VueQuillEditor /* { default global options } */)

// 注册
Vue.component('tree-table', ZkTable)

// 创建过滤器将秒数过滤为年月日，时分秒
Vue.filter('dateFormat', (oldValue) => {
  return moment(oldValue).format('YYYY-MM-DD')
})

Vue.config.productionTip = false

new Vue({
  router,
  render: (h) => h(App)
}).$mount('#app')
