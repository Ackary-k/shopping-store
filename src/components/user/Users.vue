<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 搜索与添加区域 -->
    <el-card class="box-card">
      <div class="text item">
        <el-row :gutter="20">
          <!-- 搜索框 -->
          <el-col :span="8">
            <el-input
              placeholder="请输入内容"
              clearable
              v-model="queryUserInfo.query"
              @clear="getUserList"
            >
              <template #append>
                <el-button
                  icon="el-icon-search"
                  @click="getUserList"
                ></el-button>
              </template>
            </el-input>
          </el-col>
          <!-- 添加按钮 -->
          <el-col :span="4">
            <el-button type="primary" @click="showDialogVisible">
              添加用户
            </el-button>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 用户列表区域 -->
    <el-table :data="userList" style="width: 100%;" border stripe>
      <el-table-column type="index" width="50"></el-table-column>
      <el-table-column prop="username" label="姓名"></el-table-column>
      <el-table-column prop="email" label="邮箱"></el-table-column>
      <el-table-column prop="mobile" label="电话"></el-table-column>
      <el-table-column prop="role_name" label="角色"></el-table-column>
      <!-- 状态列 -->
      <el-table-column prop="mg_state" label="状态" width="150px">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.mg_state"
            @change="userStateChanged(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <!-- 操作列 -->
      <el-table-column label="操作" width="180px">
        <template slot-scope="scope">
          <!-- 编辑按钮 -->
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="editUserInfo(scope.row)"
          ></el-button>
          <!-- 删除按钮 -->
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="delUser(scope.row.id)"
          ></el-button>
          <!-- 分配角色 -->
          <el-tooltip content="分配角色" placement="top">
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="setRoles(scope.row)"
            ></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页导航区域
        @size-change(pagesize改变时触发)
        @current-change(页码发生改变时触发)
        :current-page(设置当前页码)
        :page-size(设置每页的数据条数)
        :total(设置总页数)
        -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      layout="total, sizes, prev, pager, next, jumper"
      :current-page="queryUserInfo.pagenum"
      :page-sizes="[5, 10, 15, 20]"
      :page-size="queryUserInfo.pagesize"
      :total="total"
    ></el-pagination>

    <!-- 添加用户 对话框组件
        :visible.sync(设置是否显示对话框) width(设置对话框的宽度)
        :before-close(在对话框关闭前触发的事件)
    -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      @closed="dialogClosed"
      width="40%"
    >
      <!-- 对话框主体区域 -->
      <el-form
        ref="addFormRef"
        :model="addForm"
        :rules="formRules"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 对话框底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户 对话框 -->
    <el-dialog :visible.sync="editDialogVisible" title="修改信息" width="30%">
      <el-form
        ref="editFormRef"
        :model="editInfo"
        :rules="formRules"
        label-width="70px"
      >
        <el-form-item label="用户名">
          <el-input
            v-model="editInfo.username"
            disabled
            prop="username"
          ></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editInfo.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="editInfo.mobile"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEditData">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog :visible.sync="showRole" title="分配角色" width="35%" @closed="closeRoleDilog">
      <p>当前的用户: {{curtUser.username}}</p>
      <p>当前的角色: {{curtUser.role_name}}</p>
      <span>分配新角色:</span>
      <!-- 选择角色的下拉框 -->
      <el-select v-model="roleID" placeholder="请选择" style="padding-left: 5px">
        <el-option
        v-for="item in roleList"
        :key="item.id"
        :label="item.roleName"
        :value="item.id"
        :disabled="item.disabled"
        >
        </el-option>
      </el-select>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showRole = false">取消</el-button>
          <el-button type="primary" @click="submitRoleInfo">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 验证邮箱的规则
    var checkEmail = (rule, value, cb) => {
      const regEmail = /^\w+@\w+(\.\w+)+$/
      if (regEmail.test(value)) {
        return cb()
      }
      // 返回一个错误提示
      cb(new Error('请输入合法的邮箱'))
    }

    // 验证手机号码的规则
    var checkMobile = (rule, value, cb) => {
      const regMobile = /^1[345789]\d{9}$/
      if (regMobile.test(value)) {
        return cb()
      }
      // 返回一个错误提示
      cb(new Error('请输入合法的手机号码'))
    }
    return {
      userList: [],
      total: 0,

      // 获取用户列表参数对象
      queryUserInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },

      // 编辑用户信息参数对象
      editInfo: {
        id: -1,
        username: '',
        email: '',
        mobile: ''
      },

      // 是否显示添加用户弹出窗
      addDialogVisible: false,

      // 显示修改对话框
      editDialogVisible: false,

      // 添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },

      // 表单的验证规则对象
      formRules: {
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '用户名在3~10个字符之间',
            trigger: 'blur'
          }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 6,
            max: 15,
            message: '用户名在6~15个字符之间',
            trigger: 'blur'
          }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          {
            validator: checkEmail,
            message: '邮箱格式不正确，请重新输入',
            trigger: 'blur'
          }
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          {
            validator: checkMobile,
            message: '手机号码不正确，请重新输入',
            trigger: 'blur'
          }
        ]
      },

      // 是否显示分配角色对话框
      showRole: false,

      // 当前角色对象
      curtUser: {},

      // 角色列表
      roleList: [],

      // 当前选择的角色 ID
      roleID: ''
    }
  },

  // 初始数据获取
  created() {
    this.getUserList()
  },

  methods: {
    // 获取用户数据
    async getUserList() {
      const { data: res } = await this.$axios.get('users', {
        params: this.queryUserInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败')
      }
      this.userList = res.data.users
      this.total = res.data.total
    },

    // 更改页面数据
    handleSizeChange(newSize) {
      // pagesize 发生改变时触发, 获取最新的 pagesize 来展示数据
      this.queryUserInfo.pagesize = newSize
      this.getUserList()
    },

    // 更改页码
    handleCurrentChange(newPagenum) {
      // 页码发生改变时, 获取最新的 pagenum 来展示数据
      this.queryUserInfo.pagenum = newPagenum
      this.getUserList()
    },

    // 修改用户状态
    async userStateChanged(row) {
      const { data: res } = await this.$axios.put(
        `users/${row.id}/state/${row.mg_state}`
      )
      if (res.meta.status !== 200) {
        // 修改失败则还原开关状态
        row.mg_state = !row.mg_state
        return this.$message('状态修改失败!')
      }
      this.$message.success('状态修改成功!')
    },

    // 是否显示添加用户对话框
    showDialogVisible() {
      this.addDialogVisible = !this.addDialogVisible
    },

    // 对话框关闭后重置表单数据
    dialogClosed() {
      this.$refs.addFormRef.resetFields()
    },

    // 添加用户
    addUser() {
      // 调用 validate 来做表单验证
      this.$refs.addFormRef.validate(async (valid) => {
        // 验证失败则返回
        if (!valid) return this.$message.error('请填写完整信息!')

        const { data: res } = await this.$axios.post('users', this.addForm)

        if (res.meta.status !== 201) return this.$message.error('用户添加失败!')
        this.$message.success('用户添加成功')

        if (this.userList.length === this.queryUserInfo.pagesize) {
          this.queryUserInfo.pagenum += 1
        }

        this.getUserList()
      })

      this.addDialogVisible = false
    },

    // 编辑用户信息
    editUserInfo(userInfo) {
      this.editInfo.id = userInfo.id
      this.editInfo.username = userInfo.username
      this.editInfo.email = userInfo.email
      this.editInfo.mobile = userInfo.mobile

      this.editDialogVisible = !this.editDialogVisible
    },

    // 编辑完成提交
    async submitEditData() {
      const { data: res } = await this.$axios.put('users/' + this.editInfo.id, {
        email: this.editInfo.email,
        mobile: this.editInfo.mobile
      })

      if (res.meta.status !== 200) {
        return this.$message.error('修改失败, 请重试!')
      }
      this.$message.success('修改成功!')

      this.getUserList()
      this.editDialogVisible = false
    },

    // 删除用户
    delUser(userID) {
      this.$msgBox
        .confirm('您确认要删除该用户吗?', '', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning',
          callback: async (action) => {
            if (action === 'confirm') {
              const { data: res } = await this.$axios.delete('users/' + userID)

              if (res.meta.status !== 200) return this.$message.error('删除失败')

              // 如果删除的是最有一页的最后一行数据, 则请求上一页的数据
              if (this.userList.length === 1) {
                this.queryUserInfo.pagenum -= 1
              }

              this.getUserList()
              this.$message({ type: 'success', message: '删除成功!' })
            } else {
              this.$message({ type: 'info', message: '操作取消' })
            }
          }
        })
    },

    // 分配角色
    async setRoles(userInfo) {
      this.curtUser = userInfo

      // 获取角色列表
      const { data: res } = await this.$axios.get('roles')
      if (res.meta.status !== 200) return this.$message.error(this.meta.msg)

      this.roleList = res.data
      this.showRole = !this.showRole
    },

    // 更新修改的角色
    async submitRoleInfo() {
      const { data: res } = await this.$axios({
        url: `users/${this.curtUser.id}/role`,
        method: 'put',
        data: {
          rid: this.roleID
        }
      })
      if (res.meta.status !== 200) return this.$message.error('角色分配失败, 请重试!')
      this.$message.success('分配角色成功!')

      this.getUserList()
      this.showRole = false
    },

    // 对话框关闭 重置 其中的值
    closeRoleDilog() {
      this.curtUser = {}
      this.roleID = ''
    }
  }
}
</script>

<style lang="less" scoped></style>
