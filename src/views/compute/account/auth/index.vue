<template>
  <div class="app-container">
    <div class="filter-container">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>Account Authentication</span>
        </div>
        <el-form ref="form" :model="form" size="mini" :rules="rules" label-position="left" :disabled="disabledFlag">
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
                TRX :
                <div /></div></el-col>
            <el-col :span="6">
              <div class="grid-content">
                {{ trxBalance }}
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
      'trxBalance',
      'usdtBalance'
    ])
  },
  data() {
    return {
      listLoading: false,
      showAccountManagement: false,
      rules: {
        privateKey: [{ required: true, trigger: 'blur' }]
      },
      form: {
        privateKey: undefined
      },
      disabledFlag: false,
      privateKeyPlaceholder: '5ffb2577b12bdb7b10e4d20************************2b2b029da6cb611c7bae0'
    }
  },
  methods: {
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
    keepContent() {
      this.setCompute({
        key: 'privateKey',
        value: this.form.privateKey
      })
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
