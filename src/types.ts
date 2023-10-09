export interface Options {
  // 聚合的目录
  dirs?: Array<string | MergeDirItem>;
  // 聚合的输出目录
  output?: string;
}

export interface UseOptions extends Required<Options> {
  dirs: Required<MergeDirItem>[];
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
  // 导出后缀
  exportSuffix?: string;
}