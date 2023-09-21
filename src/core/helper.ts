import fsp from 'fs/promises'
import fs from 'fs'
import fsExtra from 'fs-extra'
import path from 'path'
import { Merge, UseOptions, Options } from '../types'

export function mergeInsertExport(merge: Merge, dir: string, fileName: string) {
  merge.dependencies.push(path.join(merge.inputDir, fileName))
  const exportName = normalizeFileName(fileName.split('.')[0] + '-' + dir)
  const exportStr = `export * as  ${exportName} from '`
  
  merge.exports.push(`export * as  ${exportName} from '../${dir}/${fileName}'`)
}

export function mergeInsertExport1(merge: Merge, sourceDirName: string, sourceFileName: string) {
  const sourceFilePath = path.join(merge.inputDir, sourceFileName)
  const targetFilePath = path.join(process.cwd(), sourceDirName, sourceFileName)

  merge.dependencies.push(sourceFilePath)
  const exportName = normalizeFileName(fileName.split('.')[0] + '-' + dir)
  const exportStr = `export * as  ${exportName} from '`
  
  merge.exports.push(`export * as  ${exportName} from '../${dir}/${fileName}'`)
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
      if (!gitignoreContent) return
      const gitignoreContentLine = gitignoreContent.split('\n')
      if (gitignoreContentLine.includes(dirName)) return
      fs.appendFileSync(gitignorePath, `\n${dirName}`)
    } else {
      fs.writeFile(gitignorePath, dirName, () => {})
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
export function normalizeOptions (options: Options): UseOptions {

  return {
    mergeDirs: options.mergeDirs ? options.mergeDirs.map(path.normalize) : [],
    mergeOutput: options.mergeOutput ? path.normalize(options.mergeOutput) : path.join(process.cwd(), 'src', 'export-merge')
  }
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
