<template>
  <el-form ref="form" :model="user" :rules="rules" label-width="80px">
    <el-form-item label="旧密码" prop="oldPassword">
      <el-input v-model="user.oldPassword" placeholder="请输入旧密码" type="password" />
    </el-form-item>
    <el-form-item label="新密码" prop="newPassword">
      <el-input v-model="user.newPassword" placeholder="请输入新密码" type="password" />
    </el-form-item>
    <el-form-item label="确认密码" prop="confirmPassword">
      <el-input v-model="user.confirmPassword" placeholder="请确认密码" type="password" />
    </el-form-item>
    <el-form-item v-if="dialogFlag" style="text-align: center;margin-right: 80px;">
      <el-button type="primary" size="mini" @click="submit">修改</el-button>
      <el-button type="danger" size="mini" @click="close">关闭</el-button>
    </el-form-item>
    <el-form-item v-else>
      <el-button type="primary" size="mini" @click="submit">保存</el-button>
      <el-button type="danger" size="mini" @click="close">关闭</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { updateUserPwd } from '@/api/system/user'

export default {
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    dialogFlag: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const equalToPassword = (rule, value, callback) => {
      if (this.user.newPassword !== value) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    }

    return {
      test: '1test',
      user: {
        oldPassword: undefined,
        newPassword: undefined,
        confirmPassword: undefined
      },
      // 表单校验
      rules: {
        oldPassword: [
          { required: true, message: '旧密码不能为空', trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: '新密码不能为空', trigger: 'blur' },
          { pattern: /^[0-9a-zA-Z_]{8,15}$/, message: '8-15位数字字母或_' }
          // { min: 6, max: 20, message: "长度在 6 到 20 个字符", trigger: "blur" }
        ],
        confirmPassword: [
          { required: true, message: '确认密码不能为空', trigger: 'blur' },
          { required: true, validator: equalToPassword, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    submit() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          updateUserPwd(this.user.oldPassword, this.user.newPassword).then(
            response => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
                if (this.dialogFlag) {
                  this.$emit('update:dialogVisible', false)
                }
              }
            }
          )
        }
      })
    },
    close() {
      if (this.dialogFlag) {
        this.$emit('update:dialogVisible', false)
      } else {
        this.$store.dispatch('tagsView/delView', this.$route)
        this.$router.push({ path: '/index' })
      }
    }
  }
}
</script>
