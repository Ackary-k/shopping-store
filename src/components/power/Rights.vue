<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>权限管理</el-breadcrumb-item>
        <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 权限列表 -->
    <el-card class="box-card">
        <el-table :data="rightsList" stripe border style="width: 100%">
            <el-table-column type="index" />
            <el-table-column prop="authName" label="权限名称" />
            <el-table-column prop="path" label="路径"  />
            <el-table-column prop="level" label="权限等级" >
                <template slot-scope="data">
                    <el-tag v-if="data.row.level == 0" type="success">一级</el-tag>
                    <el-tag v-else-if="data.row.level == 1" type="info">二级</el-tag>
                    <el-tag v-else type="warning">三级</el-tag>
                </template>
            </el-table-column>
        </el-table>
    </el-card>
  </div>

</template>

<script>
export default {
  data () {
    return {
      rightsList: []
    }
  },

  created () {
    this.getRightsList()
  },

  methods: {
    async getRightsList() {
      const { data: res } = await this.$axios.get('rights/list')
      if (res.meta.status !== 200) return this.$message.error('权限列表数据获取失败!')

      this.rightsList = res.data
    }
  }
}
</script>

<style></style>
