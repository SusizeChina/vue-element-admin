<template>

  <el-dialog :title="title" :visible.sync="openDataScope" width="500px" append-to-body>
    <el-form :model="form" label-width="80px">
      <el-form-item label="角色名称">
        <el-input v-model="form.roleName" :disabled="true" />
      </el-form-item>
      <el-form-item label="权限字符">
        <el-input v-model="form.roleKey" :disabled="true" />
      </el-form-item>
      <el-form-item label="权限范围">
        <el-select v-model="form.dataScope">
          <el-option
            v-for="item in dataScopeOptions"
            :key="item.dictValue"
            :label="item.dictLabel"
            :value="item.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-show="form.dataScope == 2" label="数据权限">
        <el-checkbox v-model="officeExpand" @change="handleCheckedTreeExpand($event)">展开/折叠</el-checkbox>
        <el-checkbox v-model="officeNodeAll" @change="handleCheckedTreeNodeAll($event)">全选/全不选</el-checkbox>
        <el-checkbox v-model="officeCheckStrictly" @change="handleCheckedTreeConnect($event)">父子联动
        </el-checkbox>
        <el-tree
          ref="office"
          class="tree-border"
          :data="officeOptions"
          show-checkbox
          default-expand-all
          node-key="officeId"
          :check-strictly="!officeCheckStrictly"
          empty-text="加载中，请稍后"
          :props="officeProps"
        />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitDataScope">确 定</el-button>
      <el-button @click="cancelDataScope">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getRoleInfo, updateRole } from '@/api/system/role'
import { getTreeOffice } from '@/api/system/office'

export default {
  data() {
    return {
      title: undefined,
      openDataScope: false,
      officeExpand: true,
      officeCheckStrictly: true,
      officeNodeAll: false,
      dataScopeOptions: [],
      officeOptions: [],
      // 表单参数
      form: {},
      officeProps: {
        children: 'children',
        label: 'officeName'
      },
      // 表单校验
      rules: {
        roleName: [
          { required: true, message: '角色名称不能为空', trigger: 'blur' }
        ],
        roleKey: [
          { required: true, message: '权限字符不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getDictTypes(this.DATA_SCOPE).then(response => {
      this.dataScopeOptions = response.data
    })
  },
  methods: {
    init(row) {
      if (row.roleId) {
        this.handleDataScope(row)
      }
    },
    getOfficeTreeSelect() {
      getTreeOffice().then(response => {
        this.officeOptions = response.data
      })
    },
    getOfficeAllCheckedKeys() {
      const checkedKeys = this.$refs.office.getHalfCheckedKeys()
      const halfCheckedKeys = this.$refs.office.getCheckedKeys()
      checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys)
      return checkedKeys
    },
    cancelDataScope() {
      this.openDataScope = false
      this.reset()
    },
    reset() {
      if (this.$refs.office !== undefined) {
        this.$refs.office.setCheckedKeys([])
      }
      this.officeExpand = true
      this.officeNodeAll = false
      this.officeCheckStrictly = true
      this.form = {
        roleId: undefined,
        roleName: undefined,
        roleKey: undefined,
        officeIds: []
      }
      this.resetForm('form')
    },
    handleCheckedTreeExpand(value, type) {
      const treeList = this.officeOptions
      for (let i = 0; i < treeList.length; i++) {
        this.$refs.office.store.nodesMap[treeList[i].officeId].expanded = value
      }
    },
    handleCheckedTreeNodeAll(value) {
      this.$refs.office.setCheckedNodes(value ? this.officeOptions : [])
    },
    handleCheckedTreeConnect(value) {
      this.officeCheckStrictly = value
    },
    handleDataScope(row) {
      this.reset()
      this.getOfficeTreeSelect()
      getRoleInfo(row.roleId).then(response => {
        this.form = response.data
        this.openDataScope = true
        this.$nextTick(() => {
          this.$refs.office.setCheckedKeys(response.data.officeIds)
        })
        this.title = '分配数据权限'
      })
    },
    submitDataScope: function() {
      if (this.form.roleId !== undefined) {
        this.form.officeIds = this.getOfficeAllCheckedKeys()
        updateRole(this.form).then(data => {
          this.$message({
            message: '操作成功',
            type: 'success',
            duration: 1500,
            onClose: () => {
              this.openDataScope = false
              this.$emit('refreshDataList')
            }
          })
        })
      }
    }
  }
}
</script>
