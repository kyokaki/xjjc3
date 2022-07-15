<template>
  <el-container>
    <el-header>
      <Menu />
    </el-header>
    <el-main>
      <Auth />
      <Send />
      <Query />
    </el-main>
  </el-container>
</template>

<script>
import Query from '@/views/compute/account/query'
import Send from '@/views/compute/account/send'
import Auth from '@/views/compute/account/auth'
import Menu from '@/views/compute/account/menu'
export default {
  name: 'Layout',
  components: {
    Menu,
    Query,
    Send,
    Auth
  },
  data() {
    return {

    }
  },
  methods: {

  }

}
</script>

<style>
.el-container {
  background: rgb(244, 244, 245);
  margin: 0 auto
}
.el-card {
  margin-bottom: 10px;
}
.clearfix:before,
  .clearfix:after {
    display: table;
    content: "";
  }
  .clearfix:after {
    clear: both
  }
  .box-card {
    padding: 10px;
  }
   .el-header{
    background:white
  }
</style>
