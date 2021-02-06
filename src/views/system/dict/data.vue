<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="listForm" :model="listQuery" :inline="true" label-width="68px">
      <el-form-item label="字典名称" prop="type">
        <el-select v-model="listQuery.type" size="small">
          <el-option
            v-for="item in typeOptions"
            :key="item.id"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="字典标签" prop="label">
        <el-input
          v-model="listQuery.label"
          placeholder="请输入字典标签"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="delFlag">
        <el-select v-model="listQuery.delFlag" placeholder="数据状态" clearable size="small">
          <el-option
            v-for="dict in statusOptions"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
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
          @click="handleDictDataInfo()"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-permission="['system:dict:edit']"
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleDictDataInfo(this.ids)"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-permission="['system:dict:remove']"
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-permission="['system:dict:export']"
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
        >导出</el-button>
      </el-col>
      <right-toolbar :show-search.sync="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="dataList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" type="index" align="center" />
      <el-table-column label="字典标签" align="center" prop="label" />
      <el-table-column label="字典键值" align="center" prop="value" />
      <el-table-column label="字典编码" align="center" prop="type" />
      <el-table-column label="字典排序" align="center" prop="sort" />
      <el-table-column label="状态" align="center" prop="delFlag" :formatter="statusFormat" />
      <el-table-column label="备注" align="center" prop="remarks" :show-overflow-tooltip="true" />
      <el-table-column label="创建时间" align="center" prop="createDate" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createDate) }}</span>
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
          >修改</el-button>
          <el-button
            v-permission="['system:dict:remove']"
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
    <!-- 添加或修改字典对话框 -->
    <dict-data-info ref="dictDataInfo" @refreshDataList="getList" />
  </div>
</template>

<script>
import { getDictInfo, getDicts, deleteDicts } from '@/api/system/dict'
import DictDataInfo from './dict-data-info'
export default {
  name: 'DictData',
  components: { DictDataInfo },
  data() {
    return {
      loading: true,
      ids: [],
      single: true,
      multiple: true,
      showSearch: true,
      total: 0,
      dataList: [],
      defaulttype: '',
      title: '',
      open: false,
      statusOptions: [],
      typeOptions: [],
      listQuery: {
        pageNum: 1,
        pageSize: 10,
        label: undefined,
        type: undefined,
        delFlag: undefined
      }
    }
  },
  created() {
    const id = this.$route.params && this.$route.params.id
    if (id) {
      this.getDictTypeInfo(id)
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
        this.$refs.dictDataInfo.init(row)
      })
    },
    getDictTypeInfo(id) {
      getDictInfo(id).then(response => {
        this.listQuery.type = response.data.value
        this.defaulttype = response.data.value
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
      return this.selectDictLabel(this.statusOptions, row.delFlag)
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.listQuery.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('listForm')
      this.listQuery.type = this.defaulttype
      this.handleQuery()
    },

    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },

    handleDelete(row) {
      const ids = row.id || this.ids
      this.$confirm('是否确认删除字典编码为"' + ids + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return deleteDicts(ids)
      }).then(() => {
        this.getList()
        this.msgSuccess('删除成功')
      }).catch(function() {})
    },
    handleExport() {
      const listQuery = this.listQuery
      this.$confirm('是否确认导出所有数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        // return exportData(listQuery)
      }).then(response => {
        this.download(response.msg)
      }).catch(function() {})
    }
  }
}
</script>
