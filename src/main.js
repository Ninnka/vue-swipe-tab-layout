import SwipeTabContainer from '@/components/swipe-tab-layout/swipe-tab-container';
import SwipeTabNav from '@/components/swipe-tab-layout/swipe-tab-nav';

// const components = [
//   MarqueeText
// ];

// const install = (vue) => {
//   /* istanbul ignore if */
//   if (install.installed) return;
//   /*eslint-disable*/
//   components.map((component) => {
//     vue.component(component.name, component);
//   });
// };

/* istanbul ignore if */
// if (typeof window !== 'undefined' && window.Vue) {
//   install(window.Vue);
// };

export {
  SwipeTabContainer,
  SwipeTabNav,
}

export default {
  // install,
  SwipeTabContainer,
  SwipeTabNav,
};

// 测试用
// import Vue from 'vue'
// import App from './App'

// Vue.config.productionTip = false

// /* eslint-disable no-new */
// new Vue({
//   el: '#app',
//   components: { App },
//   template: '<App/>'
// })
