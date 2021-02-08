<template>
  <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
    <el-form ref="form" :model="form" :rules="rules" label-width="80px">
      <el-row>
        <el-col :span="24">
          <el-form-item label="上级菜单">
            <TreeSelect
              v-model="form.parentId"
              :options="menuOptions"
              :normalizer="normalizer"
              :show-count="true"
              placeholder="选择上级菜单"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="菜单类型" prop="menuType">
            <el-radio-group v-model="form.menuType">
              <el-radio label="M">目录</el-radio>
              <el-radio label="C">菜单</el-radio>
              <el-radio label="F">按钮</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item v-if="form.menuType != 'F'" label="菜单图标">
            <el-popover
              placement="bottom-start"
              width="460"
              trigger="click"
              @show="$refs['iconSelect'].reset()"
            >
              <IconSelect ref="iconSelect" @selected="selected" />
              <el-input slot="reference" v-model="form.icon" placeholder="点击选择图标" readonly>
                <svg-icon
                  v-if="form.icon"
                  slot="prefix"
                  :icon-class="form.icon"
                  class="el-input__icon"
                  style="height: 32px;width: 16px;"
                />
                <i v-else slot="prefix" class="el-icon-search el-input__icon" />
              </el-input>
            </el-popover>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="菜单名称" prop="menuName">
            <el-input v-model="form.menuName" placeholder="请输入菜单名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="显示排序" prop="orderNum">
            <el-input-number v-model="form.orderNum" controls-position="right" :min="0" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item v-if="form.menuType != 'F'" label="是否外链">
            <el-radio-group v-model="form.isFrame">
              <el-radio :label="0">是</el-radio>
              <el-radio :label="1">否</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item v-if="form.menuType != 'F'" label="路由地址" prop="path">
            <el-input v-model="form.path" placeholder="请输入路由地址" />
          </el-form-item>
        </el-col>
        <el-col v-if="form.menuType == 'C'" :span="12">
          <el-form-item label="组件路径" prop="component">
            <el-input v-model="form.component" placeholder="请输入组件路径" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item v-if="form.menuType != 'M'" label="权限标识">
            <el-input v-model="form.perms" placeholder="请权限标识" maxlength="50" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item v-if="form.menuType != 'F'" label="显示状态">
            <el-radio-group v-model="form.visible">
              <el-radio
                v-for="dict in visibleOptions"
                :key="dict.value"
                :label="dict.value"
              >{{ dict.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item v-if="form.menuType != 'F'" label="菜单状态">
            <el-radio-group v-model="form.status">
              <el-radio
                v-for="dict in statusOptions"
                :key="dict.value"
                :label="dict.value"
              >{{ dict.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item v-if="form.menuType == 'C'" label="是否缓存">
            <el-radio-group v-model="form.isCache">
              <el-radio :label="0">缓存</el-radio>
              <el-radio :label="1">不缓存</el-radio>
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
import { addMenu, updateMenu, getMenuInfo, getALLMenus } from '@/api/system/menu'

import TreeSelect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import IconSelect from '@/components/IconSelect'

export default {
  components: { TreeSelect, IconSelect },
  data() {
    return {
      menuOptions: [],
      title: undefined,
      open: false,
      visibleOptions: [],
      statusOptions: [],
      form: {},
      rules: {
        menuName: [
          { required: true, message: '菜单名称不能为空', trigger: 'blur' }
        ],
        orderNum: [
          { required: true, message: '菜单顺序不能为空', trigger: 'blur' }
        ],
        path: [
          { required: true, message: '路由地址不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getDictTypes(this.SYS_SHOW_HIDE).then(response => {
      this.visibleOptions = response.data
    })
    this.getDictTypes(this.STATUS).then(response => {
      this.statusOptions = response.data
    })
  },
  methods: {
    init(row) {
      if (row.menuId) {
        this.handleUpdate(row)
      } else {
        this.handleAdd(row)
      }
    },
    selected(name) {
      this.form.icon = name
    },
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children
      }
      return {
        id: node.menuId,
        label: node.menuName,
        children: node.children
      }
    },
    getTreeSelect() {
      getALLMenus().then(response => {
        this.menuOptions = []
        const menu = { menuId: 0, menuName: '主类目', children: [] }
        menu.children = this.handleTree(response.data, 'menuId')
        this.menuOptions.push(menu)
      })
    },
    cancel() {
      this.open = false
      this.reset()
    },
    reset() {
      this.form = {
        menuId: undefined,
        parentId: 0,
        menuName: undefined,
        icon: undefined,
        menuType: 'M',
        orderNum: undefined,
        isFrame: '1',
        perms: undefined,
        isCache: '0',
        visible: '0',
        status: '0'
      }
      this.resetForm('form')
    },
    handleAdd(row) {
      this.reset()
      this.getTreeSelect()
      if (row != null && row.menuId) {
        this.form.parentId = row.menuId
      } else {
        this.form.parentId = 0
      }
      this.open = true
      this.title = '添加菜单'
    },
    handleUpdate(row) {
      this.reset()
      this.getTreeSelect()
      getMenuInfo(row.menuId).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改菜单'
      })
    },
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.menuId !== undefined) {
            updateMenu(this.form).then(data => {
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
            addMenu(this.form).then(data => {
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
