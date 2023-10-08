import { createUnplugin } from 'unplugin'
import { Merge, Options } from '../types'
import { mergeInsertExport, clearAndCreateAutoDir, gitignoreAddAutoImport, normalizeOptions } from './helper'
import path from 'path'
import fs from 'fs'

const mergeList: Merge[] = []

export let mergeOutputDir: string = ''

export default createUnplugin<Options>((options) => {
  const pluginOptions = normalizeOptions(options)
  const { mergeDirs, mergeOutput } = pluginOptions

  return {
    name: 'export-merge',
    options() {
      // 清除输出目录
      clearAndCreateAutoDir(mergeOutput)
      // 添加gitignore排除
      gitignoreAddAutoImport(mergeOutput)

      if (!mergeDirs.length) return

      for (const dir of mergeDirs) {
        const merge: Merge = {
          inputDir: dir.input,
          outputFile: path.join(mergeOutput, `${dir.exportFileName}.js`),
          dependencies: [],
          exports: [],
          exportSuffix: dir.exportSuffix
        }

        mergeList.push(merge)
        if (!fs.existsSync(merge.inputDir)) continue

        const readDirFiles = fs.readdirSync(merge.inputDir)
        if (!readDirFiles.length) continue

        readDirFiles.forEach((fileName) => mergeInsertExport(merge, fileName))
        fs.writeFileSync(merge.outputFile, merge.exports.join('\n'))
      }
    },
    handleHotUpdate({ file }: { file: string }) {
      file = path.normalize(file)

      for (const merge of mergeList) {
        // 路径切片
        const fileSplit = path.normalize(file).split(path.sep)
        // 变动的文件名
        const fileName = fileSplit.pop()?.split('.')[0] as string
        // 变动的目录路径
        const fileDir = fileSplit.join(path.sep)
        // 判断变动的目录是否相同
        if (fileDir !== merge.inputDir) continue
        // 判断是否是已经存在的目录，存在就不处理
        const hasFile = merge.dependencies.some((item) => item === file)
        if (hasFile) continue
        // 不存在就写入
        mergeInsertExport(merge, fileName)
        fs.writeFileSync(merge.outputFile, merge.exports.join('\n'))
      }
    }
  }
})