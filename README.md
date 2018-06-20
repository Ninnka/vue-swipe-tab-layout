# vue-swipe-tab-layout

> A vue component that simulate native Android component-tabLayout (一个模仿安卓tabLayout的Vue组件)

## Install

```bash
npm i -S vue-swipe-tab-layout
```

## Usage

### swipe-tab-container Attributes

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| ---- | --- | --- | ---- | ----- |
| owner | 当前组件的拥有者，可以设置为所在的路由页面或者父组件 | String | - | '' |
| tabNavList | tab-nav 对象列表 | Array | - | [] |
| currentTabIndex | 当前所在的tab index | Number | - | 0 |
| indicatorWidthScaleFactor | nav-indicator的宽度控制因子 | Number | - | 0.1 |
| swipeTabNavWrapperStyle | tab-nav的容器的自定义样式 | Object | - | {} |
| swipeTabContentItemStyle | tab-content的容器的自定义样式 | Object | - | {} |
| fullFlex | nav-item是否平分父级宽度 | Boolean | - | false |

### swipe-tab-container event

| 事件名 | 说明 | 回调参数 |
| ---- | --- | ----- |
| tabNavClick | 单击 nav-item | { event: Event, index: Number, tabNav: Object } |
| tabNavdblClick | 双击 nav-item | { event: Event, index: Number, tabNav: Object } |

### swipe-tab-container slots

```
for (tabNav of tabNavList) { /* ... */ }
```

| slot名 | 说明 |
| ---- | --- |
| `swipe-tab-nav-${tabNav.key}` | 遍历 tabNavList 中的每一个对象，利用key创建slot |
| `swipe-tab-content-${tabNav.key}` | 遍历 tabNavList 中的每一个对象，利用key创建slot |

### swipe-tab-nav Attributes

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| ---- | --- | --- | ---- | ----- |
| owner | 当前组件的拥有者，可以设置为所在的路由页面或者父组件 | String | - | '' |
| tabLabel | 显示的内容 | String | - | '' |

### swipe-tab-nav slots

| name | 说明 |
| ---- | --- |
| default | 替换默认的文本 |

## Preview Demo

```bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run demo
```

## Build Setup

``` bash
# install dependencies
npm install

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

## 使用方法

> 具体请查看 `/demo/App.vue`
