import Vue from 'vue'
import { Button, Form, FormItem, Input, Icon, Message, MessageBox } from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Icon)
// 为Vue 挂载消息提示方法
Vue.prototype.$message = Message
Vue.prototype.$msgBox = MessageBox
