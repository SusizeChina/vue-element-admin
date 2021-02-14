<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="listForm" :model="listQuery" :inline="true">
      <el-form-item label="部门名称" prop="officeName">
        <el-input
          v-model="listQuery.officeName"
          placeholder="请输入部门名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="部门状态" prop="status">
        <el-select v-model="listQuery.status" placeholder="部门状态" clearable size="small">
          <el-option
            v-for="dict in statusOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
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
          v-permission="['system:office:add']"
          type="primary"
          icon="el-icon-plus"
          size="mini"
          :disabled="single"
          @click="handleOfficeInfo"
        >新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-permission="['system:office:remove']"
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
        >删除
        </el-button>
      </el-col>
      <el-col :span="19">
        <right-toolbar :show-search.sync="showSearch" @queryTable="getList" />
      </el-col>

    </el-row>

    <el-table
      v-loading="loading"
      :data="officeList"
      row-key="officeId"
      default-expand-all
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column prop="officeName" label="部门名称" width="260" />
      <el-table-column prop="sort" label="排序" width="150" />
      <el-table-column prop="status" label="状态" :formatter="statusFormat" width="150" />
      <el-table-column prop="master" label="负责人" width="150" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="200">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">

          <el-button
            v-permission="['system:office:edit']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleOfficeInfo(scope.row)"
          >修改</el-button>

          <el-button
            v-if="scope.row.parentId != '0'"
            v-permission="['system:office:remove']"
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除</el-button>

          <el-button
            v-permission="['system:office:add']"
            size="mini"
            type="text"
            icon="el-icon-plus"
            @click="handleOfficeInfo(scope.row)"
          >新增
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <office-info ref="officeInfo" @refreshDataList="getList" />
  </div>
</template>

<script>
import { deleteOffices, getAllOffices } from '@/api/system/office'

import OfficeInfo from './office-info'

export default {
  name: 'Office',
  components: { OfficeInfo },
  data() {
    return {
      loading: true,
      single: false,
      multiple: true,
      showSearch: true,
      officeIds: [],
      officeNames: [],
      officeList: [],
      officeOptions: [],
      title: undefined,
      open: false,
      statusOptions: [],
      listQuery: {
        officeName: undefined,
        status: undefined
      }
    }
  },
  created() {
    this.getList()
    this.getDictTypes(this.STATUS).then(response => {
      this.statusOptions = response.data
    })
  },
  methods: {
    handleOfficeInfo(row) {
      this.$nextTick(() => {
        this.$refs.officeInfo.init(row)
      })
    },
    getList() {
      this.loading = true
      getAllOffices(this.listQuery).then(response => {
        this.officeList = this.handleTree(response.data, 'officeId', 'parentId', 'children', '0')
        this.loading = false
      })
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
    statusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.status)
    },
    handleQuery() {
      this.getList()
    },
    resetQuery() {
      this.resetForm('listForm')
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.officeIds = selection.map((item) => item.officeId)
      this.officeNames = selection.map((item) => item.officeName)
      // this.single = selection.length !== 1
      this.multiple = !selection.length
    },

    /** 删除按钮操作 */
    handleDelete(row) {
      let officeIds = []
      if (row.officeId) {
        officeIds.push(row.officeId)
      } else {
        officeIds = this.officeIds
      }
      let officeNames = []
      if (row.officeName) {
        officeNames.push(row.officeName)
      } else {
        officeNames = this.officeNames
      }

      this.$confirm('是否确认删除【' + officeNames + '】' + officeNames.length + '个机构?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return deleteOffices(officeIds)
      }).then(() => {
        this.getList()
        this.msgSuccess('删除成功')
      }).catch(function() {
      })
    }
  }
}
</script>
