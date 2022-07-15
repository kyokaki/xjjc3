<template>
  <div class="xjcc-sector">
    <el-col v-for="(val, key, i) in summaryList" :key="i" :span="3" style="padding: 1px">
      <div class="xjcc-sector-item">
        <div class="xjcc-sector-label">{{ key }}</div>
        <div class="xjcc-sector-val">{{ val }}</div>
      </div>
    </el-col>
  </div>
</template>

<script>

export default {
  props: {
    summaryList: {
      type: Object,
      default: () => {
        return {
          Total: 0
        }
      }
    }
  },
  data() {
    return {

    }
  },
  created() {

  },
  methods: {

  }
}
</script>

<style scoped>
  .xjcc-sector {
      margin: 20px 0 0 0;
      overflow: auto;
  }
  .xjcc-sector-item {
    text-align: center;
    line-height: 16px;
}
  .xjcc-sector-item .xjcc-sector-label {
      background-color: #409EFF;
      color:white;

  }
   .xjcc-sector-item .xjcc-sector-val {
        color: #409EFF;
         background-color: white;
  }

</style>
