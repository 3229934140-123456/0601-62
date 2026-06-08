export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/works/index',
    'pages/orders/index',
    'pages/mine/index',
    'pages/editor/index',
    'pages/material/index',
    'pages/guests/index',
    'pages/preview/index',
    'pages/wishes/index',
    'pages/statistics/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: '喜帖设计',
    navigationBarTextStyle: 'black',
    backgroundColor: '#fff5f7',
  },
  tabBar: {
    color: '#86909c',
    selectedColor: '#ff6b8b',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页',
      },
      {
        pagePath: 'pages/works/index',
        text: '作品',
      },
      {
        pagePath: 'pages/orders/index',
        text: '订单',
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的',
      },
    ],
  },
})
