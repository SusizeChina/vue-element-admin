<template>

  <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
    <el-form ref="form" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="角色名称" prop="roleName">
        <el-input v-model="form.roleName" placeholder="请输入角色名称" />
      </el-form-item>
      <el-form-item label="权限字符" prop="roleKey">
        <el-input v-model="form.roleKey" placeholder="请输入权限字符" />
      </el-form-item>
      <el-form-item label="状态">
        <el-radio-group v-model="form.status">
          <el-radio
            v-for="dict in statusOptions"
            :key="dict.dictValue"
            :label="dict.dictValue"
          >{{ dict.dictLabel }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="菜单权限">
        <el-checkbox v-model="menuExpand" @change="handleCheckedTreeExpand($event, 'menu')">展开/折叠</el-checkbox>
        <el-checkbox v-model="menuNodeAll" @change="handleCheckedTreeNodeAll($event, 'menu')">全选/全不选</el-checkbox>
        <el-checkbox v-model="form.menuCheckStrictly" @change="handleCheckedTreeConnect($event, 'menu')">父子联动</el-checkbox>
        <el-tree
          ref="menu"
          class="tree-border"
          :data="menuOptions"
          show-checkbox
          node-key="menuId"
          :check-strictly="!form.menuCheckStrictly"
          empty-text="加载中，请稍后"
          :props="menuProps"
        />
      </el-form-item>
      <el-form-item label="备注">
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
import { addRole, updateRole, getRoleInfo } from '@/api/system/role'
import { getTreeAction } from '@/api/system/menu'

export default {
  data() {
    return {
      title: undefined,
      open: false,
      menuExpand: false,
      menuNodeAll: false,
      statusOptions: [],
      menuOptions: [],
      form: {},
      menuProps: {
        children: 'children',
        label: 'menuName'
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
    this.getDictTypes(this.STATUS).then(response => {
      this.statusOptions = response.data
    })
  },
  methods: {
    init(row) {
      if (row.roleId) {
        this.handleUpdate(row)
      } else {
        this.handleAdd()
      }
    },
    getMenuTreeSelect() {
      getTreeAction().then(response => {
        this.menuOptions = response.data
      })
    },
    getMenuAllCheckedKeys() {
      const checkedKeys = this.$refs.menu.getHalfCheckedKeys()
      const halfCheckedKeys = this.$refs.menu.getCheckedKeys()
      checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys)
      return checkedKeys
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      if (this.$refs.menu !== undefined) {
        this.$refs.menu.setCheckedKeys([])
      }
      this.menuExpand = false
      this.menuNodeAll = false
      this.form = {
        roleId: undefined,
        roleName: undefined,
        roleKey: undefined,
        status: '0',
        menuIds: [],
        menuCheckStrictly: true,
        remarks: undefined
      }
      this.resetForm('form')
    },
    // 树权限（展开/折叠）
    handleCheckedTreeExpand(value, type) {
      if (type === 'menu') {
        const treeList = this.menuOptions
        for (let i = 0; i < treeList.length; i++) {
          this.$refs.menu.store.nodesMap[treeList[i].menuId].expanded = value
        }
      }
    },
    handleCheckedTreeNodeAll(value, type) {
      if (type === 'menu') {
        this.$refs.menu.setCheckedNodes(value ? this.menuOptions : [])
      }
    },
    handleCheckedTreeConnect(value, type) {
      if (type === 'menu') {
        this.form.menuCheckStrictly = !!value
      }
    },
    handleAdd() {
      this.reset()
      this.getMenuTreeSelect()
      this.open = true
      this.title = '新增角色'
    },
    handleUpdate(row) {
      this.reset()
      this.getMenuTreeSelect()
      const roleId = row.roleId
      getRoleInfo(roleId).then(response => {
        this.form = response.data
        this.open = true
        this.$nextTick(() => {
          this.$refs.menu.setCheckedKeys(response.data.menuIds)
        })
        this.title = '修改角色'
      })
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.roleId !== undefined) {
            this.form.menuIds = this.getMenuAllCheckedKeys()
            updateRole(this.form).then(data => {
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
            this.form.menuIds = this.getMenuAllCheckedKeys()
            addRole(this.form).then(data => {
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
