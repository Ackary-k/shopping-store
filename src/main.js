import Vue from 'vue'
import App from './App.vue'
import router from './router'
import '@/plugins/element.js'
import '@/assets/css/global.css'
import '@/assets/fonts/iconfont.css'
// 导入封装好的请求
import '@/utils/request.js'

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
