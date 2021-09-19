<template>
  <div>
    主页
    <el-button type="primary" @click="signOut">退出</el-button>
  </div>
</template>

<script>
export default {
  methods: {
    signOut() {
      const res = this.$msgBox.confirm('确认退出?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      res.then(() => {
        window.sessionStorage.removeItem('token')
        this.$router.push('/login')
      }).catch(() => {
        this.$message('取消退出')
      })
    }
  }
}
</script>

<style>
</style>
