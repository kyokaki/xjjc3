import TronWeb from 'tronweb'
import BigNumber from 'bignumber.js'
const state = {
  privateKey: undefined,
  tronUrl: process.env.VUE_APP_TRON_URL,
  contract: process.env.VUE_APP_CONTRACT,
  tronWeb: undefined,
  trxBalance: undefined,
  usdtBalance: undefined,
  transactionList: []
}

const mutations = {
  SEND_TRX: async(state, { to, amount, type }) => {
    let result
    const formatAmount = new BigNumber(amount).multipliedBy(Math.pow(10, 6)).toNumber()
    const transaction = await state.tronWeb.trx.sendTransaction(to, formatAmount)
    if (transaction.result) {
      console.log('交易成功transaction:', transaction)
      result = 'success'
    } else {
      console.error('交易失败transaction:', transaction)
      result = 'fail'
    }
    state.transactionList.push({ from: state.tronWeb.defaultAddress.base58, to, type, amount, result, transaction })
  },
  SEND_USDT: async(state, { to, amount, type }) => {
    let result
    // 转账金额
    const formatAmount = new BigNumber(amount).multipliedBy(Math.pow(10, 6)).toNumber()
    const parameter = [{ type: 'address', value: to }, {
      type: 'uint256',
      value: formatAmount
    }]
    const options = {
      feeLimit: 100000000,
      callValue: 0
      // tokenValue: 10,  //放开模拟失败
      // tokenId: 1000001 //放开模拟失败
    }
    const transaction = await state.tronWeb.transactionBuilder.triggerSmartContract(state.contract, 'transfer(address,uint256)', options, parameter)
    console.log('transaction:', transaction)
    let signedtxn = {}
    let tx = {}
    if (transaction.result.result) {
      signedtxn = await state.tronWeb.trx.sign(transaction.transaction)
      console.log('signedtxn:', signedtxn)
      console.log('txID:', signedtxn.txID)
      tx = await state.tronWeb.trx.broadcast(signedtxn)
      console.log('tx:', tx)
      if (tx.result) {
        console.log('交易成功:', tx.txid)
        result = 'success'
      } else {
        console.error('交易:', tx.txid, '失败：', tx.code)
        result = 'fail'
      }
    } else {
      console.error('生成交易异常:', transaction.result)
      result = 'fail'
    }
    state.transactionList.push({ from: state.tronWeb.defaultAddress.base58, to, amount, result, type, transaction: { transaction, signedtxn, tx }})
  },
  GET_ACCOUNT_BALANCE: async(state) => {
    const tronWeb = state.tronWeb
    const contract = state.contract
    const balance = await tronWeb.trx.getBalance()
    const base58 = tronWeb.defaultAddress.base58
    console.log('balance:', balance, ' trxValue')
    console.log('balance:', balance / Math.pow(10, 6), ' TRX')
    state.trxBalance = balance / Math.pow(10, 6)
    const parameter = [{ type: 'address', value: base58 }, {
      type: 'uint256',
      value: 60000
    }]
    const options = {
      feeLimit: 100000000,
      callValue: 0
      // tokenValue: 10,  //放开模拟失败
      // tokenId: 1000001 //放开模拟失败
    }
    const usdtBalance = await tronWeb.transactionBuilder.triggerSmartContract(contract, 'balanceOf(address)', options, parameter)
    state.usdtBalance = parseInt(usdtBalance.constant_result[0], 16) / Math.pow(10, 6)
    console.log('usdtBalance result:', usdtBalance)
    console.log('usdtBalance usdtBalance.constant_result[0]:', usdtBalance.constant_result[0])
    console.log('usdtBalance usdtBalance.constant_result[0]:', parseInt(usdtBalance.constant_result[0], 16) / Math.pow(10, 6), ' USDT')
  },
  INIT_TRON_WEB: (state, privateKey) => {
    const HttpProvider = TronWeb.providers.HttpProvider
    const tronUrl = state.tronUrl
    const fullNode = new HttpProvider(tronUrl)
    const solidityNode = new HttpProvider(tronUrl)
    const eventServer = tronUrl
    const tronWeb = new TronWeb(fullNode,
      solidityNode,
      eventServer,
      privateKey)
    state.tronWeb = tronWeb
  },
  GET_COMPUTE: (state, { key }) => {
    // eslint-disable-next-line no-prototype-builtins
    if (state.hasOwnProperty(key)) {
      return JSON.parse(state[key])
    }
    return {}
  },
  SET_COMPUTE: (state, { key, value }) => {
    // eslint-disable-next-line no-prototype-builtins
    if (state.hasOwnProperty(key)) {
      state[key] = value
    }
  }

}

const actions = {
  sendTrx({ commit }, data) {
    commit('SEND_TRX', data)
  },
  sendUsdt({ commit }, data) {
    commit('SEND_USDT', data)
  },
  initTronWeb({ commit }, data) {
    // 登录
    commit('INIT_TRON_WEB', data)
    commit('GET_ACCOUNT_BALANCE')
  },
  setCompute({ commit }, data) {
    commit('SET_COMPUTE', data)
  },
  getCompute({ commit }, data) {
    return commit('GET_COMPUTE', data)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

