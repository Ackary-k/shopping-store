<template>
  <div>
    <h3>分类参数</h3>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 警告区域 :closable="false"(是否展示“X”号) show-icon(显示图标) -->
      <el-alert
        title="注意：只允许为第三级分类设置相关参数"
        type="warning"
        :closable="false"
        show-icon
      >
      </el-alert>

      <!-- 选择商品分类的级联选择框 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            expandTrigger="hover"
            v-model="selectedCateKeys"
            :options="cateList"
            :props="cateProps"
            @change="handleChange"
            clearable
          ></el-cascader>
        </el-col>
        <el-col></el-col>
      </el-row>

      <!-- tab 页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <!-- 添加动态参数 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            size="mini"
            type="primary"
            :disabled="isButtonDisabled"
            @click="showDialog"
          >
            添加参数
          </el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="sc">
                <el-tag v-for="(tag, i) in sc.row.attr_vals" :key="i" closable>
                  {{ tag }}
                </el-tag>
                <!-- 输入框 -->
                <el-input
                  v-if="sc.row.inputVisible"
                  class="input-new-tag tag-self-style"
                  v-model="sc.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(sc.row)"
                  @blur="handleInputConfirm(sc.row)"
                >
                </el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(sc.row)"
                >
                  + New Tag
                </el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column
              label="参数名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row)"
                >
                  编辑
                </el-button>
                <el-button
                  @click="delDataByID(scope.row.attr_id)"
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态参数 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            size="mini"
            type="primary"
            :disabled="isButtonDisabled"
            @click="showDialog"
            >添加属性</el-button
          >
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand"></el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column
              label="属性名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row)"
                >
                  编辑
                </el-button>
                <el-button
                  @click="delDataByID(scope.row.attr_id)"
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数的对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 添加表单 -->
      <el-form
        :model="addForm"
        :rules="formRules"
        ref="addFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑参数的对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- 编辑参数表单 -->
      <el-form
        :model="addForm"
        :rules="formRules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 分类列表
      cateList: [],
      // 用户在级联下拉菜单中选中的分类id
      selectedCateKeys: [],
      // 配置级联菜单中数据如何展示
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 保存 tab 标签的 name 值
      activeName: 'many',
      // 动态参数表格数据
      manyTableData: [],
      // 动态属性表格数据
      onlyTableData: [],
      // 控制添加参数.属性对话框的显示或隐藏
      addDialogVisible: false,
      // 添加参数的表单数据对象
      addForm: {
        attr_id: -1,
        attr_name: ''
      },
      // 添加表单验证规则
      formRules: {
        attr_name: [{ required: true, message: '请输入名称', trigger: 'blur' }]
      },
      // 编辑参数对话框是否可见
      editDialogVisible: false
    }
  },
  methods: {
    async getCateList() {
      // 获取所有的商品分类列表
      const { data: res } = await this.$axios.get('categories')

      if (res.meta.status !== 200) {
        return this.$message.error('获取分类数据失败')
      }

      // 将数据列表赋值给cateList
      this.cateList = res.data
    },

    // 当用户在级联菜单中选择内容改变时触发
    async handleChange() {
      this.getParams()
    },

    // 请求分类参数
    async getParams() {
      if (this.cateID === null) return
      // 请求参数列表
      const { data: res } = await this.$axios({
        url: `categories/${this.cateID}/attributes`,
        method: 'get',
        params: { sel: this.activeName }
      })

      if (res.meta.status !== 200) {
        return this.$message.error('数据获取失败!')
      }

      // 添加动态参数数据
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else if (this.activeName === 'only') {
        // 添加静态属性数据
        this.onlyTableData = res.data
      }

      res.data.forEach((e) => {
        // 设置字符串为数组, 生成tag
        e.attr_vals =
          e.attr_vals.trim().length === 0 ? [] : e.attr_vals.split(' ')
        // 设置文本框可见的属性
        e.inputVisible = false
        e.inputValue = ''
      })
    },

    // tab 点击事件
    handleClick() {
      //   if (this.cateID === null) return
      this.getParams()
    },

    // 添加参数
    addParams() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$axios({
          url: `categories/${this.cateID}/attributes`,
          method: 'POST',
          data: {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        })

        if (res.meta.status !== 201) {
          return this.$message.error('添加' + this.titleText + '失败!')
        }

        this.$message.success('添加' + this.titleText + '成功!')

        this.getParams()
        this.getCateList()

        this.addDialogVisible = false
      })
    },
    // 电视添加参数对话框
    showDialog() {
      this.addDialogVisible = !this.addDialogVisible
    },
    // 显示编辑对话框
    showEditDialog(row) {
      this.addForm.attr_id = row.attr_id
      this.addForm.attr_name = row.attr_name
      this.editDialogVisible = !this.editDialogVisible
    },
    // 对话框关闭时, 重置表单
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 编辑对话框关闭事件, 重置表单
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 编辑提交事件
    async editParams() {
      const { data: res } = await this.$axios({
        url: `categories/${this.cateID}/attributes/${this.addForm.attr_id}`,
        method: 'put',
        data: {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        }
      })

      if (res.meta.status !== 200) {
        return this.$message.error('编辑失败, 请重试!')
      }
      this.$message.success('编辑成功!')

      this.editDialogVisible = false
      this.getParams()
    },

    // 删除
    async delDataByID(attrID) {
      const { data: res } = await this.$axios({
        url: `categories/${this.cateID}/attributes/${attrID}`,
        method: 'DELETE'
      })

      if (res.meta.status !== 200) return this.$message.error('删除失败!')
      this.$message.success('删除成功!')

      this.getParams()
    },

    // 当用户在文本框中按下enter键或者焦点离开时都会触发执行
    handleInputConfirm(row) {
      // 判断用户在文本框中输入的内容是否合法
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
      }

      row.inputVisible = false
      // 如果用户输入了真实合法的数据，需要保存起来
    },
    showInput(row) {
      // 用户点击添加按钮时触发
      row.inputVisible = true

      // $nextTick:在页面上元素被重新渲染之后，调用回调函数的代码
      //   this.$nextTick(_ => {
      //     // 让文本框自动获得焦点
      //     this.$refs.saveTagInput.$refs.input.focus()
      //   })
    }
  },
  created() {
    this.getCateList()
  },
  computed: {
    // 计算属性 如果选中的商品分类不等于 3, 则禁用
    isButtonDisabled() {
      return this.selectedCateKeys.length !== 3
    },

    // 用户选中的 3 级分类 ID
    cateID() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[this.selectedCateKeys.length - 1]
      }
      return null
    },

    // 动态标题
    titleText() {
      return this.activeName === 'many' ? '动态参数' : '静态属性'
    }
  }
}
</script>

<style scoped lang="less">
.cat_opt {
  padding: 15px 0;
}

.el-tag {
  margin: 5px;
}

.tag-self-style {
  width: 100px;
}

.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>
