<template>
  <div class="swipe-tab-nav-item" ref="tabNavItem">
    <span v-if="$slots.default === undefined">{{ tabLabel }}</span>
    <slot v-else></slot>
  </div>
</template>

<script>
export default {
  name: 'SwipeTabNav',

  props: {
    // * 当前组件的拥有者，可以设置为所在的路由页面或者父组件
    owner: '',

    // * 显示的内容
    tabLabel: ''
  },

  data () {
    return {};
  },

  async mounted () {
  },

  methods: {
  }
};
</script>

<style lang="less" scoped>
  .swipe-tab-nav-item {
    cursor: pointer;
  }
</style>
