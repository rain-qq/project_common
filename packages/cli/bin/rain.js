#!/usr/bin/env node

const inquirer = require('inquirer');
const { execSync } = require('child_process');
const path = require('path');

// 定义 init 命令的逻辑
const runInit = async () => {
  // 使用 inquirer 询问用户是否需要生成 ESLint 和 Prettier 配置
  const answers = await inquirer.default.prompt([
    {
      type: 'confirm',
      name: 'eslint',
      message: 'Do you want to generate ESLint configuration?',
      default: true
    },
    {
      type: 'confirm',
      name: 'prettier',
      message: 'Do you want to generate Prettier configuration?',
      default: true
    }
  ]);

  // 获取 setup.js 的绝对路径
  const setupPath = path.join(__dirname, '..', 'setup.js');

  // 根据用户的回答执行相应的操作
  if (answers.eslint) {
    console.log('Generating ESLint configuration...');
    execSync(`node ${setupPath} --eslint`, { stdio: 'inherit' });
  }

  if (answers.prettier) {
    console.log('Generating Prettier configuration...');
    execSync(`node ${setupPath} --prettier`, { stdio: 'inherit' });
  }
};

// 检查命令行传递的参数
const args = process.argv.slice(2);
const command = args[0];

if (command === 'init') {
  runInit();
} else {
  console.log('Usage: rain init');
}
