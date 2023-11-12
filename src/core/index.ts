import { createUnplugin } from 'unplugin'
import { Merge, Options } from '../types'
import { mergeInsertExport, clearAndCreateAutoDir, gitignoreAddAutoImport, normalizeOptions, getExportString } from './helper'
import path from 'path'
import fs from 'fs'
import fsp from 'fs/promises'
import fsExtra from 'fs-extra'

const mergeList: Merge[] = []

export let mergeOutputDir: string = ''

export default createUnplugin<Options>((options) => {
  return {
    name: 'export-merge',
    buildStart() {
      const pluginOptions = normalizeOptions(options)
      const { dirs, output, ts } = pluginOptions

      // 清除输出目录
      clearAndCreateAutoDir(output)
      // 添加gitignore排除
      gitignoreAddAutoImport(output)
      if (!dirs.length) return

      for (const dir of dirs) {
        // 创建merge
        const merge: Merge = {
          inputDir: dir.input,
          outputFile: path.join(output, `${dir.fileName}.${ts ? 'ts' : 'js'}`),
          dependencies: [],
          exports: [],
          exportSuffix: dir.suffix
        }
        // 推入列表
        mergeList.push(merge)
        // 判断输入目录是否存在
        if (!fs.existsSync(merge.inputDir)) continue
        // 读取目录下的文件
        const readDirFiles = fs.readdirSync(merge.inputDir)
        // 判断是否有文件，并获取导出字符串
        if (!readDirFiles.length) continue
        readDirFiles.forEach((fileId) => mergeInsertExport(merge, fileId))
        // 新的聚合文件内容
        const mergeFileContent = merge.exports.join('\n')

        try {
          fs.statSync(merge.outputFile)
          const oldMergeFileContent = fs.readFileSync(merge.outputFile, 'utf-8')
          if (oldMergeFileContent === mergeFileContent) continue
          fsp.writeFile(merge.outputFile, mergeFileContent)
        } catch (error) {
          fsp.writeFile(merge.outputFile, mergeFileContent)
        }
      }
    }
    // handleHotUpdate({ file }: { file: string }) {
    //   file = path.normalize(file)

    //   for (const merge of mergeList) {
    //     // 路径切片
    //     const fileSplit = path.normalize(file).split(path.sep)
    //     // 变动的文件名
    //     const fileName = fileSplit.pop()?.split('.')[0] as string
    //     // 变动的目录路径
    //     const fileDir = fileSplit.join(path.sep)
    //     // 判断变动的目录是否相同
    //     if (fileDir !== merge.inputDir) continue
    //     // 判断是否是已经存在的目录，存在就不处理
    //     const hasFile = merge.dependencies.some((item) => item === file)
    //     if (hasFile) continue
    //     // 不存在就写入
    //     mergeInsertExport(merge, fileName)
    //     fs.writeFileSync(merge.outputFile, merge.exports.join('\n'))
    //   }
    // }
  }
})