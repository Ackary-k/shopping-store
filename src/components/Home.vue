<template>
  <el-container class="home-container">
    <!-- 头部 -->
    <el-header>
      <div>
        <img src="../assets/heima.png" alt="" style="display: none;" />
        <h3>电商后台管理系统</h3>
      </div>
      <el-button type="primary" @click="signOut">退出</el-button>
    </el-header>
    <!-- 主界面 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-button" @click="setCollapse">
          <el-icon
            :class="
              isCollapse ? 'el-icon-s-unfold spacing' : 'el-icon-s-fold spacing'
            "
          ></el-icon>
        </div>
        <!-- 侧边栏菜单 -->
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409EFF"
          unique-opened
          router
          :collapse="isCollapse"
          :collapse-transition="false"
          :default-active="activePath"
        >
          <!-- 一级菜单 -->
          <el-submenu
            v-for="obj in menuList"
            :key="obj.id"
            :index="obj.id.toString()"
          >
            <!-- 一级菜单模板 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="obj.iconclass"></i>
              <!-- 文本 -->
              <span>{{ obj.authName }}</span>
            </template>
            <!-- 二级子菜单 -->
            <el-menu-item
              v-for="item in obj.children"
              :key="item.id"
              :index="'/' + item.path"
              @click="saveNavState('/' + item.path)"
            >
              <!-- 二级菜单模板 -->
              <template slot="title">
                <!-- 图标 -->
                <i :class="item.iconclass"></i>
                <!-- 文本 -->
                <span>{{ item.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 主体区域 -->
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  created() {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  data() {
    return {
      menuList: [],
      // 是否折叠
      isCollapse: false,
      // 保存侧边栏的激活状态
      activePath: ''
    }
  },
  methods: {
    // 退出登录
    signOut() {
      const res = this.$msgBox.confirm('确认退出?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      res
        .then(() => {
          window.sessionStorage.removeItem('token')
          this.$router.push('/login')
        })
        .catch(() => {
          this.$message('取消退出')
        })
    },

    // 获取菜单数据
    async getMenuList() {
      const { data: res } = await this.$axios.get('menus')
      if (res.meta.status !== 200) return this.$message(res.meta.msg)
      this.menuList = res.data
    },

    // 是否显示侧边栏
    setCollapse() {
      this.isCollapse = !this.isCollapse
    },

    // 保存点击的路径到本地
    saveNavState(activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  }
}
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 0;
  > div {
    display: flex;
    align-items: center;
    color: #fff;
    font-size: 20px;
    h3 {
      margin-left: 25px;
    }
  }
}
.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: 0;
  }
}
.el-main {
  background-color: #eaedf1;
}

.iconfont {
  margin-right: 10px;
}

.toggle-button {
  height: 64px;
  padding-left: 20px;
  color: #fff;
  line-height: 64px;
  cursor: pointer;
  .spacing {
    margin-right: 10px;
  }
}
</style>
