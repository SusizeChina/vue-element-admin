<template>
  <el-dialog :title="upload.title" :visible.sync="upload.open" width="400px" append-to-body>
    <el-upload
      ref="upload"
      :limit="1"
      accept=".xlsx, .xls"
      :headers="upload.headers"
      :action="upload.url + '?updateSupport=' + upload.updateSupport"
      :disabled="upload.isUploading"
      :on-progress="handleFileUploadProgress"
      :on-success="handleFileSuccess"
      :auto-upload="false"
      drag
    >
      <i class="el-icon-upload" />
      <div class="el-upload__text">
        将文件拖到此处，或
        <em>点击上传</em>
      </div>
      <div slot="tip" class="el-upload__tip">
        <el-checkbox v-model="upload.updateSupport" />
        是否更新已经存在的用户数据
        <el-link type="info" style="font-size:12px" @click="importTemplate">下载模板</el-link>
      </div>
      <div slot="tip" class="el-upload__tip" style="color:red">提示：仅允许导入“xls”或“xlsx”格式文件！</div>
    </el-upload>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitFileForm">确 定</el-button>
      <el-button @click="upload.open = false">取 消</el-button>
    </div>
  </el-dialog>

</template>

<script>
import { importUserTemplate } from '@/api/system/user'
import { getToken } from '@/utils/auth'

export default {
  props: {
    selectUserFlag: {
      type: Boolean,
      default: false
    },
    userDialogVisible: {
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
      upload: {
        open: false,
        title: '',
        isUploading: false,
        updateSupport: 0,
        headers: { Authorization: 'Bearer ' + getToken() },
        url: process.env.VUE_APP_BASE_API + '/system/user/importData'
      }
    }
  },
  watch: {

  },
  created() {
  },
  methods: {
    /** 下载模板操作 */
    importTemplate() {
      importUserTemplate().then((response) => {
        this.download(response.msg)
      })
    },
    // 文件上传中处理
    handleFileUploadProgress(event, file, fileList) {
      this.upload.isUploading = true
    },
    // 文件上传成功处理
    handleFileSuccess(response, file, fileList) {
      this.upload.open = false
      this.upload.isUploading = false
      this.$refs.upload.clearFiles()
      this.$alert(response.msg, '导入结果', { dangerouslyUseHTMLString: true })
      this.getList()
    },
    // 提交上传文件
    submitFileForm() {
      this.$refs.upload.submit()
    },
    cancelDialog() {
      this.$emit('update:userDialogVisible', false)
    },
    // 弹出层确定按钮
    submitDialogSelect() {
      this.$emit('userSelectSubmit', this.selectedUserList)
      this.$emit('update:userDialogVisible', false)
    }
  }
}
</script>
