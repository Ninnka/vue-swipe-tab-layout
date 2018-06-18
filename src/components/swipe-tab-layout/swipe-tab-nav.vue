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
