<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="listForm" :model="listQuery" :inline="true" label-width="68px">
      <el-form-item label="字典名称" prop="dictType">
        <el-select v-model="listQuery.dictType" size="small">
          <el-option
            v-for="item in typeOptions"
            :key="item.dictId"
            :label="item.dictLabel"
            :value="item.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="字典标签" prop="dictLabel">
        <el-input
          v-model="listQuery.dictLabel"
          placeholder="请输入字典标签"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="listQuery.status" placeholder="数据状态" clearable size="small">
          <el-option
            v-for="dict in statusOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
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
          @click="handleDictDataInfo"
        >新增
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
      <el-col :span="17.5">
        <right-toolbar :show-search.sync="showSearch" @queryTable="getList" />
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="dataList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" type="index" align="center" />
      <el-table-column label="字典标签" align="center" prop="dictLabel" />
      <el-table-column label="字典键值" align="center" prop="dictValue" />
      <el-table-column label="字典编码" align="center" prop="dictType" />
      <el-table-column label="字典排序" align="center" prop="sort" />
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
            @click="handleDictDataInfo(scope.row)"
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
    <dict-data-info ref="dictDataInfo" @refreshDataList="getList" />
  </div>
</template>

<script>
import { getDictInfo, getDicts, deleteDicts, exportDictData } from '@/api/system/dict'
import DictDataInfo from './dict-data-info'

export default {
  name: 'DictData',
  components: { DictDataInfo },
  data() {
    return {
      loading: true,
      dictIds: [],
      single: true,
      multiple: true,
      showSearch: true,
      total: 0,
      dataList: [],
      defaultDictType: '',
      title: '',
      open: false,
      statusOptions: [],
      typeOptions: [],
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
    const dictId = this.$route.params && this.$route.params.dictId
    if (dictId) {
      this.getDictTypeInfo(dictId)
    } else {
      this.loading = false
    }
    this.getDictTypes('parent').then(response => {
      this.typeOptions = response.data
    })
    this.getDictTypes(this.SYS_DICT_STATUS).then(response => {
      this.statusOptions = response.data
    })
  },
  methods: {
    handleDictDataInfo(row) {
      this.$nextTick(() => {
        this.$refs.dictDataInfo.init(row, this.listQuery.dictType)
      })
    },
    getDictTypeInfo(dictId) {
      getDictInfo(dictId).then(response => {
        this.listQuery.dictType = response.data.dictValue
        this.defaultDictType = response.data.dictValue
        this.getList()
      })
    },
    getList() {
      this.loading = true
      getDicts(this.listQuery).then(response => {
        this.dataList = response.data.list
        this.total = response.data.total
        this.loading = false
      })
    },
    statusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.status)
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.listQuery.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('listForm')
      this.listQuery.dictType = this.defaultDictType
      this.handleQuery()
    },

    handleSelectionChange(selection) {
      this.dictIds = selection.map(item => item.dictId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },

    handleDelete(row) {
      const dictIds = row.dictId || this.dictIds
      this.$confirm('是否确认删除字典编码为"' + dictIds + '"的数据项?', '警告', {
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
      this.$confirm('是否确认导出所有数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return exportDictData(listQuery)
      }).then(response => {
        this.download(response.msg)
      }).catch(function() {
      })
    }
  }
}
</script>
