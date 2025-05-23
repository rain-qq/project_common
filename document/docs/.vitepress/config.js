export default {
  title: 'My VitePress Blog', // 哈哈哈
  description: 'A blog within a monorepo setup',
  base: '/project_common/',
  outDir: '../public',
  themeConfig: {
    nav: [
      { text: '主页', link: '/' },
      { text: '随笔', link: '/essay/2024.11.md' },
      { text: '算法', link: '/algorithm/longest-increasing-subsequence.md'}
    ],
    sidebar: [
      {
        text: '随笔',
        items: [
          { text: '2024.11', link: '/essay/2024.11.md' },
        ]
      },
      {
        text: '面试',
        items: [
          { text: '面试题', link: '/interview/interview.md' }
        ]
      },
      {
        text: '算法',
        items: [
          { text: '最长递增子序列', link: '/algorithm/longest-increasing-subsequence.md'}
        ]
      },
      {
        text: '前端工程化',
        items: [
          {
            text: '构建工具',
            items: [
              { text: 'webpack', link: '/engineering/webpack.md'}
            ]
          }
        ]
      }
    ]
  }
}
