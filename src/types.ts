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
  dependencies: string[],
  exports: string[],
}