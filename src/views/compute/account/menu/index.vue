<!--
 * @Description:
 * @Author: Liyajun
 * @Date: 2022-07-11 10:46:18
 * @FilePath: \tron-wallet-h5\src\views\compute\account\menu\index.vue
 * @LastEditTime: 2022-07-15 09:57:16
 * @LastEditors: Liyajun
-->
<template>
  <div>
    <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" @select="handleSelect">
      <el-menu-item index="1" style="float:right">About</el-menu-item>
      <el-menu-item index="2" style="float:right">Create Account</el-menu-item>
    </el-menu>
    <!--  about -->
    <el-dialog
      title="About"
      :visible.sync="aboutDialogVisible"
      width="30%"
      center
    >
      <div class="donation-address">
        <h3>CCN区块链技术应用研究实验室</h3>
        <h3>franklinmastermouse@gmail.com</h3>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="aboutDialogVisible = false">OK</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
const TronWeb = require('tronweb')
const moment = require('moment')
export default {
  data() {
    return {
      activeIndex: '1',
      aboutDialogVisible: false,
      donationDialogVisible: false
    }
  },
  methods: {
    handleSelect(key, keyPath) {
      console.log(key, keyPath)
      if (key === '1') {
        this.openAboutDialog()
      } else if (key === '2') {
        this.confirmCreateNewAccount()
      }
    },
    createNewAccount() {
      if (TronWeb) {
        return TronWeb.createAccount()
      }
    },
    exportStringToTxtFile(fileName, content) {
      var blob = new Blob([content], { type: 'text/plain' })
      var a = document.createElement('a')
      a.download = fileName + '.txt'
      a.href = window.URL.createObjectURL(blob)
      a.target = '_blank'
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    },

    confirmCreateNewAccount() {
      this.$confirm('This operation will create a new account, do you want to confirm?', 'Tips', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(async() => {
        const account = await this.createNewAccount()
        if (account) {
          console.log('account##', account)
          this.exportStringToTxtFile('New_Account_' + moment().format(), JSON.stringify(account))
          this.$message({
            type: 'success',
            message: 'Success!'
          })
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: 'Cancel!'
        })
      })
    },
    openAboutDialog() {
      this.aboutDialogVisible = true
    }
  }
}
</script>

<style scoped>
.donation-address {
  text-align: center;
  margin-top: 20px;
}
</style>
