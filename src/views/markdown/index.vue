<template>
  <div class="app-container">
    <mavon-editor ref="md" v-model="from.content" @save="submitForm" @imgAdd="uploadImage" />
  </div>
</template>

<script>
import { mavonEditor } from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'
import { uploadImage } from '@/api/image'

export default {
  name: 'MarkdownEditor',
  components: { mavonEditor },
  data() {
    return {
      from: {
        content: undefined,
        id: undefined
      }
    }
  },
  created() {
    this.from.id = this.$route.params.id
  },
  methods: {
    submitForm() {},
    uploadImage(pos, file) {
      const formData = new FormData()
      formData.append('file', file)
      uploadImage(formData).then(response => {
        this.$refs.md.$img2Url(pos, response.data.url)
      })
    }
  }
}
</script>
