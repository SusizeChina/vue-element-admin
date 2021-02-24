<template>
  <!-- 添加或修改参数配置对话框 -->
  <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
    <el-form ref="form" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="字典名称" prop="dictType">
        <el-select v-model="form.dictType" size="small" :disabled="true">
          <el-option
            v-for="item in typeOptions"
            :key="item.dictId"
            :label="item.dictLabel"
            :value="item.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="数据标签" prop="dictLabel">
        <el-input v-model="form.dictLabel" placeholder="请输入数据标签" />
      </el-form-item>
      <el-form-item label="数据键值" prop="dictValue">
        <el-input v-model="form.dictValue" placeholder="请输入数据键值" />
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
import { getDictInfo, getDictInfoByDictType, updateDict, addDict } from '@/api/system/dict'

export default {
  data() {
    return {
      title: undefined,
      open: false,
      statusOptions: [],
      typeOptions: [],
      form: {},
      rules: {
        dictLabel: [
          { required: true, message: '数据标签不能为空', trigger: 'blur' }
        ],
        dictValue: [
          { required: true, message: '数据键值不能为空', trigger: 'blur' }
        ],
        sort: [
          { required: true, message: '数据顺序不能为空', trigger: 'blur' }
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
    this.getDictTypes('parent').then(response => {
      this.typeOptions = response.data
    })
    this.getDictTypes(this.SYS_DICT_STATUS).then(response => {
      this.statusOptions = response.data
    })
  },
  methods: {
    init(row, dictType) {
      if (row.dictId) {
        this.handleUpdate(row)
      } else {
        this.handleAdd(dictType)
      }
    },
    statusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.status)
    },
    cancel() {
      this.open = false
      this.reset()
    },
    reset() {
      this.form = {
        dictId: undefined,
        dictLabel: undefined,
        dictValue: undefined,
        sort: 0,
        status: '0',
        remarks: undefined
      }
      this.resetForm('form')
    },
    handleAdd(dictType) {
      this.reset()
      this.form.dictType = dictType
      getDictInfoByDictType(this.form.dictType).then(response => {
        this.form.parentId = response.data.dictId
        this.open = true
        this.title = '添加字典数据'
      })
    },
    handleUpdate(row) {
      this.reset()
      const dictId = row.dictId
      getDictInfo(dictId).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改字典数据'
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
