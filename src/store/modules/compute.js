import TronWeb from 'tronweb'
const state = {
  privateKey: undefined,
  tronUrl: process.env.VUE_APP_TRON_URL,
  contract: process.env.VUE_APP_CONTRACT,
  tronWeb: undefined,
  rtxBalance: undefined,
  usdtBalance: undefined
}

const mutations = {
  GET_ACCOUNT_BALANCE: async(state) => {
    const tronWeb = state.tronWeb
    const contract = state.contract
    const balance = await tronWeb.trx.getBalance()
    const base58 = tronWeb.defaultAddress.base58
    console.log('balance:', balance, ' trxValue')
    console.log('balance:', balance / Math.pow(10, 6), ' TRX')
    state.rtxBalance = balance / Math.pow(10, 6)
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

