<template>

  <!-- 添加或修改部门对话框 -->
  <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
    <el-form ref="form" :model="form" :rules="rules" label-width="80px">
      <el-row>
        <el-col v-if="form.parentId !== '0'" :span="24">
          <el-form-item label="上级部门" prop="parentId">
            <TreeSelect v-model="form.parentId" :options="officeOptions" :normalizer="normalizer" placeholder="选择上级部门" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="部门名称" prop="officeName">
            <el-input v-model="form.officeName" placeholder="请输入部门名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="显示排序" prop="sort">
            <el-input-number v-model="form.sort" controls-position="right" :min="0" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="负责人" prop="master">
            <el-input v-model="form.master" placeholder="请输入负责人" maxlength="20" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系电话" prop="phone">
            <el-input v-model="form.phone" placeholder="请输入联系电话" maxlength="11" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="部门状态">
            <el-radio-group v-model="form.status">
              <el-radio
                v-for="dict in statusOptions"
                :key="dict.dictValue"
                :label="dict.dictValue"
              >{{ dict.dictLabel }}
              </el-radio>
            </el-radio-group>
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
import { addOffice, getOfficeInfo, getAllOffices, updateOffice } from '@/api/system/office'
import TreeSelect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

export default {
  components: { TreeSelect },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 表格树数据
      officeList: [],
      // 部门树选项
      officeOptions: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 状态数据字典
      statusOptions: [],
      // 查询参数
      listParams: {
        officeName: undefined,
        status: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        parentId: [
          { required: true, message: '上级部门不能为空', trigger: 'blur' }
        ],
        officeName: [
          { required: true, message: '部门名称不能为空', trigger: 'blur' }
        ],
        sort: [
          { required: true, message: '部门顺序不能为空', trigger: 'blur' }
        ],
        email: [
          {
            type: 'email',
            message: "'请输入正确的邮箱地址",
            trigger: ['blur', 'change']
          }
        ],
        phone: [
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
    this.getDictTypes(this.STATUS).then(response => {
      this.statusOptions = response.data
    })
  },
  methods: {
    init(row) {
      if (row.officeId) {
        this.handleUpdate(row)
      } else {
        this.handleAdd(row)
      }
    },
    /** 转换部门数据结构 */
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
    // 字典状态字典翻译
    statusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.status)
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        officeId: undefined,
        parentId: undefined,
        officeName: undefined,
        sort: undefined,
        master: undefined,
        phone: undefined,
        email: undefined,
        status: '0'
      }
      this.resetForm('form')
    },

    /** 新增按钮操作 */
    handleAdd(row) {
      this.reset()
      if (row !== undefined) {
        this.form.parentId = row.officeId
      }
      this.open = true
      this.title = '添加部门'
      getAllOffices().then(response => {
        this.officeOptions = this.handleTree(response.data, 'officeId', 'parentId', 'children', '0')
      })
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const officeId = row.officeId
      getOfficeInfo({ 'officeId': officeId }).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改部门'
      })
      getAllOffices({ 'officeId': officeId }).then(response => {
        this.officeOptions = this.handleTree(response.data, 'officeId', 'parentId', 'children', '0')
      })
    },
    /** 查询按钮操作 */
    handleInfo(row) {
      this.reset()
      getOfficeInfo({ 'officeId': row.officeId }).then(response => {
        this.form = response.data
        this.open = true
        this.title = '查询部门'
      })
      getAllOffices({ 'officeId': row.officeId }).then(response => {
        this.officeOptions = this.handleTree(response.data, 'officeId', 'parentId', 'children', '0')
      })
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.officeId !== undefined) {
            updateOffice(this.form).then(data => {
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
            addOffice(this.form).then(data => {
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
