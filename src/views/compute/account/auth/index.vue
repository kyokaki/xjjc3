<template>
  <div class="app-container">
    <div class="filter-container">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>Account Authentication</span>
        </div>
        <el-form ref="form" :model="form" size="mini" :rules="rules" label-position="left" :disabled="disabledFlag">

          <!-- <el-form-item>
            <el-button type="primary" @click="handleKeyStoreTemplate">Template</el-button>
          </el-form-item> -->
          <el-form-item label="privateKey" prop="privateKey">
            <el-input v-model="form.privateKey" type="textarea" rows="1" :placeholder="privateKeyPlaceholder" />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="handleCheck">Check</el-button>
          </el-form-item>
        </el-form>
      </el-card>
      <!-- AccountManagement -->
      <el-card v-if="showAccountManagement" class="box-card">
        <div slot="header" class="clearfix">
          <span>Account Management</span>
        </div>
        <div>
          <el-row :gutter="20">
            <el-col :span="6">
              <div class="grid-content">
                RTX :
                <div /></div></el-col>
            <el-col :span="6">
              <div class="grid-content">
                {{ rtxBalance }}
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="6">
              <div class="grid-content">
                USDT :
                <div /></div></el-col>
            <el-col :span="6">
              <div class="grid-content">
                {{ usdtBalance }}
              </div>
            </el-col>
          </el-row>
        </div>

      </el-card>
      <!-- <el-card v-if="showKeystoreTemplate" class="box-card">
        <div slot="header" class="clearfix">
          <span>Keystore Template</span>
        </div>
        <div>
          <el-table
            v-loading="listLoading"
            :data="keystoreList"
            border
            fit
            highlight-current-row
            style="width: 100%"
            size="mini"
            empty-text="No data"
          >
            <el-table-column align="center" label="name" :show-overflow-tooltip="true">
              <template slot-scope="{ row }">
                <span>{{ row.name }}</span>
              </template>
            </el-table-column>

            <el-table-column align="center" label="keystore" :show-overflow-tooltip="true">
              <template slot-scope="{ row }">
                <span>{{ row.keystore }}</span>
              </template>
            </el-table-column>

            <el-table-column
              fixed="right"
              label="operate"
              width="140"
            >
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  size="small"
                  @click.native.prevent="handleUse(scope.$index, scope.row)"
                >
                  Use
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  @click.native.prevent="handleDelete(scope.$index, scope.row)"
                >
                  Del
                </el-button>
              </template>
            </el-table-column>

          </el-table>
        </div>

      </el-card> -->

    </div>
  </div>
</template>

<script>
import waves from '@/directive/waves'
import { mapActions, mapGetters } from 'vuex'
export default {
  name: 'Auth',
  directives: { waves },
  computed: {
    ...mapGetters([
      'tronWeb',
      'rtxBalance',
      'usdtBalance'
    ])
  },
  data() {
    return {
      keystoreList: [],
      listLoading: false,
      showKeystoreTemplate: false,
      showAccountManagement: false,
      keystoreHistoryKey: 'KEYSTORE_HISTORY_KEY',
      rules: {
        privateKey: [{ required: true, trigger: 'blur' }]
      },
      form: {
        privateKey: undefined
      },
      mcp: undefined,
      disabledFlag: false,
      privateKeyPlaceholder: '4D9FF11E284E54CC3EECA59131A***************601D804A0BBE6C7F6FDA'
    }
  },
  mounted() {

  },
  methods: {
    handleUse(index, rows) {
      this.form.keystore = rows.keystore
    },
    handleDelete(index, rows) {
      this.$confirm('This operation will permanently delete the keystore, whether to continue?', 'warning', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.deleteKeystore(rows)
        this.$message({
          type: 'success',
          message: 'Successfully deleted!'
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: 'Undeleted!'
        })
      })
    },
    handleKeyStoreTemplate() {
      this.getKeystoreList()
      this.showKeystoreTemplate = !this.showKeystoreTemplate
    },
    openSaveMessageBox() {
      this.$prompt('Please enter keystore template name', 'Keystore Template', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel'
      }).then(({ value }) => {
        this.keepKeystore(value, this.form.keystore)
        this.$message({
          type: 'success',
          message: 'New Keystore Template: ' + value
        })
        this.getKeystoreList()
      }).catch(() => {
        this.$message({
          type: 'info',
          message: 'Cancel Created'
        })
      })
    },
    getKeystoreList() {
      const keystoreStr = localStorage.getItem(this.keystoreHistoryKey)
      this.keystoreList = keystoreStr ? JSON.parse(keystoreStr) : []
    },
    deleteKeystore(rows) {
      const keystoreStr = localStorage.getItem(this.keystoreHistoryKey)
      let keystoreArray = []
      if (keystoreStr) {
        keystoreArray = JSON.parse(keystoreStr)
        keystoreArray = keystoreArray.filter(item => {
          return item.name !== rows.name || item.keystore !== rows.keystore
        })
      }
      localStorage.setItem(this.keystoreHistoryKey, JSON.stringify(keystoreArray))
      this.getKeystoreList()
    },
    keepKeystore(name, keystore) {
      keystore = typeof keystore === 'string' ? keystore : JSON.stringify(keystore)
      const keystoreStr = localStorage.getItem(this.keystoreHistoryKey)
      let keystoreArray = []
      if (keystoreStr) {
        keystoreArray = JSON.parse(keystoreStr)
      }
      keystoreArray.push({ name, keystore })
      keystoreArray = [...new Set(keystoreArray.map(item => JSON.stringify(item)))].map(item => JSON.parse(item))
      localStorage.setItem(this.keystoreHistoryKey, JSON.stringify(keystoreArray))
    },
    handleClose(done) {
      this.$confirm('Confirm to close?', '', {
        cancelButtonText: 'Cancel',
        confirmButtonText: 'Confirm'
      })
        .then(_ => {
          done()
        })
        .catch(_ => {})
    },
    ...mapActions({
      initTronWeb: 'compute/initTronWeb',
      setCompute: 'compute/setCompute'
    }),
    handleCheck() {
      this.$refs['form'].validate(vali => {
        if (vali) {
          this.onCheck()
        }
      })
    },
    async onCheck() {
      await this.initTronWeb(this.form.privateKey)
      console.log('tronWeb###', this.tronWeb)
      const { eventServer, fullNode, solidityNode } = await this.tronWeb.isConnected()
      if (eventServer && fullNode && solidityNode) {
        this.keepContent()
        this.$message({
          type: 'success',
          message: 'Connected Success'
        })
        this.showAccountManagement = true
      }
    },
    askForTemplate() {
      setTimeout(() => {
        this.$confirm('Do you need to save the keystore as a template?', '', {
          cancelButtonText: 'Cancel',
          confirmButtonText: 'Confirm'
        })
          .then(_ => {
            this.openSaveMessageBox()
          })
          .catch(_ => {})
      }, 300)
    },
    keepContent() {
      this.setCompute({
        key: 'privateKey',
        value: this.form.privateKey
      })
    },
    accountUnlock(importResult) {
      try {
        const { account } = importResult
        const pwd = this.form.password
        return this.mcp.request.accountUnlock(account, pwd)
      } catch (e) {
        return this.$message.error('accountImport fail ')
      }
    },
    accountImport() {
      try {
        const jsonFile = this.form.keystore
        return this.mcp.request.accountImport(jsonFile)
      } catch (e) {
        return this.$message.error('accountImport fail ')
      }
    }
  }
}
</script>
<style scoped lang="scss">
.filter-container {
  display: flex;
}
.box-card {
  width: 50%;
  min-height: 350px;
  flex:1;
}

.el-row {
    &:last-child {
      margin-bottom: 0;
    }
  }
  .el-col {
    border-radius: 4px;
  }

  .grid-content {
    border-radius: 4px;
    min-height: 36px;
  }
  .row-bg {
    padding: 10px 0;
    background-color: #f9fafc;
  }
</style>
