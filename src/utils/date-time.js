/**
 * @desc 格式化日期字符串
 * @param { String } - [date = new Date()] 日期字符串：2020-01-14 13:43:23
 * @param { String } - [formatStr = 'yyyy-MM-dd HH:mm:ss'] 日期格式
 * @returns { String } 格式化后的日期字符串
 */
export function formatDate(params) {
  const defaultParams = {
    date: new Date(),
    formatStr: 'yyyy-MM-dd HH:mm:ss'
  }
  params = { ...defaultParams, ...params }
  let date = params.date
  let formatStr = params.formatStr
  // 传入日期字符串 - 转成时间戳 - 转成标准时间
  date = new Date(new Date(date).getTime())
  formatStr = formatStr.replace(new RegExp('yyyy'), `${date.getFullYear()}`)
  const month = date.getMonth() + 1
  formatStr = formatStr.replace(new RegExp('MM'), `${month > 9 ? month : '0' + month}`)
  const day = date.getDate()
  formatStr = formatStr.replace(new RegExp('dd'), `${day > 9 ? day : '0' + day}`)
  const hour = date.getHours()
  formatStr = formatStr.replace(new RegExp('HH'), `${hour > 9 ? hour : '0' + hour}`)
  const min = date.getMinutes()
  formatStr = formatStr.replace(new RegExp('mm'), `${min > 9 ? min : '0' + min}`)
  const sec = date.getSeconds()
  formatStr = formatStr.replace(new RegExp('ss'), `${sec > 9 ? sec : '0' + sec}`)
  return formatStr
}

/**
 *
 * @param {*} date
 * @returns
 */
export function formatTime(date) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/**
 * 获取当前时间 格式：yyyy-MM-dd
 */
export function getCurrentDate() {
  const date = new Date()
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return [year, month, day].map(formatNumber).join('-')
}

/**
 * 获取当前时间 格式：yyyy-MM-dd HH:MM:SS
 */
export function getCurrentTime() {
  const date = new Date()
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
