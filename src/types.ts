export interface Options {
  // 聚合的目录
  dirs?: Array<string | MergeDirItem>;
  // 聚合的输出目录
  output?: string;
  // 语言类型
  ts?: boolean;
}

export interface UseOptions extends Required<Options> {
  dirs: Required<MergeDirItem>[];
  ts: boolean;
}

export interface MergeDirItem {
  input: string;
  suffix?: string;
  fileName?: string;
}

export interface Merge {
  inputDir: string,
  outputFile: string,
  // 依赖的文件路径
  dependencies: string[],
  // 导出字符串
  exports: string[],
  // 写入的内容
  context: string
}