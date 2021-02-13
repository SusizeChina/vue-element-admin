<template>
  <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
    <el-form ref="form" :model="form" :rules="rules" label-width="80px">
      <el-row>
        <el-col :span="12">
          <el-form-item label="用户姓名" prop="fullName">
            <el-input v-model="form.fullName" placeholder="请输用户姓名" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="归属部门" prop="officeId">
            <TreeSelect v-model="form.officeId" :options="officeOptions" :normalizer="normalizer" :show-count="true" placeholder="请选择归属部门" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="手机号码" prop="mobile">
            <el-input v-model="form.mobile" placeholder="请输入手机号码" maxlength="11" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="员工性别">
            <el-select v-model="form.sex" placeholder="请选择">
              <el-option
                v-for="dict in sexOptions"
                :key="dict.dictValue"
                :label="dict.dictLabel"
                :value="dict.dictValue"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态">
            <el-radio-group v-model="form.status">
              <el-radio v-for="dict in statusOptions" :key="dict.dictValue" :label="dict.dictValue">{{
                dict.dictLabel
              }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item v-if="form.userName == undefined" label="登录账号" prop="name">
            <el-input v-model="form.name" placeholder="请输登录账号" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item v-if="form.userName == undefined" label="登录密码" prop="password">
            <el-input v-model="form.password" placeholder="请输密码" type="password" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="岗位">
            <el-select v-model="form.postIds" multiple placeholder="请选择">
              <el-option v-for="item in postOptions" :key="item.postId" :label="item.postName" :value="item.postId" :disabled="item.status == 1" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="角色">
            <el-select v-model="form.roleIds" multiple placeholder="请选择">
              <el-option
                v-for="item in roleOptions"
                :key="item.roleId"
                :label="item.roleName"
                :value="item.roleId"
                :disabled="item.status == 1"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="24">
          <el-form-item label="备注">
            <el-input v-model="form.remarks" type="textarea" placeholder="请输入内容" />
          </el-form-item>
        </el-col>
      </el-row>

    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { addUser, updateUser, getUserInfo } from '@/api/system/user'
import { getAllPosts } from '@/api/system/post'
import { getAllRoles } from '@/api/system/role'
import { getTreeOffice } from '@/api/system/office'
import TreeSelect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

export default {
  components: { TreeSelect },
  data() {
    return {
      multiple: true,
      title: undefined,
      open: false,
      initPassword: undefined,
      statusOptions: [],
      officeOptions: [],
      sexOptions: [],
      postOptions: [],
      roleOptions: [],
      form: {},
      rules: {
        userName: [
          { required: true, message: '登录账号不能为空', trigger: 'blur' }
        ],
        fullName: [
          { required: true, message: '用户姓名不能为空', trigger: 'blur' }
        ],
        officeId: [
          { required: true, message: '归属部门不能为空', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '登录密码密码不能为空', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '邮箱地址不能为空', trigger: 'blur' },
          {
            type: 'email',
            message: "'请输入正确的邮箱地址",
            trigger: ['blur', 'change']
          }
        ],
        mobile: [
          { required: true, message: '手机号码不能为空', trigger: 'blur' },
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: '请输入正确的手机号码',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created() {
    this.getTreeOffice()
    this.getPosts()
    this.getRoles()
    this.getDictTypes(this.SYS_USER_STATUS).then((response) => {
      this.statusOptions = response.data
    })
    this.getDictTypes(this.SYS_USER_SEX).then((response) => {
      this.sexOptions = response.data
    })
  },
  methods: {
    init(row) {
      if (row.userId) {
        this.handleUpdate(row)
      } else {
        this.handleAdd()
      }
    },
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children
      }
      return {
        id: node.officeId,
        label: node.officeName,
        children: node.children
      }
    },
    getTreeOffice() {
      getTreeOffice().then((response) => {
        this.officeOptions = response.data
      })
    },
    getRoles() {
      getAllRoles().then((response) => {
        this.roleOptions = response.data
      })
    },
    getPosts() {
      getAllPosts().then((response) => {
        this.postOptions = response.data
      })
    },
    cancel() {
      this.open = false
      this.reset()
    },
    reset() {
      this.form = {
        userName: undefined,
        officeId: undefined,
        fullName: undefined,
        officeName: undefined,
        password: undefined,
        mobile: undefined,
        email: undefined,
        sex: undefined,
        status: '0',
        remarks: undefined,
        postIds: [],
        roleIds: []
      }
      this.resetForm('form')
    },
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加操作员'
      this.form.password = this.initPassword
    },
    handleUpdate(row) {
      this.reset()
      const userId = row.userId
      getUserInfo(userId).then((response) => {
        this.form = response.data
        this.open = true
        this.title = '修改操作员'
        this.form.password = undefined
      })
    },
    submitForm: function() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.form.userName !== undefined) {
            updateUser(this.form).then(data => {
              this.$message({
                message: '操作成功',
                type: 'success',
                duration: 1500,
                onClose: () => {
                  this.open = false
                  this.$emit('refreshDataList')
                }
              })
            })
          } else {
            addUser(this.form).then(data => {
              this.$message({
                message: '操作成功',
                type: 'success',
                duration: 1500,
                onClose: () => {
                  this.open = false
                  this.$emit('refreshDataList')
                }
              })
            })
          }
        }
      })
    }
  }
}
</script>
