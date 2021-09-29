<template>
  <div>
    <h3>添加商品</h3>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 消息提示 -->
      <el-alert
        title="添加商品信息"
        type="info"
        center
        show-icon
        :closable="false"
      >
      </el-alert>

      <!-- 步骤条组件 -->
      <!-- align-center(居中效果) -->
      <el-steps
        :active="Number(activeIndex)"
        :space="200"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- 表单：label-position="top"(设置label在文本框上方) -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <!-- tab栏 -->
        <el-tabs
          v-model="activeIndex"
          tab-position="left"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>

            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price"></el-input>
            </el-form-item>

            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight"></el-input>
            </el-form-item>

            <el-form-item label="商品数量" prop="goods_number">
              <el-input type="number" v-model="addForm.goods_number"></el-input>
            </el-form-item>

            <el-form-item label="商品分类" prop="goods_cat">
              <!-- 选择商品分类的级联选择框 -->
              <el-cascader
                expandTrigger="hover"
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                @change="handleChange"
                clearable
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单item项 -->
            <el-form-item
              :label="item.attr_name"
              :key="item.attr_id"
              v-for="item in manyTableData"
            >
              <!-- 使用数组渲染复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  border
                  :label="val"
                  v-for="(val, i) in item.attr_vals"
                  :key="i"
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <!-- 循环生成静态属性 -->
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyTableData"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!--
                multiple: 是否支持多选
                limit: 允许上传的最大数量
                on-exceed: 文件超出个数限制时的钩子
                file-list: 是否在选取文件后立即进行上传
            -->
            <el-upload
              class="upload-demo"
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :on-success="handleSuccess"
              list-type="picture"
              :headers="headerObj"
            >
              <el-button size="small" type="primary">点击上传图片</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <el-form-item prop="goods_introduce">
              <quill-editor v-model="addForm.goods_introduce"></quill-editor>
              <el-button class="btnAdd" @click="doAddData" type="primary"
                >添加商品</el-button
              >
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="完成">完成</el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 预览图片对话框 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
// 导入 lodash 依赖
import _ from 'lodash'

export default {
  created() {
    this.getCateList()
  },

  data() {
    return {
      // 选项卡下标
      activeIndex: '0',
      // 添加商品的表单数据对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      // 验证规则
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ],
        goods_introduce: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      // 用来保存分类数据
      cateList: [],
      // 配置级联菜单中数据如何展示
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 动态参数列表
      manyTableData: [],
      // 静态属性列表
      onlyTableData: [],
      // 图片上传时的 URL 地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 上传图片的请求头
      headerObj: { Authorization: window.sessionStorage.getItem('token') },
      // 预览图片路径
      previewPath: '',
      // 预览图片对话框是否显示
      previewVisible: false
    }
  },
  methods: {
    // 获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$axios.get('categories')

      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据失败')
      }
      this.cateList = res.data
    },

    // 级联菜单改变时触发, 选择的 ID 保存在 addForm 中的 goods_cats 数组中
    handleChange() {
      // 如果用户选择的不是三级分类,该次选择无效，因为必须选择三级分类
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
        return this.$message.error('必须选择 3 级分类!')
      }
    },

    // 校验 tab
    beforeTabLeave(activeName, oldActiveName) {
      // 在tab栏切换之前触发，两个形参为切换前，后的tab栏name
      if (oldActiveName === '0') {
        // 在第一个标签页的时候
        if (this.addForm.goods_cat.length !== 3) {
          this.$message.error('请选择商品的分类')
          return false
        } else if (this.addForm.goods_name.trim() === '') {
          this.$message.error('请输入商品名称')
          return false
        } else if (this.addForm.goods_price === 0) {
          this.$message.error('请输入商品价格')
          return false
        } else if (this.addForm.goods_weight === 0) {
          this.$message.error('请输入商品重量')
          return false
        } else if (this.addForm.goods_number === 0) {
          this.$message.error('请输入商品数量')
          return false
        }
      }
    },

    // 当用户点击切换tab栏时触发
    async tabClicked() {
      if (this.activeIndex === '1') {
        // 发送请求获取动态参数
        const { data: res } = await this.$axios.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: 'many' }
          }
        )

        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数列表失败')
        }

        // 将attr_vals字符串转换为数组
        res.data.forEach((item) => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyTableData = res.data
      } else if (this.activeIndex === '2') {
        // 发送请求获取静态属性
        const { data: res } = await this.$axios.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: 'only' }
          }
        )

        if (res.meta.status !== 200) {
          return this.$message.error('获取静态属性列表失败')
        }

        this.onlyTableData = res.data
      }
    },

    // 预览图片的方法
    handlePreview(res) {
      this.previewVisible = true
      console.log(res)
      this.previewPath = res.response.data.url
    },

    // 删除图片
    handleRemove(file) {
      console.log(file)
      const i = this.addForm.pics.findIndex((p) => p === file.response.data.url)
      this.addForm.pics.splice(i, 1)
      console.log(this.addForm.pics)
    },

    // 保存图片路径
    handleSuccess(res) {
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.addForm.pics.push(res.data.url)
    },

    // 点击添加商品, 提交数据
    doAddData() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return this.$message.error('请填写必要的表单项')

        // 拷贝 addForm 对象, 处理后提交到服务器
        const newForm = _.cloneDeep(this.addForm)
        // 将 goods_cat 转为逗号分割的字符串
        newForm.goods_cat = newForm.goods_cat.join(',')

        // 处理动态参数: 将 manyTableData 处理添加到 attrs 中
        this.manyTableData.forEach((item) => {
          const obj = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          newForm.attrs.push(obj)
        })

        // 处理静态属性
        this.onlyTableData.forEach((item) => {
          const obj = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          newForm.attrs.push(obj)
        })

        // 发起请求
        const { data: res } = await this.$axios({
          url: 'goods/',
          method: 'POST',
          data: newForm
        })
        if (res.meta.status !== 201) return this.$message.error('添加失败, 请重试!')
        this.$message.success('添加成功!')
        this.$router.push('/goods')
        console.log(res)
      })
    }
  },

  // 添加 计算属性获取三级分类
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 10px;
}

.el-dialog .previewImg {
  width: 100%;
}

.ql-editor {
  min-height: 300px;
}

.btnAdd {
  margin-top: 10px;
}
</style>
