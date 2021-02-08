<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="listForm" :model="listQuery" :inline="true">
      <el-form-item label="菜单名称" prop="menuName">
        <el-input
          v-model="listQuery.menuName"
          placeholder="请输入菜单名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="listQuery.status" placeholder="菜单状态" clearable size="small">
          <el-option
            v-for="dict in statusOptions"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">查询</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-permission="['system:menu:add']"
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleMenuInfo()"
        >新增
        </el-button>
      </el-col>
      <right-toolbar :show-search.sync="showSearch" @queryTable="getList" />
    </el-row>

    <el-table
      v-loading="loading"
      :data="menuList"
      row-key="menuId"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >
      <el-table-column prop="menuName" label="菜单名称" :show-overflow-tooltip="true" width="160" />
      <el-table-column prop="icon" label="图标" align="center" width="100">
        <template slot-scope="scope">
          <svg-icon :icon-class="scope.row.icon" />
        </template>
      </el-table-column>
      <el-table-column prop="orderNum" label="排序" width="60" />
      <el-table-column prop="perms" label="权限标识" :show-overflow-tooltip="true" />
      <el-table-column prop="component" label="组件路径" :show-overflow-tooltip="true" />
      <el-table-column prop="status" label="状态" :formatter="statusFormat" width="80" />
      <el-table-column label="创建时间" align="center" prop="createTime">
        <template slot-scope="scope">
          <span>{{ scope.row.createTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-permission="['system:menu:edit']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleMenuInfo(scope.row)"
          >修改
          </el-button>
          <el-button
            v-permission="['system:menu:add']"
            size="mini"
            type="text"
            icon="el-icon-plus"
            @click="handleMenuInfo(scope.row)"
          >新增
          </el-button>
          <el-button
            v-permission="['system:menu:remove']"
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改菜单对话框 -->
    <menu-info ref="menuInfo" @refreshDataList="getList" />
  </div>
</template>

<script>
import { deleteMenu, getALLMenus } from '@/api/system/menu'

import MenuInfo from './menu-info'

export default {
  name: 'Menu',
  components: { MenuInfo },
  data() {
    return {
      loading: true,
      showSearch: true,
      menuList: [],
      menuOptions: [],
      statusOptions: [],
      listQuery: {
        menuName: undefined,
        visible: undefined
      }
    }
  },
  created() {
    this.getDictTypes(this.STATUS).then(response => {
      this.statusOptions = response.data
    })
    this.getList()
  },
  methods: {
    handleMenuInfo(row) {
      this.$nextTick(() => {
        this.$refs.menuInfo.init(row)
      })
    },
    selected(name) {
      this.form.icon = name
    },
    getList() {
      this.loading = true
      getALLMenus(this.listQuery).then(response => {
        this.menuList = this.handleTree(response.data, 'menuId')
        this.loading = false
      })
    },
    // 菜单状态字典翻译
    statusFormat(row, column) {
      if (row.menuType === 'F') {
        return ''
      }
      return this.selectDictLabel(this.statusOptions, row.status)
    },
    handleQuery() {
      this.getList()
    },
    resetQuery() {
      this.resetForm('listForm')
      this.handleQuery()
    },
    handleDelete(row) {
      this.$confirm('是否确认删除名称为"' + row.menuName + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return deleteMenu(row.menuId)
      }).then(() => {
        this.getList()
        this.msgSuccess('删除成功')
      }).catch(function() {
      })
    }
  }
}
</script>
