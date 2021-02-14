<template>
  <div class="app-container">
    <el-row :gutter="20">

      <el-col :span="4" :xs="24">
        <div class="head-container">
          <el-input
            v-model="officeName"
            placeholder="请输入部门名称"
            clearable
            size="small"
            prefix-icon="el-icon-search"
            style="margin-bottom: 20px"
          />
        </div>
        <div class="head-container">
          <el-tree
            ref="tree"
            :data="officeOptions"
            :props="officeProps"
            :expand-on-click-node="false"
            :filter-node-method="filterNode"
            default-expand-all
            @node-click="handleNodeClick"
          />
        </div>
      </el-col>

      <el-col :span="20" :xs="24">
        <el-form v-show="showSearch" ref="queryForm" :model="listQuery" :inline="true" label-width="90px">
          <el-form-item label="用户姓名" prop="fullName">
            <el-input
              v-model="listQuery.fullName"
              placeholder="请输入用户姓名"
              clearable
              size="small"
              style="width: 240px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item v-if="!selectUserFlag" label="手机号码" prop="mobile">
            <el-input
              v-model="listQuery.mobile"
              placeholder="请输入手机号码"
              clearable
              size="small"
              style="width: 240px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item v-if="!selectUserFlag" label="用户状态" prop="status">
            <el-select v-model="listQuery.status" placeholder="用户状态" clearable size="small" style="width: 240px">
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
        <el-button
          v-permission="['system:user:add']"
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleUserInfo"
        >新增
        </el-button>
        <el-button
          v-permission="['system:user:import']"
          type="info"
          icon="el-icon-upload2"
          size="mini"
          @click="handleUserImport"
        >导入
        </el-button>
        <el-button
          v-permission="['system:user:export']"
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
        >导出
        </el-button>
        <el-button
          v-permission="['system:user:remove']"
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
        >删除
        </el-button>
        <el-table
          ref="userTable"
          v-loading="loading"
          :data="userList"
          @selection-change="handleSelectionChange"
          @select="handleSelect"
          @select-all="handleSelectAll"
        >
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="序号" type="index" align="center" />
          <el-table-column label="用户名" align="center" prop="userName" />
          <el-table-column label="用户姓名" align="center" prop="fullName" :show-overflow-tooltip="true" />
          <el-table-column label="部门" align="center" prop="officeId" :formatter="officeNameFormat" :show-overflow-tooltip="true" />
          <el-table-column label="手机号码" align="center" prop="mobile" width="120" />
          <el-table-column label="邮箱" align="center" prop="email" :show-overflow-tooltip="true" />
          <el-table-column v-if="!selectUserFlag" label="状态" align="center">
            <template slot-scope="scope">
              <el-switch
                v-model="scope.row.status"
                active-value="0"
                inactive-value="1"
                @change="handleStatusChange(scope.row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="创建时间" align="center" prop="createTime" width="160">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
          </el-table-column>

          <el-table-column label="操作" align="center" width="160" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button
                v-permission="['system:user:edit']"
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleUserInfo(scope.row)"
              >修改
              </el-button>
              <el-button
                v-if="scope.row.userId !== '0'"
                v-permission="['system:user:remove']"
                size="mini"
                type="text"
                icon="el-icon-delete"
                @click="handleDelete(scope.row)"
              >删除
              </el-button>
              <el-button
                v-permission="['system:user:resetPwd']"
                size="mini"
                type="text"
                icon="el-icon-key"
                @click="handleResetPwd(scope.row)"
              >重置
              </el-button>
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

      </el-col>

    </el-row>
    <user-info ref="userInfo" @refreshDataList="getList" />
    <user-import ref="userImport" @refreshDataList="getList" />
  </div>
</template>

<script>
import { getUsers, deleteUsers, changeUserStatus, resetUserPassword, exportUser } from '@/api/system/user'
import { getTreeOffice, getAllOffices } from '@/api/system/office'
import UserInfo from './user-info'
import UserImport from './user-import'

export default {
  name: 'User',
  components: { UserInfo, UserImport },
  props: {
    selectUserFlag: {
      type: Boolean,
      default: false
    },
    selectedUserList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      loading: true,
      single: true,
      multiple: true,
      showSearch: true,
      total: 0,
      officeName: undefined,
      userList: [],
      userIds: [],
      fullNames: [],
      dateRange: [],
      statusOptions: [],
      sexOptions: [],
      officeOptions: [],
      offices: [],
      officeProps: {
        children: 'children',
        label: 'officeName'
      },
      // 查询参数
      listQuery: {
        pageNum: 1,
        pageSize: 10,
        fullName: undefined,
        mobile: undefined,
        status: undefined,
        officeId: undefined
      }
    }
  },
  watch: {
    officeName(val) {
      this.$refs.tree.filter(val)
    }
  },
  created() {
    this.getList()
    this.getTreeOffice()
    this.getAllOffices()
    this.getDictTypes(this.SYS_USER_STATUS).then((response) => {
      this.statusOptions = response.data
    })
    this.getDictTypes(this.SYS_USER_SEX).then((response) => {
      this.sexOptions = response.data
    })
  },
  methods: {
    handleUserInfo(row) {
      this.$nextTick(() => {
        this.$refs.userInfo.init(row)
      })
    },
    handleUserImport(row) {
      this.$nextTick(() => {
        this.$refs.userImport.init(row)
      })
    },
    officeNameFormat(row, column) {
      var officeName = {}
      this.offices.some(office => {
        if (office.officeId === row.officeId) {
          officeName = office.officeName
          return true
        }
      })
      return officeName
    },
    getList() {
      this.loading = true
      getUsers(this.addDateRange(this.listQuery, this.dateRange)).then(
        (response) => {
          this.userList = response.data.list
          this.total = response.data.total
          this.loading = false
        }
      )
    },
    /** 查询部门下拉树结构 */
    getTreeOffice() {
      getTreeOffice().then((response) => {
        this.officeOptions = response.data
      })
    },
    getAllOffices() {
      getAllOffices().then((response) => {
        this.offices = response.data
      })
    },
    // 筛选节点
    filterNode(value, data) {
      if (!value) return true
      return data.officeName.indexOf(value) !== -1
    },
    // 节点单击事件
    handleNodeClick(data) {
      this.listQuery.officeId = data.id
      this.getList()
    },
    handleStatusChange(row) {
      const text = row.status === '0' ? '启用' : '停用'
      this.$confirm(
        '确认要"' + text + '""' + row.fullName + '"用户吗?',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(function() {
          return changeUserStatus(row.userId, row.status)
        })
        .then(() => {
          this.msgSuccess(text + '成功')
        })
        .catch(function() {
          row.status = row.status === '0' ? '1' : '0'
        })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.listQuery.page = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = []
      this.resetForm('queryForm')
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.userIds = selection.map((item) => item.userId)
      this.fullNames = selection.map((item) => item.fullName)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    handleSelectAll(selection) {
      this.handleSelect(selection, null)
    },
    handleSelect(selection, row) {
      const userIds = selection.map((item) => item.userId)
      const list = this.userList
      for (var i = 0; i < this.userList.length; i++) {
        const data = this.userList[i]
        if (userIds.indexOf(data.userId) === -1) { // 没勾选
          for (var j = 0; j < this.selectedUserList.length; j++) {
            if (data.userId === this.selectedUserList[j].userId) {
              // 删除选中
              this.selectedUserList.splice(j, 1)
            }
          }
        } else { // 已经勾选
          let selected = false
          for (var j = 0; j < this.selectedUserList.length; j++) {
            // 判断之前是否已经放入数组
            if (data.userId === this.selectedUserList[j].userId) {
              // 选中
              selected = true
              break
            }
          }
          if (!selected) {
            this.selectedUserList.push(data)
          }
        }
      }
    },
    /** 重置密码按钮操作 */
    handleResetPwd(row) {
      const userId = row.userId || this.userIds[0]
      const fullNames = row.fullName || this.fullNames
      this.$prompt('请输入"' + fullNames + '"的新密码', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
        .then(({ value }) => {
          resetUserPassword(userId, value).then((response) => {
            if (response.code === 200) {
              this.msgSuccess('修改成功，新密码是：' + value)
            }
          })
        })
        .catch(() => {
        })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const userIds = row.userId || this.userIds
      const fullNames = row.fullName || this.fullNames
      this.$confirm(
        '是否确认删除【' + fullNames + '】,这' + fullNames.length + '个用户吗?',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(function() {
          return deleteUsers(userIds)
        })
        .then(() => {
          this.getList()
          this.msgSuccess('删除成功')
        })
        .catch(function() {
        })
    },
    /** 导出按钮操作 */
    handleExport() {
      const listQuery = this.listQuery
      this.$confirm('是否确认导出所有用户数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(function() {
          return exportUser(listQuery)
        })
        .then((response) => {
          this.download(response.msg)
        })
        .catch(function() {
        })
    }
  }
}
</script>
