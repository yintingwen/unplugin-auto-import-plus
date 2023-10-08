export interface Options {
  // 聚合的目录
  mergeDirs?: Array<string | MergeDirItem>;
  // 聚合的输出目录
  mergeOutput?: string;
}

export interface UseOptions extends Required<Options> {
  mergeDirs: Required<MergeDirItem>[];
}

export interface MergeDirItem {
  input: string;
  exportSuffix?: string;
  exportFileName?: string;
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