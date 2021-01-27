<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="通知类型" prop="noticeType">
        <el-select v-model="queryParams.noticeType" placeholder="请选择通知类型" clearable style="width: 240px">
          <el-option v-for="dict in noticeTypeOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="cyan" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['system:noticeManage:add']"
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
      <!-- <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:noticeManage:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:noticeManage:remove']"
        >删除</el-button>
      </el-col> -->
      <right-toolbar :show-search.sync="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="noticeManageList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="通知类型" align="center" prop="noticeType" :formatter="noticeTypeFormat" />
      <el-table-column label="通知指标" align="center" prop="noticeTarget" :formatter="noticeTargetFormat" />
      <el-table-column label="阈值" align="center" prop="value" :formatter="noticeValueFormat" />
      <el-table-column label="通知方式" align="center" prop="receiveWay">
        <template slot-scope="scope">
          <receive-way :value="scope.row.receiveWay" :receive-way-list="receiveWayOptions" />
        </template>
      </el-table-column>
      <el-table-column label="通知联系人" align="center" prop="memberList">
        <template slot-scope="scope">
          <div v-for="data in scope.row.memberList">{{ data.userName }}</div>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['system:noticeManage:edit']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            v-hasPermi="['system:noticeManage:remove']"
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
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改通知管理对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="400px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="通知类型" prop="noticeType">
              <el-select v-model="form.noticeType" placeholder="请通知类型">
                <el-option v-for="dict in noticeTypeOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item v-if="form.noticeType === '00'" label="通知指标" prop="noticeTarget">
          <el-select v-model="form.noticeTarget" placeholder="请选择通知指标">
            <el-option v-for="dict in noticeTargetOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.noticeType === '00'" label="阈值" prop="value">
          <el-input-number v-model="form.value" placeholder="请输入阈值" />
        </el-form-item>
        <el-form-item v-if="form.noticeType === '00'" label="阈值类型" prop="valueType">
          <el-select v-model="form.valueType" placeholder="请选择阈值类型">
            <el-option v-for="dict in valueTypeOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue" />
          </el-select>
        </el-form-item>
        <el-form-item label="通知方式" prop="receiveWayList">
          <el-checkbox-group v-model="form.receiveWayList">
            <el-checkbox v-for="item in receiveWayOptions" :key="item.label" name="receiveWay" :label="item.label">{{ item.name }}</el-checkbox>
            <!-- <el-checkbox label="10">邮箱</el-checkbox>
            <el-checkbox label="01">短信</el-checkbox> -->
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="联系人" prop="memberList">
          <div style="text-align:center; ">
            <div v-for="(item,index) in form.memberList" class="user-content">{{ item.userName }}<span class="delete" @click="removeUser(index)"><i class="el-icon-delete" /></span></div>
            <div class="add-user-btn" @click="userDialogVisible = true">点击添加联系人</div>
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 添加联系人 -->
    <el-dialog title="添加联系人" :visible.sync="userDialogVisible" :close-on-press-escape="false" width="80%" @open="onOpenSelectUser">
      <selectUser ref="selectUserRef" :user-dialog-visible.sync="userDialogVisible" :select-user-flag="true" :selected-user-list="form.memberList" @userSelectSubmit="userSelectSubmit" />
    </el-dialog>
  </div>
</template>

<script>
import {
  listNoticeManage,
  getNoticeManage,
  delNoticeManage,
  addNoticeManage,
  updateNoticeManage,
  exportNoticeManage
} from '@/api/system/noticeManage'
import selectUser from '../user/index'

export default {
  name: 'NoticeManage',
  components: {
    selectUser,
    'receive-way': {
      render: function(h, context) {
        console.info(this)
        let ret = ''
        for (let i = 0; i < this.value.length; i++) {
          // "1"为选中
          if (this.value.charAt(i) === '0') {
            ret = ret + '<div>' + this.receiveWayList[i].name + '</div>'
          }
        }
        return h(
          'span', {
            domProps: {
              innerHTML: ret
            }
          }
        )
      },
      props: {
        value: {
          type: String,
          required: true
        },
        receiveWayList: {
          type: Array,
          required: true
        }
      }
    }
  },
  data() {
    var self = this // 存储当前vue实例this,这行是重点
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 联系人弹出框
      userDialogVisible: false,
      // 总条数
      total: 0,
      // 通知管理表格数据
      noticeManageList: [],
      // 通知类型
      noticeTypeOptions: [],
      // 通知指标
      noticeTargetOptions: [],
      // 阈值类型
      valueTypeOptions: [],
      // 通知方式
      receiveWayOptions: [{ 'label': '01', 'name': '邮箱' }, { 'label': '10', 'name': '短信' }],

      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        noticeType: null,
        noticeTarget: null,
        value: null,
        valueType: null,
        receiveWay: null
      },
      // 表单参数
      form: {
        // 已选联系人
        memberList: [],
        receiveWayList: []
      },
      // 表单校验
      rules: {
        noticeType: [
          { required: true, message: '通知类型不能为空', trigger: 'blur' }
        ],
        noticeTarget: [
          { required: true, message: '通知指标不能为空', trigger: 'blur' }
        ],
        value: [
          { required: true, message: '阈值不能为空', trigger: 'blur' }
        ],
        valueType: [
          { required: true, message: '阈值类型不能为空', trigger: 'blur' }
        ],
        receiveWayList: [
          { type: 'array', required: true, message: '请选择通知方式', trigger: 'change' }
        ],
        memberList: [
          { type: 'array', required: true, message: '联系人不能空', trigger: 'change' }
        ]
      }
    }
  },
  created() {
    this.getDicts('notice_type').then((response) => {
      this.noticeTypeOptions = response.data
    })
    this.getDicts('notice_target').then((response) => {
      this.noticeTargetOptions = response.data
    })
    this.getDicts('sys_value_type').then((response) => {
      this.valueTypeOptions = response.data
    })
    this.getList()
  },

  methods: {
    /** 查询通知管理列表 */
    getList() {
      this.loading = true
      listNoticeManage(this.queryParams).then(response => {
        this.noticeManageList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    noticeTypeFormat(row, column) {
      return this.selectDictLabel(this.noticeTypeOptions, row.noticeType)
    },
    noticeTargetFormat(row, column) {
      if (row.noticeTarget) {
        return this.selectDictLabel(this.noticeTargetOptions, row.noticeTarget)
      } else {
        return '-'
      }
    },
    noticeValueFormat(row, column) {
      let value = row.value
      if (value) {
        value = row.valueType === '0' ? value += '%' : value
      } else {
        value = '-'
      }
      return value
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        noticeType: null,
        noticeTarget: null,
        value: null,
        valueType: null,
        receiveWay: null,
        // 已选联系人
        memberList: [],
        receiveWayList: [],
        remark: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null
      }
      this.resetForm('form')
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加通知管理'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids
      getNoticeManage(id).then(response => {
        response.data.receiveWayList = this.setReceiveWay(response.data.receiveWay)
        this.form = response.data
        this.open = true
        this.title = '修改通知管理'
      })
    },
    getReceiveWay(receiveWayList) {
      // 接收方式值转换
      let receiveWay = '11'
      for (const i in receiveWayList) {
        receiveWay = receiveWay & receiveWayList[i]
      }
      // 左补0
      return ('00' + receiveWay).substr(-2)
    },
    setReceiveWay(value) {
      const list = []
      for (let i = 0; i < value.length; i++) {
        // "1"为选中
        if (value.charAt(i) === '0') {
          list.push(this.receiveWayOptions[i].label)
        }
      }
      return list
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          this.form.receiveWay = this.getReceiveWay(this.form.receiveWayList)
          if (this.form.id != null) {
            updateNoticeManage(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
                this.open = false
                this.getList()
              }
            })
          } else {
            addNoticeManage(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess('新增成功')
                this.open = false
                this.getList()
              }
            })
          }
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      console.info(row)
      const typeName = this.selectDictLabel(this.noticeTypeOptions, row.noticeType)
      const ids = row.id || this.ids
      this.$confirm('是否确认删除通知类型为' + typeName + '的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return delNoticeManage(ids)
      }).then(() => {
        this.getList()
        this.msgSuccess('删除成功')
      }).catch(function() {})
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams
      this.$confirm('是否确认导出所有通知管理数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return exportNoticeManage(queryParams)
      }).then(response => {
        this.download(response.msg)
      }).catch(function() {})
    },
    // 初始化
    onOpenSelectUser() {
      if (this.$refs.selectUserRef) {
        this.$refs.selectUserRef.initOpenSelectUser()
      }
    },
    // 选择联系人弹出框确定回调
    userSelectSubmit(data) {
      this.form.memberList = data
      console.info(444 + this.form.memberList)
    },
    removeUser(index) {
      console.info(index)
      this.form.memberList.splice(index, 1)
    }
  }
}
</script>
<style lang="scss" scoped>
.user-content{
  position: relative;
  border-radius: 2px;
  font-size: 8px;
  border: 1px solid #DCDFE6;
  text-align:center;
  line-height: 25px;
  width:150px;
  height:25px;
  margin: 5px 0 5px 15px;
  .delete{
     position: absolute;
     right: 5px;
     cursor:hand;
     cursor:pointer;
  }
}
.add-user-btn {
  width:180px;
  height:30px;
  line-height: 30px;
  font-size: 8px;
  border: 1px dashed;
  cursor:hand;
  cursor:pointer;
}
</style>
