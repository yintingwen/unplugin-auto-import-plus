import fsp from 'fs/promises'
import fs from 'fs'
import fsExtra from 'fs-extra'
import path from 'path'
import { Merge, MergeDirItem, Options, UseOptions } from '../types'
import { async } from 'fast-glob'

export let plusOptions: UseOptions = {} as UseOptions

export function mergeInsertExport(mergeInfo: Merge, sourceFileName: string, sourceFilePath: string) {
  // 目标目录的完整路径
  const targetFilePath = plusOptions.output
  // 先推入依赖
  mergeInfo.dependencies.push(sourceFilePath)
  // 进行切分为数组形式
  const sourceFilePathSplit = sourceFilePath.split(path.sep)
  const targetFilePathSplit = targetFilePath.split(path.sep)
  // 找出相同部分
  const diffIndex = sourceFilePathSplit.findIndex((item, index) => targetFilePathSplit[index] !== item)
  // 去除相同部分
  sourceFilePathSplit.splice(0, diffIndex)
  targetFilePathSplit.splice(0, diffIndex)
  // 拼接返回
  targetFilePathSplit.forEach(item => sourceFilePathSplit.unshift(`..`))
  const exportName = normalizeFileName(sourceFileName.split('.')[0] + '-' + mergeInfo.suffix)
  const exportStr = `export * as  ${exportName} from '${sourceFilePathSplit.join('/')}'`
  mergeInfo.exports.push(exportStr)
}

export function getExportString (mergeInfo: Merge, sourceFilePath: string, fileName: string): void {  
  const targetFilePath = plusOptions.output
  // 进行切分为数组形式
  const sourceFilePathSplit = sourceFilePath.split(path.sep)
  const targetFilePathSplit = targetFilePath.split(path.sep)
  // 找出相同部分
  const diffIndex = sourceFilePathSplit.findIndex((item, index) => targetFilePathSplit[index] !== item)
  // 去除相同部分
  sourceFilePathSplit.splice(0, diffIndex)
  targetFilePathSplit.splice(0, diffIndex)
  // 拼接返回
  targetFilePathSplit.forEach(item => sourceFilePathSplit.unshift(`..`))
  const exportName = normalizeFileName(fileName.split('.')[0] + '-' + 'js')
  const exportStr = `export * as  ${exportName} from '${sourceFilePathSplit.join('/')}'`
  mergeInfo.exports.push(exportStr)
}

export function clearAndCreateAutoDir(dirPath: string) {
  if (fs.existsSync(dirPath)) {
    fsExtra.emptyDirSync(dirPath)
  } else {
    fsExtra.mkdirSync(dirPath)
  }
}

/**
 * .gitignore内容追加
 * @param mergeDir 聚合文件存放的目录
 */
export async function gitignoreAddAutoImport(mergeDir: string) {
  const gitignorePath = path.join(process.cwd(), '.gitignore')
  const dirName = mergeDir.split(path.sep).pop() as string

  try {
    if (fs.existsSync(gitignorePath)) {
      const gitignoreContent = await fsp.readFile(gitignorePath, 'utf-8')
      const gitignoreContentLine = gitignoreContent.split('\n')
      if (gitignoreContentLine.includes(dirName)) return
      fsp.appendFile(gitignorePath, gitignoreContentLine.length ? `\n${dirName}` : dirName)
    } else {
      fsp.writeFile(gitignorePath, dirName)
    }
  } catch (error) {
    console.log(error);
  }
}

/**
 * 格式化插件选项
 * @param options plus的选项
 * @returns
 */
export async function normalizeOptions(options: Options): Promise<UseOptions> {
  if (!options.dirs) options.dirs = []
  plusOptions.dirs = options.dirs.map(normalizeMergeDirItem)

  if (!options.output) options.output = 'src\\export-merge'
  plusOptions.output = path.join(process.cwd(), path.normalize(options.output))
  console.log('options.ts', options.ts);
  
  if (!options.ts) {
    const files = await fsp.readdir(process.cwd())
    options.ts = files.some((item) => item.split('.')[1] === 'ts' )
  }
  plusOptions.ts = options.ts
  
  return plusOptions
}

export function normalizeFileName(fileName: string) {
  return fileName
    .split('-')
    .map((item, index) => {
      if (index === 0) return item
      return item.slice(0, 1).toUpperCase() + item.slice(1)
    })
    .join('')
}

export function normalizeMergeDirItem(dir: string | MergeDirItem): Required<MergeDirItem> {
  if (typeof dir === 'string') dir = { input: dir }
  const dirName = path.normalize(dir.input).split(path.sep).pop() as string

  dir.input = path.join(process.cwd(), dir.input)
  dir.fileName = dir.fileName || dirName
  dir.suffix =  dir.suffix || dirName

  return dir as Required<MergeDirItem>
}