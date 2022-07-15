<template>
  <div class="app-container">
    <div class="filter-container">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>Batch Transfer</span>
        </div>
        <el-tabs tab-position="top">
          <el-tab-pane label="Text Input">
            <el-form ref="form" :model="form" size="mini" content="Top Left Tip Word">

              <el-form-item label="ToAddress::,::Amount" prop="sendToAndAmount">
                <el-popover
                  placement="top-start"
                  title="Separator"
                  width="200"
                  trigger="hover"
                  :content="popoverContent"
                >
                  <span slot="reference" class="el-icon-warning-outline" />
                </el-popover>
                <el-input
                  v-model="form.sendToAndAmount"
                  type="textarea"
                  rows="5"
                  placeholder="0x55f3508d1F4B0BE50677245C20187xxxxxx13737::,::0.001
0x55f3508d1F4B0BE50677245C201xxxxxx8713737::,::200"
                />
              </el-form-item>

            </el-form>
          </el-tab-pane>
          <el-tab-pane label="Excel Import">
            <el-link type="primary">
              <a href=" ./batch_transfer_excel_template.xlsx " class="excel-template">Excel Template Download：batch_transfer_excel_template.xlsx</a>
            </el-link>
            <upload-excel-component :on-success="handleSuccess" :before-upload="beforeUpload" />
          </el-tab-pane>
        </el-tabs>
      </el-card>

      <el-card v-show="preViewList.length > 0" class="box-card">
        <div slot="header" class="clearfix">
          <span>Batch  Preview</span>
        </div>
        <div>
          <el-table
            :key="tableKey"
            v-loading="listLoading"
            :data="preViewList"
            border
            fit
            highlight-current-row
            style="width: 100%"
            size="mini"
            empty-text="No data"
          >

            <el-table-column align="center" label="from" prop="from">
              <template slot-scope="{ row }">
                <span>{{ row.from }}</span>
              </template>
            </el-table-column>

            <el-table-column align="center" label="to">
              <template slot-scope="{ row }">
                <span>{{ row.to }}</span>
              </template>
            </el-table-column>

            <el-table-column align="center" label="amount">
              <template slot-scope="{ row }">
                <span>{{ row.amount }}</span>
              </template>
            </el-table-column>

          </el-table>
          <el-form>
            <el-form-item
              style="margin: 10px auto; text-align: center;"
            >
              <el-button type="primary" @click="handleSubmit">GO</el-button>
            </el-form-item>
          </el-form>

        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import waves from '@/directive/waves'
import Mcp from 'mcp.js'
import UploadExcelComponent from '@/components/UploadExcel/index.vue'
import { mapGetters } from 'vuex'
export default {
  name: 'Send',
  directives: { waves },
  components: {
    UploadExcelComponent
  },
  data() {
    return {
      confirmLoading: false,
      tableKey: 0,
      listLoading: false,
      form: {
        sendToAndAmount: undefined
      },
      list: [],
      mcp: undefined,
      separator: '::,::',
      gasParams: {
        from: undefined,
        to: undefined,
        amount: undefined,
        data: '',
        mci: '838'
      },
      sendParams: {
        from: undefined,
        to: undefined,
        amount: undefined,
        password: undefined,
        gas: undefined,
        gas_price: '1000000000',
        data: ''
      },
      popoverContent: `ExampleAccount1::,::0.01
ExampleAccount2::,::1200`,
      tableData: [],
      sendObjList: []
    }
  },
  computed: {
    ...mapGetters({
      keystore: 'keystore',
      keystorePwd: 'keystorePwd'
    }),
    preViewList: function() {
      return this.getSendObjList() || []
    }
  },
  created() {
    this.mcp = new Mcp('https://huygens.computecoin.network/')
  },
  methods: {
    beforeUpload(file) {
      const isLt1M = file.size / 1024 / 1024 < 1

      if (isLt1M) {
        return true
      }

      this.$message({
        message: 'Please do not upload files larger than 1m in size.',
        type: 'warning'
      })
      return false
    },
    handleSuccess({ results, header }) {
      this.tableData = [...results]
    },
    handleSubmit() {
      this.$refs['form'].validate(vali => {
        if (vali) {
          this.$confirm('This operation will initiate a batch transfer, whether to continue?', 'Warning', {
            confirmButtonText: 'Sure',
            cancelButtonText: 'Cancel',
            type: 'warning'
          }).then(() => {
            this.onSubmit()
          }).catch(() => {
            this.$message({
              type: 'info',
              message: 'Cancelled'
            })
          })
        }
      })
    },
    async onSubmit() {
      let count = 0
      const hashs = new Set()
      const maxCount = this.preViewList.length
      this.preViewList.forEach(async(item) => {
        // 1.查询gas
        let gas = ''
        try {
          const gasResult = await this.estimateGas(item)
          console.log('#gas# ' + JSON.stringify(gasResult))
          if (gasResult.code !== 0) {
            return this.$message.error('fail: ' + gasResult.msg)
          }
          gas = gasResult.gas
        } catch (error) {
          return this.$message.error('estimateGas fail ' + JSON.stringify(item))
        }
        // 2.开始转账
        try {
          const sendResult = await this.sendBlock(item, gas)
          console.log('#sendResult# ' + JSON.stringify(sendResult))
          if (sendResult.code !== 0) {
            return this.$message.error('fail: ' + sendResult.msg)
          }
          if (sendResult && sendResult.code === 0) {
            hashs.add(sendResult.hash)
            count++
          } else if (sendResult && sendResult.code === 11) {
            return this.$message.error('sendBlock fail ' + sendResult.msg)
          }
        } catch (error) {
          return this.$message.error('sendBlock fail ' + JSON.stringify(this.sendParams))
        }
      })
      const timer = setInterval(() => {
        if (count >= maxCount) {
          clearInterval(timer)
          setTimeout(() => {
            this.clearSendObjList()
            this.$bus.$emit('send_account', JSON.parse(this?.keystore)?.account)
            this.$bus.$emit('query_record', [...hashs])
          }, 1000)
        }
      }, 1000)
    },
    sendBlock(item, gas) {
      this.sendParams.from = JSON.parse(this?.keystore)?.account
      this.sendParams.to = item.to
      // this.sendParams.amount = item.amount
      this.sendParams.amount = this.formatAmount(item.amount)
      this.sendParams.gas = gas
      this.sendParams.password = this.keystorePwd
      return this.mcp.request.sendBlock(this.sendParams)
    },
    formatAmount(amount) {
      return (amount * Math.pow(10, 18)).toLocaleString().replace(/,/g, '')
    },
    estimateGas(req) {
      this.gasParams.from = req.from
      this.gasParams.to = req.to
      this.gasParams.amount = this.formatAmount(req.amount + '')
      console.log('#this.gasParams#' + JSON.stringify(this.gasParams))
      return this.mcp.request.estimateGas(this.gasParams)
    },
    handleCheck() {
      let newArray = []
      if (this.sendObjList?.length > 0) {
        newArray = [...this.sendObjList]
      }
      if (this.tableData?.length > 0) {
        newArray = [...newArray, ...this.tableData]
      }
      return newArray.map(item => { return { ...item, from: JSON.parse(this?.keystore)?.account } })
    },
    getSendObjList() {
      if (this.form?.sendToAndAmount?.trim().length > 0) {
        if (!this?.keystore) {
          this.$message.error('Please Account Authentication')
          return []
        }
        if (this.form?.sendToAndAmount.indexOf(this.separator) > 0) {
          this.sendObjList = this.form?.sendToAndAmount?.trim().split(/\s+/).map(item => {
            const list = item.split(this.separator)
            return {
              to: list[0],
              amount: list[1]
            }
          })
        }
      } else {
        this.sendObjList = []
      }
      return this.handleCheck()
    },
    clearSendObjList() {
      this.form.sendToAndAmount = undefined
      this.tableData = []
    }
  }
}
</script>
<style scoped>
.filter-container {
  display: flex;
}
.box-card {
  width: 50%;
  min-height: 350px;
  flex:1;
}
.excel-template {
  font-size: 14px
}
</style>
