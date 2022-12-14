const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  keystore: state => state.compute.keystore,
  keystorePwd: state => state.compute.keystorePwd,
  tronWeb: state => state.compute.tronWeb,
  usdtBalance: state => state.compute.usdtBalance,
  trxBalance: state => state.compute.trxBalance,
  transactionList: state => state.compute.transactionList
}
export default getters
