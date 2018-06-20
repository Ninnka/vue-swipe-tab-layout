<template>
  <div :data-owner="owner" class="swipe-tab-container">
    <div class="swipe-tab-nav--layer" ref="swipeTabNavLayerRef">
      <div class="swipe-tab-nav--slider" ref="swipeTabNavSliderRef" :style="swipeTabNavSliderStyleGetter">
        <div
          class="nav-item--wrapper"
          :class="fullFlex ? 'flex-wrapper' : ''"
          :style="navItemWrapperStyleGetter"
          v-for="(tabNav, index) of tabNavList"
          :key="tabNav.key"
          ref="tabNavRef"
          @click="tabNavClick({
            index,
            tabNav,
          })"
          @dblclick="tabNavdblClick({
            index,
            tabNav
          })">
          <slot :name="`swipe-tab-nav-${tabNav.key}`"></slot>
        </div>
        <div class="nav-indicator" :style="indicatorStyleGetter"></div>
      </div>
    </div>
    <div class="swipe-tab-content--layer">
      <div class="swipe-tab-content--slider" :style="sliderStyleGetter">
        <div class="swipe-tab-content--item" v-for="tabNav in tabNavList" :key="tabNav.key" :style="swipeTabContentItemStyle[tabNav.key] ? swipeTabContentItemStyle[tabNav.key] : {}">
          <slot :name="`swipe-tab-content-${tabNav.key}`" class="tab-content--slot"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BScroll from 'better-scroll';
import Hammer from 'hammerjs';

export default {
  name: 'SwipeTabContainer',

  props: {
    // * 当前组件的拥有者，可以设置为所在的路由页面或者父组件
    owner: '',

    // * tab对象列表
    tabNavList: {
      type: Array,
      default () {
        return [];
      }
    },

    // * 当前所在的tab index
    currentTabIndex: {
      type: Number,
      default: 0
    },

    // * 导航条的宽度控制因子
    indicatorWidthScaleFactor: {
      type: Number,
      default: 0.1
    },

    // * tab-nav--wrapper的自定义样式
    swipeTabNavWrapperStyle: {
      type: Object,
      default () {
        return {};
      }
    },

    // * tab-content的自定义样式
    swipeTabContentItemStyle: {
      type: Object,
      default () {
        return {};
      }
    },

    // * 每一个nav-item平分父级的宽度
    fullFlex: false
  },

  components: {
  },

  directives: {
  },

  data () {
    return {
      tabNavScrollIns: null, // * tab-nav 的滑动实例
      tabNavScrollOptions: {}, // * 创建 tab-nav 的滑动实例的可选项
      swipeContentLayerWidth: null, // * tab-content 容器的宽度
      swipeContentTabNavSliderWidth: null, // * tab-nav 的滑动容器的宽度
      swipeContentSliderWidth: null, // * tab-content 的滑动容器的宽度
      swipeContentSliderTranslateXOld: 0, // * 保存就得滑动值
      swipeContentSliderTranslateX: 0, // * 动态的滑动值
      panAllow: false, // * 是否允许滑动
      sliderHammerIns: null, // * tab-content 的hammer实例
      sliderCssTransition: false, // * 是否开始csstransition
      slidertransitionTime: 0.4, // * csstransition持续时间
      isPaningLeft: false, // * 是否向左滑动中
      isPanedLeft: false, // * 向左滑动完毕
      isPaningRight: false, // * 是否向右滑动中
      isPanedRight: false, // * 向右滑动完毕
      tmpLeftCenter: null, // * 从右往左的临时转折点
      tmpRightCenter: null, // * 从左往左的临时转折点
      setLeftDirection: false, // *
      setRightDirection: false, // *
      navItemWidths: [], // * nav-item 的宽度
      navItemLefts: [], // * nav-item 的左偏移值
      navIndicatorTranslateX: 0, // * 动态的 nav-indicator 滑动值
      navIndicatorTranslateXOld: 0, // * 保存 nav-indicator 的滑动值
      translateScales: [], // * nav-indicator 向下一个或前一个item滑动时的距离跟 tab-content 的跨度比
      maxtabNavSliderScrollXDiff: 0, // * tab-nav 允许的最大的滑动值
    };
  },

  async mounted () {
    const swipeContentLayer = document.querySelector(`[data-owner=${this.owner}] .swipe-tab-content--layer`);
    const swipeTabContentSlider = document.querySelector(`[data-owner=${this.owner}] .swipe-tab-content--slider`);
    // this.swipeContentLayerWidth = swipeContentLayer.offsetWidth;
    this.swipeContentLayerWidth = swipeContentLayer.getBoundingClientRect().width;
    if (swipeContentLayer && this.$refs.swipeTabNavSliderRef) {
      // this.swipeContentTabNavSliderWidth = this.$refs.swipeTabNavSliderRef.offsetWidth;
      this.swipeContentTabNavSliderWidth = this.$refs.swipeTabNavSliderRef.getBoundingClientRect().width;
      // * 设置slider容器的宽度
      // const tmpWidth = this.tabNavList.length * swipeContentLayer.offsetWidth;
      const tmpWidth = this.tabNavList.length * swipeContentLayer.getBoundingClientRect().width;
      this.swipeContentSliderWidth = !isNaN(tmpWidth) ? tmpWidth : null;
      // * 设置slider容器的滑动监听
      this.sliderHammerIns = new Hammer(swipeTabContentSlider);
      this.sliderHammerIns.get('tap').set({ enable: false });
      this.sliderHammerIns.get('press').set({ time: 50 });
      this.sliderHammerIns.on('press', this.sliderPress);
      this.sliderHammerIns.get('pan').set({ direction: Hammer.DIRECTION_HORIZONTAL });
      this.sliderHammerIns.on('panstart', this.sliderPanStart, true);
      this.sliderHammerIns.on('panend', this.sliderPanEnd);
      this.sliderHammerIns.on('panleft', this.sliderPanLeft, true);
      this.sliderHammerIns.on('panright', this.sliderPanRight, true);
      this.sliderHammerIns.on('pandown', this.sliderPanDown);
      this.sliderHammerIns.on('panup', this.sliderPanUp);
      this.sliderHammerIns.on('pancancel', this.sliderPancancel);

      setTimeout(() => {
        const tabNavRefs = this.$refs.tabNavRef;
        let tmpWidth = 0;
        let tmpLefts = [];
        this.navItemWidths = tabNavRefs.map((key, index) => {
          // let tmpLeft = tabNavRefs[index].$refs.tabNavItem.offsetLeft;
          let tmpLeft = tabNavRefs[index].offsetLeft;
          // const clientRect = tabNavRefs[index].$refs.tabNavItem.getBoundingClientRect();
          const clientRect = tabNavRefs[index].getBoundingClientRect();
          const offsetWidth = clientRect.width;
          tmpWidth += offsetWidth;
          // * 对比left
          tmpLeft = ~~clientRect.left === tmpLeft ? clientRect.left : tmpLeft;
          tmpLefts.push(tmpLeft);
          return offsetWidth;
        });
        this.navItemLefts = [...tmpLefts];
        this.swipeContentTabNavSliderWidth = tmpWidth;
        this.maxtabNavSliderScrollXDiff = Math.abs(this.swipeContentTabNavSliderWidth - this.swipeContentLayerWidth);
        this.navItemWidths.forEach((item, index) => {
          if (index < tabNavRefs.length - 1) {
            // const tmp1 = tabNavRefs[index].$refs.tabNavItem.getBoundingClientRect().left;
            // const tmp2 = tabNavRefs[index + 1].$refs.tabNavItem.getBoundingClientRect().left;
            const tmp1 = tabNavRefs[index].getBoundingClientRect().left;
            const tmp2 = tabNavRefs[index + 1].getBoundingClientRect().left;
            this.translateScales.push(Math.abs((tmp2 - tmp1) / this.swipeContentTabNavSliderWidth));
          }
        });
        this.navIndicatorTranslateX = this.navItemWidths[this.currentTabIndex] * this.indicatorWidthScaleFactor;
        this.navIndicatorTranslateXOld = this.navIndicatorTranslateX;
        this.initScroll();
      }, 1);
    }
  },

  computed: {
    navItemWrapperStyleGetter () {
      const styles = {
        'max-width': `${100 / this.tabNavList.length}%`,
        ...this.swipeTabNavWrapperStyle
      };
      return styles;
    },

    sliderStyleGetter () {
      const styles = {
        transform: `translate3d(${this.swipeContentSliderTranslateX}px, 0, 0)`,
      };
      if (this.swipeContentSliderWidth !== null) {
        styles.width = `${this.swipeContentSliderWidth}px`;
      }
      if (this.sliderCssTransition) {
        styles.transition = `all ${this.slidertransitionTime}s`;
      }
      return styles;
    },

    swipeTabNavSliderStyleGetter () {
      const styles = {};
      let width = 0;
      this.navItemWidths.forEach((item) => {
        width += item;
      });
      // * 如果layerSlider的宽度小于等于layer加上偏差值，则宽度为layer的宽度
      styles.width = width !== 0 && width > this.swipeContentLayerWidth + 1.5 ? width + 'px' : '100%';
      return styles;
    },

    indicatorStyleGetter () {
      const styles = {
        width: this.navItemWidths[this.currentTabIndex] * (1 - this.indicatorWidthScaleFactor * 2) + 'px',
        transform: `translate3d(${this.navIndicatorTranslateX}px, 0, 0)`
      };
      if (this.sliderCssTransition) {
        styles.transition = `all ${this.slidertransitionTime}s`;
      }
      return styles;
    }
  },
  methods: {
    initScroll () {
      if (this.$refs.swipeTabNavLayerRef) {
        const options = {
          ...this.tabNavScrollOptions,
          scrollX: true,
          scrollY: false,
          click: true,
          bounce: false,
          // scrollbar: {
          //   fade: true,
          //   interactive: false // 1.8.0 新增
          // },
        };

        this.tabNavScrollIns = new BScroll(this.$refs.swipeTabNavLayerRef, options);
      }
    },

    tabNavClick (params) {
      this.$emit('tabNavClick', params);
      if (params.index !== this.currentTabIndex) {
        this.navChange(params);
      }
    },

    tabNavdblClick (params) {
      this.$emit('tabNavdblClick', params);
    },

    navChange ({ index, tabNav }) {
      this.sliderCssTransition = true;
      this.$emit('update:currentTabIndex', index);
      this.navIndicatorSlide({ index, tabNav });
      this.navlayerSliderSlide({ index, tabNav });
      this.contentSlide({ index, tabNav });
    },

    navIndicatorSlide ({ index, tabNav }) {
      // const tabNavItemRef = this.$refs.tabNavRef[index].$refs.tabNavItem;
      const tabNavItemRef = this.$refs.tabNavRef[index];
      // this.navIndicatorTranslateX = tabNavItemRef.offsetLeft + tabNavItemRef.offsetWidth * this.indicatorWidthScaleFactor;
      const clientRect = tabNavItemRef.getBoundingClientRect();
      let left = tabNavItemRef.offsetLeft;
      left = ~~clientRect === left ? ~~clientRect : left;
      this.navIndicatorTranslateX = left + clientRect.width * this.indicatorWidthScaleFactor;
      this.navIndicatorTranslateXOld = this.navIndicatorTranslateX;
    },

    navlayerSliderSlide ({ index }) {
      if (this.swipeContentTabNavSliderWidth <= this.swipeContentLayerWidth + 1.5) {
        // * 如果layerSlider的宽度小于等于layer加上偏差值，则不需要滚动slider
        return;
      }
      const width = this.navItemWidths[index];
      const left = this.navItemLefts[index];
      let diff = (left + width / 2) - this.swipeContentLayerWidth / 2;
      diff = diff > this.maxtabNavSliderScrollXDiff ? this.maxtabNavSliderScrollXDiff : diff;
      diff = diff < 0 ? 0 : -diff;
      this.tabNavScrollIns.scrollTo(diff, 0, 300);
    },

    contentSlide ({ index, tabNav }) {
      this.swipeContentSliderTranslateX = -this.swipeContentLayerWidth * index;
      this.swipeContentSliderTranslateXOld = this.swipeContentSliderTranslateX;
    },

    updateCurrentTabIndex (index) {
      index = index > this.tabNavList.length - 1 ? this.tabNavList.length - 1 : index;
      index = index < 0 ? 0 : index;
      this.$emit('update:currentTabIndex', index);
    },

    correctPredictIndex (index) {
      index = index > this.tabNavList.length - 1 ? this.tabNavList.length - 1 : index;
      index = index < 0 ? 0 : index;
      return index;
    },

    // * --------
    sliderPress (ev) {
      // console.log('sliderPress ev', ev);
      ev.preventDefault();
      this.sliderCssTransition = false;
    },

    sliderPanStart (ev) {
      // console.log('sliderPanStart ev', ev);
      ev.preventDefault();
      ev.srcEvent.stopPropagation();
      const { angle } = ev;
      this.sliderCssTransition = false;
      if (Math.abs(angle) >= 145 || Math.abs(angle) <= 35) {
        // * 滑动角度大于160才算入有效滑动
        this.swipeContentSliderTranslateXOld = this.swipeContentSliderTranslateX;
        this.navIndicatorTranslateXOld = this.navIndicatorTranslateX;
        this.panAllow = true;
      } else {
        // console.log('stop');
        this.sliderHammerIns.stop();
      }
      return false;
    },

    sliderPanEnd (ev) {
      // console.log('sliderPanEnd ev', ev);
      ev.preventDefault();
      ev.srcEvent.stopPropagation();
      this.panAllow = false;
      let predictTabIndex = Math.abs(~~(this.swipeContentSliderTranslateX / this.swipeContentLayerWidth));
      predictTabIndex = this.correctPredictIndex(predictTabIndex);
      this.$emit('update:currentTabIndex', predictTabIndex);
      // const translateXDiff = this.swipeContentSliderTranslateX % this.swipeContentLayerWidth;
      const translateXDiff = this.swipeContentSliderTranslateX - this.swipeContentSliderTranslateXOld;

      this.isPaningLeft = false;
      this.isPanedLeft = false;
      this.isPaningRight = false;
      this.isPanedRight = false;
      this.tmpLeftCenter = null;
      this.tmpRightCenter = null;
      this.setLeftDirection = false;
      this.setRightDirection = false;

      if (translateXDiff !== 0) {
        // const tabNavItemRef = this.$refs.tabNavRef[predictTabIndex].$refs.tabNavItem;
        const tabNavItemRef = this.$refs.tabNavRef[predictTabIndex];
        const clientRect = tabNavItemRef.getBoundingClientRect();
        let left = tabNavItemRef.offsetLeft;
        left = ~~clientRect === left ? ~~clientRect : left;
        this.sliderCssTransition = true;
        if (this.swipeContentSliderTranslateX >= 0) {
          this.swipeContentSliderTranslateX = 0;
          this.navIndicatorTranslateX = this.navItemWidths[predictTabIndex] * this.indicatorWidthScaleFactor;
        } else if (Math.abs(this.swipeContentSliderTranslateX) >= this.swipeContentLayerWidth * this.tabNavList.length) {
          this.swipeContentSliderTranslateX = -this.swipeContentLayerWidth * this.tabNavList.length;
          this.navIndicatorTranslateX = left + clientRect.width * this.indicatorWidthScaleFactor;
        } else if (Math.abs(translateXDiff) > this.swipeContentLayerWidth / 5 * 2) {
          if (translateXDiff > 0) {
            this.swipeContentSliderTranslateX = -this.swipeContentLayerWidth * predictTabIndex;
            this.navIndicatorTranslateX = left + clientRect.width * this.indicatorWidthScaleFactor;
          } else {
            predictTabIndex = predictTabIndex + 1;
            predictTabIndex = this.correctPredictIndex(predictTabIndex);
            this.$emit('update:currentTabIndex', predictTabIndex);

            // const tabNavItemRef = this.$refs.tabNavRef[predictTabIndex].$refs.tabNavItem;
            const tabNavItemRef = this.$refs.tabNavRef[predictTabIndex];
            const clientRect = tabNavItemRef.getBoundingClientRect();
            let left = tabNavItemRef.offsetLeft;
            left = ~~clientRect === left ? ~~clientRect : left;
            this.swipeContentSliderTranslateX = -this.swipeContentLayerWidth * (predictTabIndex);
            this.navIndicatorTranslateX = left + clientRect.width * this.indicatorWidthScaleFactor;
          }
        } else {
          if (translateXDiff > 0) {
            predictTabIndex = predictTabIndex + 1;
            predictTabIndex = this.correctPredictIndex(predictTabIndex);
            this.$emit('update:currentTabIndex', predictTabIndex);

            // const tabNavItemRef = this.$refs.tabNavRef[predictTabIndex].$refs.tabNavItem;
            const tabNavItemRef = this.$refs.tabNavRef[predictTabIndex];
            const clientRect = tabNavItemRef.getBoundingClientRect();
            let left = tabNavItemRef.offsetLeft;
            left = ~~clientRect === left ? ~~clientRect : left;
            this.swipeContentSliderTranslateX = -this.swipeContentLayerWidth * (predictTabIndex);
            this.navIndicatorTranslateX = left + clientRect.width * this.indicatorWidthScaleFactor;
          } else {
            this.swipeContentSliderTranslateX = -this.swipeContentLayerWidth * predictTabIndex;
            this.navIndicatorTranslateX = left + clientRect.width * this.indicatorWidthScaleFactor;
          }
        }
      }
      this.swipeContentSliderTranslateXOld = this.swipeContentSliderTranslateX;
      this.navIndicatorTranslateXOld = this.navIndicatorTranslateX;

      setTimeout(() => {
        this.navlayerSliderSlide({index: predictTabIndex});
      }, 310);
    },

    sliderPanLeft (ev) {
      const { deltaX, velocityX } = ev;
      // console.log('sliderPanLeft ev', ev);
      this.isPanedLeft = true;
      this.isPaningLeft = true;
      if (this.currentTabIndex === this.tabNavList.length - 1 && !this.isPaningRight) {
        // console.log('not allow panleft');
        this.isPaningLeft = false;
        return null;
      }
      if (this.panAllow) {
        if (this.currentTabIndex === 0 && this.isPanedRight && !this.tmpLeftCenter) {
          // console.log('first left');
          this.tmpLeftCenter = ev.center;
          this.setLeftDirection = true;
          this.isPaningRight = false;
        }

        if (this.setRightDirection) {
          // console.log('use setRightDirection');
          this.swipeContentSliderTranslateX = this.swipeContentSliderTranslateXOld + (ev.center.x - this.tmpRightCenter.x);
          this.navIndicatorTranslateX = this.navIndicatorTranslateXOld + -(ev.center.x - this.tmpRightCenter.x) * this.translateScale[this.translateScale.length - 1];
        } else if (this.tmpLeftCenter) {
          // console.log('has tmpLeftCenter');
          this.swipeContentSliderTranslateX = this.swipeContentSliderTranslateXOld + (ev.center.x - this.tmpLeftCenter.x);
          this.navIndicatorTranslateX = this.navIndicatorTranslateXOld + -(ev.center.x - this.tmpLeftCenter.x) * this.translateScales[this.currentTabIndex];
        } else {
          this.swipeContentSliderTranslateX = this.swipeContentSliderTranslateXOld + deltaX;
          this.navIndicatorTranslateX = this.navIndicatorTranslateXOld + -deltaX * this.translateScales[this.currentTabIndex];
        }
      }
    },
    sliderPanRight (ev) {
      const { deltaX, velocityX } = ev;
      // console.log('sliderPanRight ev', ev);
      this.isPanedRight = true;
      this.isPaningRight = true;
      if (this.currentTabIndex === 0 && !this.isPaningLeft) {
        // console.log('not allow panright');
        this.isPaningRight = false;
        return null;
      }
      if (this.panAllow) {
        if (this.currentTabIndex === this.tabNavList.length - 1 && this.isPanedLeft && !this.tmpRightCenter) {
          this.tmpRightCenter = ev.center;
          this.setRightDirection = true;
          this.isPaningLeft = false;
        }

        if (this.setLeftDirection) {
          // console.log('use setLeftDirection');
          this.swipeContentSliderTranslateX = this.swipeContentSliderTranslateXOld + (ev.center.x - this.tmpLeftCenter.x);
          this.navIndicatorTranslateX = this.navIndicatorTranslateXOld + -(ev.center.x - this.tmpLeftCenter.x) * this.translateScales[0];
        } else if (this.tmpRightCenter) {
          // console.log('has tmpRightCenter');
          this.swipeContentSliderTranslateX = this.swipeContentSliderTranslateXOld + (ev.center.x - this.tmpRightCenter.x);
          this.navIndicatorTranslateX = this.navIndicatorTranslateXOld + -(ev.center.x - this.tmpRightCenter.x) * this.translateScales[this.currentTabIndex];
        } else {
          this.swipeContentSliderTranslateX = this.swipeContentSliderTranslateXOld + deltaX;
          // * 判断滑动的页面是否是最后一个
          const translateScale = this.currentTabIndex === this.tabNavList.length - 1 ? this.translateScales[this.currentTabIndex - 1] : this.translateScales[this.currentTabIndex];
          this.navIndicatorTranslateX = this.navIndicatorTranslateXOld + -deltaX * translateScale;
        }
      }
    },

    sliderPanDown (ev) {
      // console.log('sliderPanDown', ev);
      if (this.isPaningRight || this.isPaningLeft) {
        ev.preventDefault();
      }
    },

    sliderPanUp (ev) {
      // console.log('sliderPanUp', ev);
      if (this.isPaningRight || this.isPaningLeft) {
        ev.preventDefault();
      }
    },

    sliderPancancel (ev) {
      // console.log('sliderPancancel', ev);
      this.sliderPanEnd(ev);
    },

    scrollReset () {
      // * 初始化navIndicator的滚动
      this.navIndicatorTranslateX =
        this.navIndicatorTranslateXOld =
          this.navItemWidths[0] * this.indicatorWidthScaleFactor;
      // * 初始化tabContainer的滚动
      this.swipeContentSliderTranslateX = this.swipeContentSliderTranslateXOld = 0;
    }
  }
};
</script>

<style lang="less" scoped>
  .swipe-tab-container {
    width: 100%;
    height: 100%;

    .swipe-tab-nav--layer {
      position: relative;
      height: 40px;
      width: 100%;
      overflow: hidden;
      z-index: 1;
      box-shadow: 0 -2px 15px 0 rgba(132, 95, 42, 0.29);
    }

    .swipe-tab-nav--slider {
      position: relative;
      height: 40px;
      width: 100%;
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      position: relative;
      background-color: #ffffff;
      color: #272727;
      font-size: 14px;
      position: relative;

      &::after {
        content: '';
        clear: both;
        height: 0;
        display: none;
        font-size: 0;
      }

      .nav-indicator {
        position: absolute;
        left: 0;
        bottom: 1.5px;
        height: 4px;
        background-color: #be8c4f;
        will-change: transform;
        // transition: all .4s;
      }

      .nav-item--wrapper {
        height: 100%;
        flex-shrink: 0;
        flex-grow: 0;
        // padding: 0 .2rem;
        // float: left;
        // pointer-events: auto !important;

        &.flex-wrapper {
          padding: 0 !important;
          flex-grow: 1;
          flex-shrink: 1;
        }
      }

      // .nav-item {
      //   height: 100%;
      //   // padding: 0 .2rem;
      //   flex-shrink: 0;
      //   flex-grow: 0;
      //   display: flex;
      //   align-items: center;
      //   justify-content: center;
      //   transition: color .2s;
      //   // float: left;
      //   // pointer-events: auto !important;

      //   &.activated {
      //     color: #be8c4f;
      //   }
      // }
    }

    .swipe-tab-content--layer {
      width: 100%;
      height: calc(~"100% - 40px");

      .swipe-tab-content--slider {
        height: 100%;
        min-width: 100%;
        transform: translate3d(0, 0, 0);
        display: flex;
        align-items: center;
        flex-wrap: nowrap;
        will-change: transform;

        * {
          touch-action: pan-y;
        }

        .swipe-tab-content--item {
          flex-basis: 100%;
          height: 100%;
          flex-shrink: 1;
          flex-grow: 1;
        }
      }
    }
  }
</style>
