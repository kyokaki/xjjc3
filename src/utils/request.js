import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { uuid } from '@/utils/trace-log-id'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  //   timeout: 5000 // request timeout
  //   timeout: 15000 // request timeout
  timeout: 100000
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent

    if (config.data) {
      config.data.requestSystem = 'compute-wallet-h5'
      config.data.traceLogId = uuid()
      console.log('###$请求:', 'URL=', config.url, 'traceLogId=', config.data.traceLogId, 'request config=', config)
      // 读取质押位数: 默认为小数点后4位
      let rewardsBit = 4
      const APP_SETTING = 'APP_SETTING'
      let nodeSetting = {}
      try {
        nodeSetting = localStorage.getItem(APP_SETTING) || ''
        if (nodeSetting) {
          nodeSetting = JSON.parse(nodeSetting) || {}
        } else {
          nodeSetting = { rewardsBit }
          localStorage.setItem(APP_SETTING, JSON.stringify(nodeSetting))
        }
      } catch (error) {
        console.log('读取质押位数失败 :' + error)
      }
      rewardsBit = nodeSetting?.rewardsBit ?? rewardsBit
      config.data.rewardsBit = rewardsBit
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const { status, data } = response
    if (status === 200) {
      console.log('###@响应:', 'URL=', response.config.url, 'traceLogId=', response.data.traceLogId, 'response=', response)
      if (data.success) {
        return data
      }
      Message({
        message: data.message || 'Error',
        type: 'error',
        duration: 5 * 1000
      })
      // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
      if (data.code === 'USER_LOGIN_EXPIRED') {
        // to re-login
        MessageBox.confirm('您的登录信息已经过期，请重新登录！', '确认登出', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        })
      }
      return Promise.reject(new Error(data.message || 'Bad Request'))
    }
    Message({
      message: '调用远程失败 status:' + status,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(new Error('Bad Request'))
  },
  error => {
    console.log('error:', error) // for debug
    Message({
      message: '远程调用失败:' + error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
