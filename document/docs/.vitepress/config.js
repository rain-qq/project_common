export default {
  title: 'My VitePress Blog', // 哈哈哈
  description: 'A blog within a monorepo setup',
  base: '/project-common/',
  outDir: '../public',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Posts', link: '/posts/first-post' }
    ],
    sidebar: [
      {
        text: 'Blog Posts',
        items: [
          { text: 'First Post', link: '/posts/first-post' }
        ]
      }
    ]
  }
}
