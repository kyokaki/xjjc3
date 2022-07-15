<template>
  <div class="app-container">
    <div class="filter-container">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>Transfer Record</span>
        </div>
        <el-form ref="form" :inline="true" :model="listQuery" class="demo-form-inline">
          <el-form-item v-if="false" label="Account" size="mini" prop="account">
            <el-input
              v-model="listQuery.account"
              placeholder="Account"
              style="width: 400px"
              class="filter-item"
              :clearable="true"
              @keyup.enter.native="handleFilter"
            />
          </el-form-item>
        </el-form>
        <!-- <div style="margin-bottom:10px;font-size:16px">
          <el-tag>Account Balance: </el-tag> <span>{{ accountBalance }}</span>
        </div> -->

        <div>
          <el-table
            :key="tableKey"
            v-loading="listLoading"
            :data="list"
            border
            fit
            highlight-current-row
            style="width: 100%"
            size="mini"
            empty-text="No data"
          >
            <!-- <el-table-column align="center" label="time">
              <template slot-scope="{ row }">
                <span>{{ row.mcTime }}</span>
              </template>
            </el-table-column> -->

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

            <el-table-column align="center" label="hash">
              <template slot-scope="{ row }">
                <span>{{ row.hash }}</span>
              </template>
            </el-table-column>

            <el-table-column align="center" label="amount">
              <template slot-scope="{ row }">
                <span>{{ row.amount }}</span>
              </template>
            </el-table-column>

          </el-table>
        </div>
      </el-card>

    </div>
  </div>
</template>

<script>
import waves from '@/directive/waves'
import Mcp from 'mcp.js'
import moment from 'moment'
import { getCurrentTime } from '@/utils/date-time'
import { export_json_to_excel } from '@/excel/export2Excel'

export default {
  name: 'Query',
  directives: { waves },
  data() {
    return {
      confirmLoading: false,
      tableKey: 0,
      list: [],
      listLoading: false,
      listQuery: {
        account: undefined
      },
      accountBalance: null,
      tranferRecordExcelMapping: [
        {
          text: 'from',
          value: 'from'
        },
        {
          text: 'to',
          value: 'to'
        },
        {
          text: 'hash',
          value: 'hash'
        },
        {
          text: 'amount',
          value: 'amount'
        }
      ]
    }
  },
  created() {
    this.mcp = new Mcp('https://huygens.computecoin.network/')
    this.$bus.$on('send_account', this.getAccount)
    this.$bus.$on('query_record', this.queryRecord)
  },
  methods: {
    exportExcel() {
      const excelName = 'batch_transfer_result' + '_' + getCurrentTime()
      const tHeader = this.tranferRecordExcelMapping.map((item) => item.text)
      const filterVal = this.tranferRecordExcelMapping.map(
        (item) => item.value
      )
      const data = this.formatJson(filterVal, this.list)
      export_json_to_excel(tHeader, data, excelName)
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map((v) => filterVal.map((j) => v[j]))
    },
    queryRecord(hashes) {
      this.getBlocks(hashes)
    },
    async getBlocks(hashes) {
      const { blocks } = await this.mcp.request.getBlocks(hashes)
      if (blocks?.length > 0) {
        blocks.forEach(async block => {
          const stateResult = await this.mcp.request.getBlockState(block.hash)
          const mc_timestamp = stateResult?.block_state?.stable_content?.mc_timestamp
          let time = ''
          if (mc_timestamp) {
            time = mc_timestamp ? moment.unix(mc_timestamp).utc().format() : ''
          }
          this.list.push({
            from: block.from,
            to: block?.content?.to,
            hash: block.hash,
            amount: this.formatAmount(block?.content?.amount),
            time
          })
          if (blocks?.length === this.list.length) {
            this.exportExcel()
          }
        })
      }
    },
    formatAmount(amount) {
      if (!amount) { return '' }
      return typeof amount === 'number' ? amount / Math.pow(10, 18) : parseInt(amount) / Math.pow(10, 18)
    },
    async getAccountBalance() {
      const { balance } = await this.mcp.request.accountBalance(this.listQuery.account)
      if (balance) {
        this.accountBalance = balance
      }
    },
    getAccount(account) {
      this.listQuery.account = account
    },
    filterHandler(value, row, column) {
      return row['direction'] === value
    }
  }
}
</script>
<style>
.app-container {
  padding: 10px;
}
</style>
