<template>
  <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
    <el-form ref="form" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="字典名称" prop="dictLabel">
        <el-input v-model="form.dictLabel" placeholder="请输入字典名称" />
      </el-form-item>
      <el-form-item label="字典编码" prop="dictValue">
        <el-input v-model="form.dictValue" placeholder="请输入字典编码" />
      </el-form-item>
      <el-form-item label="显示排序" prop="sort">
        <el-input-number v-model="form.sort" controls-position="right" :min="0" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio
            v-for="dict in statusOptions"
            :key="dict.dictValue"
            :label="dict.dictValue"
          >{{ dict.dictLabel }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="描叙" prop="description">
        <el-input v-model="form.description" type="textarea" placeholder="请输入内容" />
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
      form: {
        parentId: '0',
        dictType: 'parent'
      },
      rules: {
        dictLabel: [
          { required: true, message: '字典名称不能为空', trigger: 'blur' }
        ],
        dictValue: [
          { required: true, message: '字典编码不能为空', trigger: 'blur' }
        ],
        sort: [
          { required: true, message: '显示排序不能为空', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '状态不能为空', trigger: 'blur' }
        ],
        parentId: [
          { required: true, message: '父类ID不能为空', trigger: 'blur' }
        ],
        dictType: [
          { required: true, message: '字典类型不能为空', trigger: 'blur' }
        ],
        description: [
          { required: true, message: '描叙不能为空', trigger: 'blur' }
        ],
        remarks: [
          { required: true, message: '备注不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getDictTypes(this.SYS_DICT_STATUS).then(response => {
      this.statusOptions = response.data
    })
  },
  methods: {
    init(row) {
      if (row.dictId) {
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
        dictId: undefined,
        parentId: '0',
        dictLabel: undefined,
        dictType: 'parent',
        status: '0',
        sort: 0,
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
      const dictId = row.dictId
      getDictInfo(dictId).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改字典类型'
      })
    },
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.dictId !== undefined) {
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
