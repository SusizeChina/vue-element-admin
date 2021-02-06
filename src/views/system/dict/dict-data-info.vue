<template>
  <!-- 添加或修改参数配置对话框 -->
  <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
    <el-form ref="form" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="字典名称" prop="type">
        <el-select v-model="form.type" size="small" :disabled="true">
          <el-option
            v-for="item in typeOptions"
            :key="item.id"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="数据标签" prop="label">
        <el-input v-model="form.label" placeholder="请输入数据标签" />
      </el-form-item>
      <el-form-item label="数据键值" prop="value">
        <el-input v-model="form.value" placeholder="请输入数据键值" />
      </el-form-item>
      <el-form-item label="显示排序" prop="sort">
        <el-input-number v-model="form.sort" controls-position="right" :min="0" />
      </el-form-item>
      <el-form-item label="状态" prop="delFlag">
        <el-radio-group v-model="form.delFlag">
          <el-radio
            v-for="dict in statusOptions"
            :key="dict.value"
            :label="dict.value"
          >{{ dict.label }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="备注" prop="remarks">
        <el-input v-model="form.remarks" type="textarea" placeholder="请输入内容" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getDictInfo, updateDict, addDict } from '@/api/system/dict'

export default {
  data() {
    return {
      title: undefined,
      open: false,
      statusOptions: [],
      typeOptions: [],
      form: {},
      rules: {
        label: [
          { required: true, message: '数据标签不能为空', trigger: 'blur' }
        ],
        value: [
          { required: true, message: '数据键值不能为空', trigger: 'blur' }
        ],
        sort: [
          { required: true, message: '数据顺序不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getDictTypes('parent').then(response => {
      this.typeOptions = response.data
    })
    this.getDictTypes(this.SYS_DICT_STATUS).then(response => {
      this.statusOptions = response.data
    })
  },
  methods: {
    init(row) {
      if (row.id) {
        this.handleUpdate(row)
      } else {
        this.handleAdd(row)
      }
    },
    statusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.delFlag)
    },
    cancel() {
      this.open = false
      this.reset()
    },
    reset() {
      this.form = {
        id: undefined,
        label: undefined,
        value: undefined,
        sort: 0,
        delFlag: '0',
        remarks: undefined
      }
      this.resetForm('form')
    },
    /** 新增按钮操作 */
    handleAdd(row) {
      this.reset()
      this.open = true
      this.title = '添加字典数据'
      this.form.type = row.type
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id
      getDictInfo(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改字典数据'
      })
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.id !== undefined) {
            updateDict(this.form).then(data => {
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
            addDict(this.form).then(data => {
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
