<template>
  <div id="app">
    <div class="wrapper">
      <swipe-tab-container
        owner="app"
        :currentTabIndex.sync="currentTabIndex"
        :tabNavList="tabNavList"
        @tabNavClick="tabNavClick"
        @tabNavdblClick="tabNavdblClick"
        :indicatorWidthScaleFactor="0.27"
        :fullFlex="true">

        <template
          v-for="(tabNav, index) in tabNavList"
          :slot="`swipe-tab-nav-${tabNav.key}`">
          <swipe-tab-nav
            class="nav-item"
            :class="currentTabIndex === index ? 'activated' : ''"
            :style="navItemStyleGetter"
            :tabLabel="tabNav.label"
            :key="tabNav.key">
            <div>{{ tabNav.label + index }}</div>
          </swipe-tab-nav>
        </template>

        <template :slot="`swipe-tab-content-left`">
          <div>
            左边的
          </div>
        </template>

        <template :slot="`swipe-tab-content-right`">
          <div>
            右边的
          </div>
        </template>

      </swipe-tab-container>
    </div>
  </div>
</template>

<script>
import SwipeTabContainer from '@/components/swipe-tab-layout/swipe-tab-container';
import SwipeTabNav from '@/components/swipe-tab-layout/swipe-tab-nav';

export default {
  name: 'App',

  components: {
    SwipeTabContainer,
    SwipeTabNav,
  },

  data () {
    return {
      currentTabIndex: 0,
      tabNavList: [
        {
          label: '左边的tab',
          key: 'left',
          type: 0,
        },
        {
          label: '右边的tab',
          key: 'right',
          type: 1,
        },
      ]
    };
  },

  computed: {
    navItemStyleGetter () {
      const styles = {
        // 'min-width': `${100 / this.tabNavList.length}%`
        ...this.swipeTabNavStyle
      };
      return styles;
    },
  },

  methods: {
    tabNavClick ({ index, tabNav, event }) {
      console.log('click tab nav', event);
    },

    tabNavdblClick ({ index, tabNav, event }) {
      console.log('double click tab nav', event);
    },
  }
};
</script>

<style lang="less">
html, body {
  height: 100%;
  width: 100%;
  padding: 0;
  margin: 0;
}

#app {
  font-family: "PingFangSC-Regular","PingFang SC","Helvetica Neue",Helvetica,"Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-overflow-scrolling: touch;
  -webkit-backface-visibility: hidden;
  -moz-backface-visibility: hidden;
  -ms-backface-visibility: hidden;
  backface-visibility: hidden;
  -webkit-perspective: 1000;
  -moz-perspective: 1000;
  -ms-perspective: 1000;
  perspective: 1000;
  -webkit-transform: translateZ(0);
  -moz-transform: translateZ(0);
  -ms-transform: translateZ(0);
  -o-transform: translateZ(0);
  transform: translateZ(0);
  margin: 0 auto;
  width: 100%;
  height: 100%;
  max-width: 470px;
  max-height: 850px;
  display: block;
  background: #eeeeee;
  overflow: hidden;
  font-size: 0.12rem;
  position: relative;

  .wrapper {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .nav-item {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color .2s;

    &.activated {
      color: #be8c4f;
    }
  }
}
</style>
