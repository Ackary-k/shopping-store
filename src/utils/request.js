import Vue from 'vue'
import axios from 'axios'

axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

// axios 请求拦截
axios.interceptors.request.use(config => {
  // 除了登录的 url, 添加 token
  if (config.url !== 'login') {
    // 为请求头对象添加 token 验证的 Authorization 字段
    config.headers.Authorization = window.sessionStorage.getItem('token')
  }
  return config
})

Vue.prototype.$axios = axios
