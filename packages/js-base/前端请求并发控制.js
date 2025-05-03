function multiRequest(urls, count) {
  let curIndex = 0; // 当前处理的 URL 索引
  let curQueueLength = 0; // 当前正在执行的请求数
  const result = []; // 存储所有请求的结果

  return new Promise((resolve) => {
    // 递归函数，用于发起请求
    function run() {
      if (curIndex >= urls.length && curQueueLength === 0) {
        // 所有请求已完成
        resolve(result);
        return;
      }

      while (curQueueLength < count && curIndex < urls.length) {
        const currentIndex = curIndex; // 保存当前索引
        curIndex++;
        curQueueLength++;

        // 模拟请求
        const p = new Promise((resolve) => {
          const delay = Math.random() * 500 + 500; // 随机延迟 500ms-1000ms
          setTimeout(() => {
            resolve(Math.floor(Math.random() * 100) + 1); // 随机结果 1-100
          }, delay);
        });

        p.then((res) => {
          result[currentIndex] = res; // 将结果存入对应位置
        })
          .catch((err) => {
            result[currentIndex] = err; // 将错误存入对应位置
          })
          .finally(() => {
            curQueueLength--; // 请求完成后减少并发数
            run(); // 继续发起新的请求
          });
      }
    }

    run(); // 启动
  });
}

// 示例用法
const urls = ["url1", "url2", "url3", "url4", "url5"];
multiRequest(urls, 2).then((results) => {
  console.log("All requests completed:", results);
});