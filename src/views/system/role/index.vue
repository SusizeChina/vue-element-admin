<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryForm" :model="listQuery" :inline="true">
      <el-form-item label="角色名称" prop="roleName">
        <el-input
          v-model="listQuery.roleName"
          placeholder="请输入角色名称"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="权限字符" prop="roleKey">
        <el-input
          v-model="listQuery.roleKey"
          placeholder="请输入权限字符"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="listQuery.status"
          placeholder="角色状态"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in statusOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间">
        <el-date-picker
          v-model="dateRange"
          size="small"
          style="width: 240px"
          value-format="yyyy-MM-dd"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">查询</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-permission="['system:role:add']"
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleRoleInfo"
        >新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-permission="['system:role:edit']"
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleRoleInfo"
        >修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-permission="['system:role:remove']"
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
        >删除
        </el-button>
      </el-col>

      <el-col :span="1.5">
        <el-button
          v-permission="['system:role:export']"
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
        >导出</el-button>
      </el-col>

      <right-toolbar :show-search.sync="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="roleList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="角色编号" prop="roleId" width="220" />
      <el-table-column label="角色名称" prop="roleName" :show-overflow-tooltip="true" width="250" />
      <el-table-column label="权限字符" prop="roleKey" :show-overflow-tooltip="true" width="250" />
      <el-table-column label="状态" align="center" width="200">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.status"
            active-value="0"
            inactive-value="1"
            @change="handleStatusChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" fixed-width>
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-permission="['system:role:edit']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleRoleInfo(scope.row)"
          >修改</el-button>
          <el-button
            v-permission="['system:role:edit']"
            size="mini"
            type="text"
            icon="el-icon-circle-check"
            @click="handleDataScope(scope.row)"
          >数据权限
          </el-button>
          <el-button
            v-permission="['system:role:remove']"
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.pageNum"
      :limit.sync="listQuery.pageSize"
      @pagination="getList"
    />
    <role-info ref="roleInfo" @refreshDataList="getList" />
    <role-data-scope ref="roleDataScope" @refreshDataList="getList" />
  </div>
</template>

<script>
import { deleteRoles, getRoles, updateRole, exportRole } from '@/api/system/role'
import RoleInfo from './role-info'
import RoleDataScope from './role-data-socpe'

export default {
  name: 'Role',
  components: { RoleInfo, RoleDataScope },
  data() {
    return {
      loading: true,
      roleIds: [],
      single: true,
      multiple: true,
      showSearch: true,
      total: 0,
      roleList: [],
      dateRange: [],
      statusOptions: [],
      dataScopeOptions: [],
      listQuery: {
        pageNum: 1,
        pageSize: 10,
        roleName: undefined,
        roleKey: undefined,
        status: undefined,
        dataScope: undefined
      }
    }
  },
  created() {
    this.getList()
    this.getDictTypes(this.STATUS).then(response => {
      this.statusOptions = response.data
    })
    this.getDictTypes(this.DATA_SCOPE).then(response => {
      this.dataScopeOptions = response.data
    })
  },
  methods: {
    handleRoleInfo(row) {
      this.$nextTick(() => {
        this.$refs.roleInfo.init(row)
      })
    },
    handleDataScope(row) {
      this.$nextTick(() => {
        this.$refs.roleDataScope.init(row)
      })
    },
    getList() {
      this.loading = true
      getRoles(this.addDateRange(this.listQuery, this.dateRange)).then(
        response => {
          this.roleList = response.data.list
          this.total = response.data.total
          this.loading = false
        }
      )
    },
    handleStatusChange(row) {
      const text = row.status === '0' ? '启用' : '停用'
      this.$confirm('确认要"' + text + '""' + row.roleName + '"角色吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return updateRole({ 'roleId': row.roleId, 'status': row.status })
      }).then(() => {
        this.msgSuccess(text + '成功')
      }).catch(function() {
        row.status = row.status === '0' ? '1' : '0'
      })
    },
    handleQuery() {
      this.listQuery.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.dateRange = []
      this.resetForm('queryForm')
      this.handleQuery()
    },
    handleSelectionChange(selection) {
      this.roleIds = selection.map(item => item.roleId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    handleDelete(row) {
      const roleIds = row.roleId || this.roleIds
      this.$confirm('是否确认删除角色编号为"' + roleIds + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return deleteRoles(roleIds)
      }).then(() => {
        this.getList()
        this.msgSuccess('删除成功')
      }).catch(function() {
      })
    },
    handleExport() {
      const listQuery = this.listQuery
      this.$confirm('是否确认导出所有角色数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return exportRole(listQuery)
      }).then(response => {
        this.download(response.msg)
      }).catch(function() {
      })
    }
  }
}
</script>
