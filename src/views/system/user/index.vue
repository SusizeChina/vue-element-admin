<template>
  <div class="app-container">
    <el-row :gutter="20">

      <el-col :span="4" :xs="24">
        <div class="head-container">
          <el-input
            v-model="officeName"
            placeholder="请输入部门名称"
            clearable
            size="small"
            prefix-icon="el-icon-search"
            style="margin-bottom: 20px"
          />
        </div>
        <div class="head-container">
          <el-tree
            ref="tree"
            :data="officeOptions"
            :props="defaultProps"
            :expand-on-click-node="false"
            :filter-node-method="filterNode"
            default-expand-all
            @node-click="handleNodeClick"
          />
        </div>
      </el-col>

      <el-col :span="20" :xs="24">
        <el-form v-show="showSearch" ref="queryForm" :model="queryParams" :inline="true" label-width="90px">
          <el-form-item label="用户姓名" prop="fullName">
            <el-input
              v-model="queryParams.fullName"
              placeholder="请输入用户姓名"
              clearable
              size="small"
              style="width: 240px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item v-if="!selectUserFlag" label="手机号码" prop="mobile">
            <el-input
              v-model="queryParams.mobile"
              placeholder="请输入手机号码"
              clearable
              size="small"
              style="width: 240px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item v-if="!selectUserFlag" label="用户状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="用户状态" clearable size="small" style="width: 240px">
              <el-option
                v-for="dict in statusOptions"
                :key="dict.dictValue"
                :label="dict.dictLabel"
                :value="dict.dictValue"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="创建时间">
            <el-date-picker
              v-model="dateRange"
              size="small"
              style="width: 240px"
              value-format="yyyy-MM-dd"
              type="daterange"
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            />
          </el-form-item>

          <el-form-item>
            <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">查询</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row v-if="!selectUserFlag" :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button
              v-permission="['system:user:add']"
              type="primary"
              icon="el-icon-plus"
              size="mini"
              @click="handleAdd"
            >新增
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-permission="['system:user:edit']"
              type="success"
              icon="el-icon-edit"
              size="mini"
              :disabled="single"
              @click="handleUpdate"
            >修改
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-permission="['system:user:remove']"
              type="danger"
              icon="el-icon-delete"
              size="mini"
              :disabled="multiple"
              @click="handleDelete"
            >删除
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-permission="['system:user:resetPwd']"
              type="success"
              icon="el-icon-refresh"
              size="mini"
              :disabled="single"
              @click="handleResetPwd"
            >重置密码
            </el-button>
          </el-col>

          <el-col :span="1.5">
            <el-button
              v-permission="['system:user:import']"
              type="info"
              icon="el-icon-upload2"
              size="mini"
              @click="handleImport"
            >导入
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-permission="['system:user:export']"
              type="warning"
              icon="el-icon-download"
              size="mini"
              @click="handleExport"
            >导出
            </el-button>
          </el-col>

          <right-toolbar :show-search.sync="showSearch" @queryTable="getList" />
        </el-row>

        <el-table
          ref="userTable"
          v-loading="loading"
          :data="userList"
          @selection-change="handleSelectionChange"
          @select="handleSelect"
          @select-all="handleSelectAll"
        >
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="用户名" align="center" prop="userName" :formatter="selectedFormat" />
          <el-table-column label="用户姓名" align="center" prop="fullName" :show-overflow-tooltip="true" />
          <el-table-column label="部门" align="center" prop="dept.officeName" :show-overflow-tooltip="true" />
          <el-table-column label="手机号码" align="center" prop="mobile" width="120" />
          <el-table-column label="邮箱" align="center" prop="email" :show-overflow-tooltip="true" />
          <el-table-column v-if="!selectUserFlag" label="状态" align="center">
            <template slot-scope="scope">
              <el-switch
                v-model="scope.row.status"
                active-value="0"
                inactive-value="1"
                @change="handleStatusChange(scope.row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="创建时间" align="center" prop="createTime" width="160">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
          </el-table-column>

          <el-table-column label="操作" align="center" width="160" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button
                v-permission="['system:user:edit']"
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleUpdate(scope.row)"
              >修改
              </el-button>
              <el-button
                v-if="scope.row.userName !== 1"
                v-permission="['system:user:remove']"
                size="mini"
                type="text"
                icon="el-icon-delete"
                @click="handleDelete(scope.row)"
              >删除
              </el-button>
              <el-button
                v-permission="['system:user:resetPwd']"
                size="mini"
                type="text"
                icon="el-icon-key"
                @click="handleResetPwd(scope.row)"
              >重置
              </el-button>
            </template>
          </el-table-column>

        </el-table>

        <pagination
          v-show="total>0"
          :total="total"
          :page.sync="queryParams.pageNum"
          :limit.sync="queryParams.pageSize"
          @pagination="getList"
        />

      </el-col>

    </el-row>
    <div v-if="selectUserFlag" style="text-align: right;">
      <el-button type="primary" @click="submitDialogSelect">确 定</el-button>
      <el-button @click="cancelDialog">取 消</el-button>
    </div>

    <!-- 添加或修改参数配置对话框 -->
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

    <!-- 用户导入对话框 -->
    <el-dialog :title="upload.title" :visible.sync="upload.open" width="400px" append-to-body>
      <el-upload
        ref="upload"
        :limit="1"
        accept=".xlsx, .xls"
        :headers="upload.headers"
        :action="upload.url + '?updateSupport=' + upload.updateSupport"
        :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess"
        :auto-upload="false"
        drag
      >
        <i class="el-icon-upload" />
        <div class="el-upload__text">
          将文件拖到此处，或
          <em>点击上传</em>
        </div>
        <div slot="tip" class="el-upload__tip">
          <el-checkbox v-model="upload.updateSupport" />
          是否更新已经存在的用户数据
          <el-link type="info" style="font-size:12px" @click="importTemplate">下载模板</el-link>
        </div>
        <div slot="tip" class="el-upload__tip" style="color:red">提示：仅允许导入“xls”或“xlsx”格式文件！</div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFileForm">确 定</el-button>
        <el-button @click="upload.open = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { addUser, updateUser, getUserInfo, getUsers, deleteUsers, changeUserStatus, resetUserPassword, exportUser, importUserTemplate } from '@/api/system/user'
import { getToken } from '@/utils/auth'
import { getTreeOffice } from '@/api/system/office'
import TreeSelect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

export default {
  name: 'User',
  components: { TreeSelect },
  props: {
    selectUserFlag: {
      type: Boolean,
      default: false
    },
    userDialogVisible: {
      type: Boolean,
      default: false
    },
    selectedUserList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 用户表格数据
      userList: null,
      // 弹出层标题
      title: '',
      // 部门树选项
      officeOptions: [],
      // 是否显示弹出层
      open: false,
      // 部门名称
      officeName: undefined,
      // 默认密码
      initPassword: undefined,
      // 日期范围
      dateRange: [],
      // 状态数据字典
      statusOptions: [],
      // 性别状态字典
      sexOptions: [],
      // 岗位选项
      postOptions: [],
      // 角色选项
      roleOptions: [],
      // 表单参数
      form: {},
      defaultProps: {
        children: 'children',
        label: 'officeName'
      },
      // 用户导入参数
      upload: {
        // 是否显示弹出层（用户导入）
        open: false,
        // 弹出层标题（用户导入）
        title: '',
        // 是否禁用上传
        isUploading: false,
        // 是否更新已经存在的用户数据
        updateSupport: 0,
        // 设置上传的请求头部
        headers: { Authorization: 'Bearer ' + getToken() },
        // 上传的地址
        url: process.env.VUE_APP_BASE_API + '/system/user/importData'
      },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        fullName: undefined,
        mobile: undefined,
        status: undefined,
        officeId: undefined
      },
      // 表单校验
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
  watch: {
    // 根据名称筛选部门树
    officeName(val) {
      this.$refs.tree.filter(val)
    }
  },
  created() {
    this.getList()
    this.getTreeOffice()
    this.getDictTypes(this.SYS_USER_STATUS).then((response) => {
      this.statusOptions = response.data
    })
    this.getDictTypes(this.SYS_USER_SEX).then((response) => {
      this.sexOptions = response.data
    })
    // this.getConfigKey('sys.user.initPassword').then((response) => {
    //   this.initPassword = response.msg
    // })
  },
  methods: {
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
    /** 查询用户列表 */
    getList() {
      this.loading = true
      getUsers(this.addDateRange(this.queryParams, this.dateRange)).then(
        (response) => {
          this.userList = response.data.list
          this.total = response.data.total
          this.loading = false
        }
      )
    },
    selectedFormat(row, column) {
      // 设置默认选中
      const ids = this.selectedUserList.map((item) => item.userName)
      if (ids.indexOf(row.userName) !== -1) {
        this.$refs['userTable'].toggleRowSelection(row, true)
      }
      return row.userName
    },
    /** 查询部门下拉树结构 */
    getTreeOffice() {
      getTreeOffice().then((response) => {
        this.officeOptions = response.data
      })
    },
    // 筛选节点
    filterNode(value, data) {
      if (!value) return true
      return data.officeName.indexOf(value) !== -1
    },
    // 节点单击事件
    handleNodeClick(data) {
      this.queryParams.officeId = data.id
      this.getList()
    },
    // 用户状态修改
    handleStatusChange(row) {
      const text = row.status === '0' ? '启用' : '停用'
      this.$confirm(
        '确认要"' + text + '""' + row.name + '"用户吗?',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(function() {
          return changeUserStatus(row.userName, row.status)
        })
        .then(() => {
          this.msgSuccess(text + '成功')
        })
        .catch(function() {
          row.status = row.status === '0' ? '1' : '0'
        })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
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
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.page = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = []
      this.resetForm('queryForm')
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.userName)
      this.names = selection.map((item) => item.name)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    handleSelectAll(selection) {
      this.handleSelect(selection, null)
    },
    handleSelect(selection, row) {
      console.info('111' + selection)
      const ids = selection.map((item) => item.userName)
      const list = this.userList
      for (var i = 0; i < this.userList.length; i++) {
        const data = this.userList[i]
        if (ids.indexOf(data.userName) === -1) { // 没勾选
          for (var j = 0; j < this.selectedUserList.length; j++) {
            if (data.userName === this.selectedUserList[j].userName) {
              // 删除选中
              this.selectedUserList.splice(j, 1)
            }
          }
        } else { // 已经勾选
          let selected = false
          for (var j = 0; j < this.selectedUserList.length; j++) {
            // 判断之前是否已经放入数组
            if (data.userName === this.selectedUserList[j].userName) {
              // 选中
              selected = true
              break
            }
          }
          if (!selected) {
            this.selectedUserList.push(data)
          }
        }
      }
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.getTreeOffice()
      getUserInfo().then((response) => {
        this.postOptions = response.posts
        this.roleOptions = response.roles
        this.open = true
        this.title = '添加操作员'
        this.form.password = this.initPassword
      })
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      this.getTreeOffice()
      const userName = row.userName || this.ids
      getUserInfo(userName).then((response) => {
        this.form = response.data
        this.postOptions = response.posts
        this.roleOptions = response.roles
        // this.form.postIds = response.postIds;
        this.form.roleIds = response.roleIds
        this.open = true
        this.title = '修改操作员'
        this.form.password = ''
      })
    },
    /** 重置密码按钮操作 */
    handleResetPwd(row) {
      const userName = row.userName || this.ids[0]
      const name = row.name || this.names
      this.$prompt('请输入"' + name + '"的新密码', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
        .then(({ value }) => {
          resetUserPassword(userName, value).then((response) => {
            if (response.code === 200) {
              this.msgSuccess('修改成功，新密码是：' + value)
            }
          })
        })
        .catch(() => {
        })
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.form.userName !== undefined) {
            updateUser(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
                this.open = false
                this.getList()
              }
            })
          } else {
            addUser(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess('新增成功')
                this.open = false
                this.getList()
              }
            })
          }
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const userNames = row.userName || this.ids
      this.$confirm(
        '是否确认删除编号为"' + userNames + '"这个编号吗?',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(function() {
          return deleteUsers(userNames)
        })
        .then(() => {
          this.getList()
          this.msgSuccess('删除成功')
        })
        .catch(function() {
        })
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams
      this.$confirm('是否确认导出所有用户数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(function() {
          return exportUser(queryParams)
        })
        .then((response) => {
          this.download(response.msg)
        })
        .catch(function() {
        })
    },
    /** 导入按钮操作 */
    handleImport() {
      this.upload.title = '用户导入'
      this.upload.open = true
    },
    /** 下载模板操作 */
    importTemplate() {
      importUserTemplate().then((response) => {
        this.download(response.msg)
      })
    },
    // 文件上传中处理
    handleFileUploadProgress(event, file, fileList) {
      this.upload.isUploading = true
    },
    // 文件上传成功处理
    handleFileSuccess(response, file, fileList) {
      this.upload.open = false
      this.upload.isUploading = false
      this.$refs.upload.clearFiles()
      this.$alert(response.msg, '导入结果', { dangerouslyUseHTMLString: true })
      this.getList()
    },
    // 提交上传文件
    submitFileForm() {
      this.$refs.upload.submit()
    },
    // 初始化弹出框
    initOpenSelectUser() {
      this.getList()
    },
    cancelDialog() {
      this.$emit('update:userDialogVisible', false)
    },
    // 弹出层确定按钮
    submitDialogSelect() {
      this.$emit('userSelectSubmit', this.selectedUserList)
      this.$emit('update:userDialogVisible', false)
    }
  }
}
</script>
