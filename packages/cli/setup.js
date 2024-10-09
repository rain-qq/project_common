const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 私有库的名称，使用 Verdaccio 私有 npm 仓库的包名
const eslintConfig = '@rain/eslint-config';
const prettierConfig = '@rain/prettier-config';

// 确保你切换到项目根目录
const rootDir = process.cwd();

// 检查包管理工具是否安装
const hasPnpm = () => {
  try {
    execSync('pnpm -v', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
};

// 安装依赖
const installDependencies = () => {
  console.log('Installing ESLint and Prettier configs...');

  const packageManager = hasPnpm() ? 'pnpm' : 'npm';

  execSync(`${packageManager} install ${eslintConfig} ${prettierConfig} --save-dev`, { stdio: 'inherit' });

  console.log('Dependencies installed successfully.');
};

// 生成 ESLint 配置文件
const createEslintConfig = () => {
  const eslintConfigContent = `
import eslintConfig from '${eslintConfig}';
export default eslintConfig;
  `;

  const eslintConfigPath = path.join(rootDir, 'eslint.config.mjs');
  fs.writeFileSync(eslintConfigPath, eslintConfigContent.trim());

  console.log(`ESLint configuration file generated at ${eslintConfigPath}`);
};

// 生成 Prettier 配置文件 (.prettierrc.js)
const createPrettierConfig = () => {
  const prettierConfigContent = `
module.exports = {
  ...require('${prettierConfig}')
};
  `;

  const prettierConfigPath = path.join(rootDir, '.prettierrc.js');
  fs.writeFileSync(prettierConfigPath, prettierConfigContent.trim());

  console.log(`Prettier configuration file generated at ${prettierConfigPath}`);
};

// 根据命令行参数执行相应的逻辑
const setup = () => {
  const args = process.argv.slice(2);

  if (args.includes('--eslint')) {
    installDependencies();
    createEslintConfig();
  }

  if (args.includes('--prettier')) {
    installDependencies();
    createPrettierConfig();
  }
};

setup();
