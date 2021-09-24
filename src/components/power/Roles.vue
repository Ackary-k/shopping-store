<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>角色管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 角色列表 -->
    <el-card class="box-card">
      <!-- 添加区域 -->
      <div class="text item">
        <el-row :gutter="20">
          <!-- 添加角色 -->
          <el-col :span="4">
            <el-button type="primary">
              添加角色
            </el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 角色列表区域 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <!-- 一级权限行 -->
            <el-row
              v-for="(roleFirst, i1) in scope.row.children"
              :key="roleFirst.id"
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']"
            >
              <!-- 第一列 -->
              <el-col :span="5">
                <!-- 权限标签 -->
                <el-tag
                  closable
                  @close="removeRightById(scope.row, roleFirst.id)"
                >
                  {{ roleFirst.authName }}
                </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 第二列 -->
              <el-col :span="19">
                <!-- 二级权限 -->
                <el-row
                  v-for="(roleSec, i2) in roleFirst.children"
                  :key="roleSec.id"
                  :class="{ bdtop: i2 > 0, vcenter: true }"
                >
                  <!-- 第一列 -->
                  <el-col :span="6">
                    <!-- 标签 -->
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, roleSec.id)"
                    >
                      {{ roleSec.authName }}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 第二列 -->
                  <el-col>
                    <!-- 三级权限 -->
                    <el-col :span="18">
                      <!-- 权限标签 -->
                      <el-tag
                        type="warning"
                        v-for="item3 in roleSec.children"
                        :key="item3.id"
                        closable
                        @close="removeRightById(scope.row, item3.id)"
                      >
                        {{ item3.authName }}
                      </el-tag>
                    </el-col>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>

        <!-- 其他数据 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini">
              编辑
            </el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini">
              删除
            </el-button>
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="editRoles(scope.row)"
            >
              分配权限
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 编辑权限的对话框 -->
    <el-dialog :visible.sync="showRoleDialog" title="分配权限" width="50%" @closed="clearCheckedTree">
      <!-- 权限树 -->
      <el-tree
        :data="rolesTree"
        :default-checked-keys="defaultCheckedList"
        :props="{ children: 'children', label: 'authName' }"
        show-checkbox
        node-key="id"
        ref="treeRef"
        default-expand-all
      />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showRoleDialog = false">取消</el-button>
          <el-button type="primary" @click="allotRight">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rolesList: [],
      rolesTree: [],
      // 是否显示分配权限对话框
      showRoleDialog: false,
      // 默认选中的权限数组
      defaultCheckedList: [],
      // 当前操作的角色权限 ID
      roleID: ''
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    // 获取数据
    async getRolesList() {
      const { data: res } = await this.$axios.get('roles')
      if (res.meta.status !== 200) return this.$message.error(this.meta.msg)

      this.rolesList = res.data
    },

    // 根据id 删除三级权限
    removeRightById(roles, rightsID) {
      this.$msgBox.confirm('请确认删除', '', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
        callback: async (action) => {
          if (action === 'confirm') {
            const { data: res } = await this.$axios.delete(
              `roles/${roles.id}/rights/${rightsID}`
            )

            // 如果删除失败则返回
            if (res.meta.status !== 200) {
              return this.$message.error(res.meta.msg)
            }

            this.$message.success('删除成功!')

            // 返回的新数组替换到当前的数组, 防止页面刷新
            roles.children = res.data
          } else {
            this.$message('取消删除')
          }
        }
      })
    },

    // 获取权限树
    async getRightsTree() {
      const { data: res } = await this.$axios({
        url: 'rights/tree',
        method: 'get'
      })
      if (res.meta.status !== 200) {
        return this.$message.error('权限数据获取失败!')
      }
      this.rolesTree = res.data
    },

    // 分配权限方法
    async editRoles(roles) {
      this.roleID = roles.id
      this.getRightsTree()
      this.getRole3IDs(roles)

      this.showRoleDialog = !this.showRoleDialog
    },

    // 获取三级权限的 id
    getRole3IDs(roles) {
      if (!roles.children) {
        return this.defaultCheckedList.push(roles.id)
      }
      // 如果有children 数组, 则继续循环, 找到最后一层的id
      roles.children.forEach(e => {
        this.getRole3IDs(e)
      })
    },

    // 对话框关闭时清空默认选中数组
    clearCheckedTree() {
      this.defaultCheckedList = []
    },

    // 分配权限点确定时的方法
    async allotRight() {
      let ids = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]

      ids = ids.join(',')

      const { data: res } = await this.$axios({
        url: `roles/${this.roleID}/rights`,
        method: 'post',
        data: { rids: ids }
      })

      if (res.meta.status !== 200) return this.$message.error('分配权限失败!')
      this.$message.success('权限分配成功!')

      // 成功则请求角色数据
      this.getRolesList()

      this.showRoleDialog = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>
