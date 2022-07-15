<template>
  <div class="navbar">
    <hamburger :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />

    <breadcrumb class="breadcrumb-container" />
    <span v-if="env_name" class="env-class-r1"><el-tag> {{ env_name }}</el-tag></span>
    <span class="env-class-r2" @click="openWindowEdit"><i class="el-icon-setting" /></span>
    <div class="right-menu">
      <el-dropdown class="avatar-container" trigger="click">
        <div class="avatar-wrapper">
          <img src="@/assets/user.gif" class="user-avatar">
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown" class="user-dropdown">
          <router-link to="/">
            <el-dropdown-item>
              主页
            </el-dropdown-item>
          </router-link>
          <el-dropdown-item @click.native="modifyPasswordShow">
            更改密码
          </el-dropdown-item>
          <a target="_blank" href="https://github.com/PanJiaChen/vue-admin-template/">
            <el-dropdown-item>Github</el-dropdown-item>
          </a>
          <a target="_blank" href="https://panjiachen.github.io/vue-element-admin-site/#/">
            <el-dropdown-item>文档</el-dropdown-item>
          </a>
          <el-dropdown-item divided @click.native="logout">
            <span style="display:block;">登出</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>

    <el-dialog
      title="修改密码"
      :visible.sync="modifyPasswordDialogVisible"
      width="30%"
      :before-close="handleClose"
    >
      <el-form ref="ruleForm" :model="ruleForm" status-icon :rules="rules" label-width="100px" class="demo-ruleForm">
        <el-form-item label="新密码" prop="password">
          <el-input v-model="ruleForm.password" type="password" autocomplete="off" />
        </el-form-item>
        <el-form-item label="新密码确认" prop="checkPass">
          <el-input v-model="ruleForm.checkPass" type="password" autocomplete="off" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm('ruleForm')">提交</el-button>
          <el-button @click="resetForm('ruleForm')">重置</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <el-dialog
      title="设置"
      :visible.sync="openWindowEditDialogVisible"
      width="30%"
      center
    >
      <el-form ref="form" :model="settingForm">
        <el-form-item label="质押位数设置">
          <el-input-number v-model.number="settingForm.rewardsBit" :step="1" size="small" :min="0" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="openWindowEditDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSaveSetting">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import { modifySelfUserInfo } from '@/api/user'

export default {
  components: {
    Breadcrumb,
    Hamburger
  },

  data: function() {
    var validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      } else {
        if (this.ruleForm.checkPass !== '') {
          this.$refs.ruleForm.validateField('checkPass')
        }
        callback()
      }
    }
    var validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.ruleForm.password) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      modifyPasswordDialogVisible: false,
      openWindowEditDialogVisible: false,
      ruleForm: {
        password: '',
        checkPass: '',
        age: ''
      },
      env_name: '',
      rules: {
        password: [
          { validator: validatePass, trigger: 'blur' }
        ],
        checkPass: [
          { validator: validatePass2, trigger: 'blur' }
        ]
      },
      settingForm: {},
      rewardsBit: 4
    }
  },
  mounted() {
    this.env_name = process.env.VUE_APP_ENV_NAME
    console.log('##process.env##', process.env)
    this.getSetting()
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar'
    ])
  },
  methods: {
    getSetting() {
      const rewardsBit = this.rewardsBit
      // 读取setting
      const APP_SETTING = 'APP_SETTING'
      let nodeSetting = localStorage.getItem(APP_SETTING) || ''
      if (nodeSetting) {
        nodeSetting = JSON.parse(nodeSetting) || {}
      } else {
        nodeSetting = { rewardsBit }
        localStorage.setItem(APP_SETTING, JSON.stringify(nodeSetting))
      }
      this.settingForm = nodeSetting
    },
    handleSaveSetting() {
      const APP_SETTING = 'APP_SETTING'
      const setting = JSON.stringify(this.settingForm)
      localStorage.setItem(APP_SETTING, setting)
      this.openWindowEditDialogVisible = false
    },
    openWindowEdit() {
      this.getSetting()
      this.openWindowEditDialogVisible = true
    },
    modifyPasswordShow() {
      this.modifyPasswordDialogVisible = true
      this.resetForm('ruleForm')
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          modifySelfUserInfo(this.ruleForm).then((res) => {
            const { code } = res
            if (code === 'SUCCESS') {
              this.modifyPasswordDialogVisible = false
              this.$notify({
                title: 'Success',
                message: '修改密码成功',
                type: 'success',
                duration: 2000
              })
            } else {
              this.$notify.error({
                title: '错误',
                message: '密码修改失败，请联系管理员！',
                duration: 2000
              })
            }
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    resetForm(formName) {
      if (this && this.$refs && this.$refs[formName] && this.$refs[formName].resetFields) {
        this.$refs[formName].resetFields()
      }
    },
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    async logout() {
      await this.$store.dispatch('user/logout')
      this.$router.push(`/login?redirect=${this.$route.fullPath}`)
    },
    handleClose(done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          done()
        })
        .catch(_ => {})
    }
  }
}
</script>

<style lang="scss" scoped>
.env-class-r1 {
 position: absolute;
 right: 100px;
 top: 10px;
}
.env-class-r2 {
 position: absolute;
 right: 200px;
 top: 18px;
}
.env-class-r2:hover {
    background-color: skyblue;
    box-shadow: skyblue 10px;
    cursor: pointer;
}
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color:transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
