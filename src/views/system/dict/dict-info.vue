<template>
  <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
    <el-form ref="form" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="字典名称" prop="label">
        <el-input v-model="form.label" placeholder="请输入字典名称" />
      </el-form-item>
      <el-form-item label="字典类型" prop="type">
        <el-input v-model="form.type" placeholder="请输入字典类型" />
      </el-form-item>
      <el-form-item label="状态" prop="delFlag">
        <el-radio-group v-model="form.delFlag">
          <el-radio
            v-for="dict in statusOptions"
            :key="dict.value"
            :label="dict.value"
          >{{ dict.label }}
          </el-radio>
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
import { addDict, updateDict, getDictInfo } from '@/api/system/dict'

export default {
  data() {
    return {
      title: undefined,
      open: false,
      statusOptions: [],
      form: {},
      rules: {
        label: [
          { required: true, message: '字典名称不能为空', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '字典类型不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    // 字典状态
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
    cancel() {
      this.open = false
      this.reset()
    },
    reset() {
      this.form = {
        id: undefined,
        label: undefined,
        type: undefined,
        delFlag: '0',
        remarks: undefined
      }
      this.resetForm('form')
    },
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加字典类型'
    },
    handleUpdate(row) {
      this.reset()
      const id = row.id
      getDictInfo(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改字典类型'
      })
    },
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
