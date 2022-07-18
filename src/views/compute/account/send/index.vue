<template>
  <div class="app-container">
    <div class="filter-container">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <div style="padding: 10px"><span>Batch Transfer</span></div>
          <el-radio-group v-model="transactionType">
            <el-radio-button label="TRX" />
            <el-radio-button label="USDT" />
          </el-radio-group>
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
                  rows="8"
                  placeholder="THHR12z**************************VPUPsEr::,::0.001
THHR12z**************************VPUPsEr::,::200"
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
import UploadExcelComponent from '@/components/UploadExcel/index.vue'
import { mapGetters, mapActions } from 'vuex'
export default {
  name: 'Send',
  directives: { waves },
  components: {
    UploadExcelComponent
  },
  computed: {
    ...mapGetters([
      'tronWeb'
    ]),
    preViewList: function() {
      return this.getSendObjList() || []
    }
  },
  data() {
    return {
      confirmLoading: false,
      tableKey: 0,
      listLoading: false,
      form: {
        sendToAndAmount: undefined
      },
      transactionType: 'TRX',
      separator: '::,::',
      popoverContent: `Address1::,::0.01
Address2::,::1200`,
      tableData: [],
      sendObjList: []
    }
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
      this.tableData = [...results.map(item => { item.type = this.transactionType; return item })]
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
      this.preViewList.forEach(async(item) => {
        if (this.transactionType === 'USDT') {
          debugger
          this.sendUsdt(item)
        } else if (this.transactionType === 'TRX') {
          debugger
          this.sendTrx(item)
        }
      })
    },
    handleCheck() {
      let newArray = []
      if (this.sendObjList?.length > 0) {
        newArray = [...this.sendObjList]
      }
      if (this.tableData?.length > 0) {
        newArray = [...newArray, ...this.tableData]
      }
      return newArray.map(item => { return { ...item, from: this?.tronWeb?.defaultAddress.base58 } })
    },
    getSendObjList() {
      if (this.form?.sendToAndAmount?.trim().length > 0) {
        if (!this?.tronWeb) {
          this.$message.error('Please Account Authentication')
          return []
        }
        if (this.form?.sendToAndAmount.indexOf(this.separator) > 0) {
          this.sendObjList = this.form?.sendToAndAmount?.trim().split(/\s+/).map(item => {
            const list = item.split(this.separator)
            return {
              to: list[0],
              amount: list[1],
              type: this.transactionType
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
    },
    ...mapActions({
      sendTrx: 'compute/sendTrx',
      sendUsdt: 'compute/sendUsdt'
    })
  }
}
</script>
<style scoped>
.filter-container {
  display: flex;
}
.box-card {
  width: 50%;
  min-height: 430px;
  flex:1;
}
.excel-template {
  font-size: 14px
}
</style>
