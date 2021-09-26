<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加分类按钮区域 -->
      <el-row>
        <el-col>
          <el-button
            type="primary"
            @click="addCate"
            style="margin-bottom: 10px;"
            >添加分类</el-button
          >
        </el-col>
      </el-row>

      <!-- 分类表格
        :data(设置数据源) :columns(设置表格中列配置信息) :selection-type(是否有复选框)
        :expand-type(是否展开数据) show-index(是否设置索引列) index-text(设置索引列头)
        border(是否添加纵向边框) :show-row-hover(是否鼠标悬停高亮) -->
      <tree-table
        :data="goodsCateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        :show-row-hover="false"
      >
        <!-- 是否有效区域， 设置对应的模板列： slot="isOk"(与columns中设置的template一致) -->
        <!-- <template slot="isOK" slot-scope="scope"> 以下简写: -->
        <template #isOK="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: lightgreen;"
          ></i>
          <i class="el-icon-error" v-else style="color: red;"></i>
        </template>

        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag
            size="mini"
            type="success"
            v-else-if="scope.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>

        <!-- 操作 -->
        <template slot="opt">
          <el-button size="mini" type="primary" icon="el-icon-edit"
            >编辑</el-button
          >
          <el-button size="mini" type="danger" icon="el-icon-delete"
            >删除</el-button
          >
        </template>
      </tree-table>

      <!-- 分页导航区域
        @size-change(pagesize改变时触发)
        @current-change(页码发生改变时触发)
        :current-page(设置当前页码)
        :page-size(设置每页的数据条数)
        :total(设置总页数)
        -->
      <el-pagination
        style="margin-left: 650px;"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        layout="total, sizes, prev, pager, next, jumper"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        :total="total"
      ></el-pagination>

      <!-- 添加分类 对话框组件
        :visible.sync(设置是否显示对话框) width(设置对话框的宽度)
        :before-close(在对话框关闭前触发的事件)
    -->
      <el-dialog
        title="添加分类"
        :visible.sync="showCateDialog"
        @closed="dialogClosed"
        width="40%"
      >
        <!-- 对话框主体区域 -->
        <el-form
          ref="addCateFormRef"
          :model="addForm"
          :rules="formRules"
          label-width="80px"
        >
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="addForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类" prop="cat_pid">
            <!-- expandTrigger='hover'(鼠标悬停触发级联)
            v-model(设置级联菜单绑定数据)
            :options(指定级联菜单数据源)
            :props(用来配置数据显示的规则)
            clearable(提供“X”号完成删除文本功能)
            change-on-select(是否可以选中任意一级的菜单) -->
            <el-cascader
              expandTrigger="hover"
              v-model="selectedKeys"
              :options="pCateList"
              :props="cascaderProps"
              @change="parentCateChange"
              clearable
              change-on-select
            ></el-cascader>
          </el-form-item>
        </el-form>
        <!-- 对话框底部区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="showCateDialog = false">取 消</el-button>
          <el-button type="primary" @click="commitData">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 分页查询信息
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类列表
      goodsCateList: [],
      // 总数
      total: 0,
      // 表格的列树形
      columns: [
        { label: '分类名称', prop: 'cat_name' },
        // template 将当前列设置为模板列
        { label: '是否有效', prop: '', type: 'template', template: 'isOK' },
        { label: '排序', prop: '', type: 'template', template: 'order' },
        { label: '操作', prop: '', type: 'template', template: 'opt' }
      ],
      showCateDialog: false,
      // 分类数据
      addForm: {
        cat_pid: -1,
        cat_name: '',
        cat_level: 0
      },

      // 数据校验
      formRules: {
        catName: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
      },

      // 父级分类数据
      pCateList: [],

      // 级联菜单中的数据展示
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },

      // 选中的分类
      selectedKeys: []
    }
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$axios({
        url: 'categories',
        method: 'get',
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败!')
      }
      this.goodsCateList = res.data.result
      this.total = res.data.total
    },

    // 更改页面数据
    handleSizeChange(newSize) {
      // pagesize 发生改变时触发, 获取最新的 pagesize 来展示数据
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },

    // 更改页码
    handleCurrentChange(newPagenum) {
      // 页码发生改变时, 获取最新的 pagenum 来展示数据
      this.queryInfo.pagenum = newPagenum
      this.getCateList()
    },

    // 对话框关闭时的操作
    dialogClosed() {},

    // 添加分类事件
    addCate() {
      this.getParentCate()
      this.showCateDialog = !this.showCateDialog
    },

    // 点击确定时提交数据
    commitData() {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        // 发送请求完成添加分类
        const { data: res } = await this.$axios.post(
          'categories',
          this.addForm
        )

        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败')
        }

        this.$message.success('添加分类成功')
        this.getCateList()
        this.showCateDialog = false
      })
    },

    // 获取父级分类
    async getParentCate() {
      const { data: res } = await this.$axios({
        url: 'categories',
        method: 'get',
        params: { type: 2 }
      })

      if (res.meta.status !== 200) {
        return this.$message.error('获取数据失败!')
      }

      this.pCateList = res.data
    },

    // 选中方法
    parentCateChange() {
      // 如果用户选择了父级分类
      if (this.selectedKeys.length > 0) {
      // 则将数组中的最后一项设置为父级分类
        this.addForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // level也要跟着发生变化
        this.addForm.cat_level = this.selectedKeys.length
      } else {
        this.addForm.cat_pid = 0
        this.addForm.cat_level = 0
      }
    }
  },

  created() {
    this.getCateList()
  }
}
</script>

<style lang="less" scoped></style>
