<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryForm" :model="listQuery" :inline="true" label-width="68px">
      <el-form-item label="岗位编码" prop="postCode">
        <el-input
          v-model="listQuery.postCode"
          placeholder="请输入岗位编码"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="岗位名称" prop="postName">
        <el-input
          v-model="listQuery.postName"
          placeholder="请输入岗位名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="listQuery.status" placeholder="岗位状态" clearable size="small">
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
          v-permission="['system:post:add']"
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handlePostInfo"
        >新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-permission="['system:post:edit']"
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handlePostInfo"
        >修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-permission="['system:post:remove']"
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
          v-permission="['system:post:export']"
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
        >导出
        </el-button>
      </el-col>
      <right-toolbar :show-search.sync="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="postList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="岗位编号" align="center" prop="postId" />
      <el-table-column label="岗位编码" align="center" prop="postCode" />
      <el-table-column label="岗位名称" align="center" prop="postName" />
      <el-table-column label="状态" align="center" prop="status" :formatter="statusFormat" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-permission="['system:post:edit']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handlePostInfo(scope.row)"
          >修改
          </el-button>
          <el-button
            v-permission="['system:post:remove']"
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
      :page.sync="listQuery.pageNum"
      :limit.sync="listQuery.pageSize"
      @pagination="getList"
    />
    <post-info ref="postInfo" @refreshDataList="getList" />
  </div>
</template>

<script>
import { getPosts, deletePosts, postExport } from '@/api/system/post'
import PostInfo from './post-info'
export default {
  name: 'Post',
  components: { PostInfo },
  data() {
    return {
      loading: true,
      postIds: [],
      single: true,
      multiple: true,
      showSearch: true,
      total: 0,
      postList: [],
      statusOptions: [],
      listQuery: {
        pageNum: 1,
        pageSize: 10,
        postCode: undefined,
        postName: undefined,
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
    handlePostInfo(row) {
      this.$nextTick(() => {
        this.$refs.postInfo.init(row)
      })
    },
    getList() {
      this.loading = true
      getPosts(this.listQuery).then(response => {
        this.postList = response.data.list
        this.total = response.data.total
        this.loading = false
      })
    },
    statusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.status)
    },
    handleQuery() {
      this.listQuery.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    handleSelectionChange(selection) {
      this.postIds = selection.map(item => item.postId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    handleDelete(row) {
      const postIds = row.postId || this.postIds
      this.$confirm('是否确认删除岗位编号为"' + postIds + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return deletePosts(postIds)
      }).then(() => {
        this.getList()
        this.msgSuccess('删除成功')
      }).catch(function() {
      })
    },
    handleExport() {
      const listQuery = this.listQuery
      this.$confirm('是否确认导出所有岗位数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return postExport(listQuery)
      }).then(response => {
        this.download(response.msg)
      }).catch(function() {
      })
    }
  }
}
</script>
