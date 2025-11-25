import chalk from "chalk";

const timestamp = () => chalk.cyan(`[${new Date().toLocaleTimeString()}]`);

interface Logger {
  info: (message: string, ...args: unknown[]) => void;
  warn: (message: string, ...args: unknown[]) => void;
  success: (message: string, ...args: unknown[]) => void;
  error: (message: string, ...args: unknown[]) => void;
  fatal: (message: string, ...args: unknown[]) => void;
}

export const logger: Logger = {
  info: (message, ...args) => {
    console.log(`${timestamp()} ${chalk.blue("ℹ")} ${message}`, ...args);
  },
  warn: (message, ...args) => {
    console.log(`${timestamp()} ${chalk.yellow("⚠")} ${message}`, ...args);
  },
  success: (message, ...args) => {
    console.log(`${timestamp()} ${chalk.green("✅")} ${message}`, ...args);
  },
  error: (message, ...args) => {
    console.log(`${timestamp()} ${chalk.red("❌")} ${message}`, ...args);
  },
  fatal: (message, ...args) => {
    console.log(`${timestamp()} ${chalk.magenta("💀")} ${message}`, ...args);
  },
};
