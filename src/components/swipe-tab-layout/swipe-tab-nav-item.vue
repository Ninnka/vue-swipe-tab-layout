<template>
  <div class="swipe-tab-nav-item" ref="tabNavItem">
    <span>{{ tabLabel }}</span>
    <slot name="tab-label"></slot>
  </div>
</template>

<script>
export default {
  name: 'SwipeTabNav',

  props: {
    tabLabel: ''
  },

  data () {
    return {};
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
