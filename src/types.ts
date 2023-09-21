import { Options as AutoImportOptions } from 'unplugin-auto-import/types'

export interface Options extends AutoImportOptions {
  // 聚合的目录
  mergeDirs?: string[] 
  // 聚合的输出目录
  mergeOutput?: string;
}

export interface UseOptions {
  // 聚合的目录
  mergeDirs: string[] 
  // 聚合的输出目录
  mergeOutput: string;
}


export interface Merge {
  inputDir: string,
  outputFile: string,
  dependencies: string[],
  exports: string[],
}