<template>
  <div class="app-container">
    <div class="filter-container">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>Transfer Record</span>
        </div>
        <el-button v-show="transactionList.length >0" type="primary" @click="exportExcel">Export</el-button>
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
        <div>
          <el-table
            :key="tableKey"
            v-loading="listLoading"
            :data="transactionList"
            border
            fit
            highlight-current-row
            style="width: 100%"
            size="mini"
            empty-text="No data"
          >
            <el-table-column type="expand">
              <template slot-scope="props">
                <el-form label-position="left" inline class="demo-table-expand">
                  <el-form-item label="type">
                    <span>{{ props.row.type }}</span>
                  </el-form-item>

                  <el-form-item label="from">
                    <span>{{ props.row.from }}</span>
                  </el-form-item>

                  <el-form-item label="to">
                    <span>{{ props.row.to }}</span>
                  </el-form-item>

                  <el-form-item label="amount">
                    <span>{{ props.row.amount }}</span>
                  </el-form-item>

                  <el-form-item label="transaction">
                    <span>{{ props.row.transaction }}</span>
                  </el-form-item>
                </el-form>
              </template>
            </el-table-column>

            <el-table-column align="center" label="type" prop="type">
              <template slot-scope="{ row }">
                <span>{{ row.type }}</span>
              </template>
            </el-table-column>
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

            <el-table-column align="center" label="result">
              <template slot-scope="{ row }">
                <span>{{ row.result }}</span>
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
import { mapGetters } from 'vuex'
import { getCurrentTime } from '@/utils/date-time'
import { export_json_to_excel } from '@/excel/export2Excel'

export default {
  name: 'Query',
  directives: { waves },
  data() {
    return {
      confirmLoading: false,
      tableKey: 0,
      listLoading: false,
      listQuery: {
        account: undefined
      },
      tranferRecordExcelMapping: [
        {
          text: 'type',
          value: 'type'
        },
        {
          text: 'from',
          value: 'from'
        },
        {
          text: 'to',
          value: 'to'
        },
        {
          text: 'amount',
          value: 'amount'
        },
        {
          text: 'result',
          value: 'result'
        },
        {
          text: 'transaction',
          value: 'transaction'
        }
      ]
    }
  },
  computed: {
    ...mapGetters([
      'transactionList'
    ])
  },
  methods: {
    exportExcel() {
      const excelName = 'batch_transfer_result' + '_' + getCurrentTime()
      const tHeader = this.tranferRecordExcelMapping.map((item) => item.text)
      const filterVal = this.tranferRecordExcelMapping.map(
        (item) => item.value
      )
      const data = this.formatJson(filterVal, this.transactionList)
      export_json_to_excel(tHeader, data, excelName)
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map((v) => filterVal.map((j) => {
        if (j !== 'transaction') {
          return v[j]
        }
        return JSON.stringify(v[j])
      }))
    }
  }
}
</script>
<style>
.app-container {
  padding: 10px;
}
.demo-table-expand {
    font-size: 0;
  }
  .demo-table-expand label {
    width: 90px;
    color: #99a9bf;
  }
  .demo-table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    width: 50%;
  }
</style>
