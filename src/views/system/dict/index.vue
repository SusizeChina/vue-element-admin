<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="listForm" :model="listQuery" :inline="true" label-width="68px">
      <el-form-item label="字典名称" prop="dictLabel">
        <el-input
          v-model="listQuery.dictLabel"
          placeholder="请输入字典名称"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="字典编号" prop="dictValue">
        <el-input
          v-model="listQuery.dictValue"
          placeholder="字典编号"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="listQuery.status"
          placeholder="字典状态"
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
        <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-permission="['system:dict:add']"
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleDictInfo"
        >新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-permission="['system:dict:edit']"
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleDictInfo(this.dictIds)"
        >修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-permission="['system:dict:remove']"
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
          v-permission="['system:dict:export']"
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
        >导出
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-permission="['system:dict:remove']"
          type="danger"
          icon="el-icon-refresh"
          size="mini"
          @click="handleClearCache"
        >清理缓存
        </el-button>
      </el-col>
      <right-toolbar :show-search.sync="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="typeList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="字典编号" type="index" align="center" />
      <el-table-column label="字典名称" align="center" prop="dictLabel" :show-overflow-tooltip="true" />
      <el-table-column label="字典编号" align="center" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <router-link :to="{name:'DictData',params:{dictId:scope.row.dictId}}" class="link-type">
            <span>{{ scope.row.dictValue }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" :formatter="statusFormat" />
      <el-table-column label="备注" align="center" prop="remarks" :show-overflow-tooltip="true" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-permission="['system:dict:edit']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleDictInfo(scope.row)"
          >修改
          </el-button>
          <el-button
            v-permission="['system:dict:remove']"
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />

    <!-- 添加或修改字典对话框 -->
    <dict-info ref="dictInfo" @refreshDataList="getList" />
  </div>
</template>

<script>
import { getTreeDict, getDicts, deleteDicts } from '@/api/system/dict'
import DictInfo from './dict-info'

export default {
  name: 'Dict',
  components: { DictInfo },
  data() {
    return {
      loading: true,
      dictIds: [],
      single: true,
      multiple: true,
      showSearch: true,
      total: 0,
      typeList: [],
      statusOptions: [],
      dateRange: [],
      listQuery: {
        pageNum: 1,
        pageSize: 10,
        dictLabel: undefined,
        dictType: undefined,
        status: undefined
      }
    }
  },
  created() {
    // 字典状态
    this.getDictTypes(this.SYS_DICT_STATUS).then(response => {
      this.statusOptions = response.data
    })
    // 加载字典项列表
    this.getList()
  },
  methods: {
    handleDictInfo(row) {
      this.$nextTick(() => {
        this.$refs.dictInfo.init(row)
      })
    },
    getList() {
      this.loading = true
      // 只查询字典项
      this.listQuery.dictType = 'parent'
      getDicts(this.addDateRange(this.listQuery, this.dateRange)).then(response => {
        this.typeList = response.data.list
        this.total = response.data.total
        this.loading = false
      }
      )
    },
    statusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.status)
    },
    handleQuery() {
      this.listQuery.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.dateRange = []
      this.resetForm('listForm')
      this.handleQuery()
    },
    handleSelectionChange(selection) {
      this.dictIds = selection.map(item => item.dictId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    handleDelete(row) {
      const dictIds = row.dictId || this.dictIds
      this.$confirm('是否确认删除字典编号为"' + dictIds + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return deleteDicts(dictIds)
      }).then(() => {
        this.getList()
        this.msgSuccess('删除成功')
      }).catch(function() {
      })
    },
    handleExport() {
      const listQuery = this.listQuery
      this.$confirm('是否确认导出所有类型数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return getDicts(listQuery)
      }).then(response => {
        this.download(response.msg)
      }).catch(function() {
      })
    },
    handleClearCache() {
      getTreeDict().then(response => {
        if (response.code === 200) {
          this.msgSuccess('清理成功')
        }
      })
    }
  }
}
</script>
