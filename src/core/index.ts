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
    async buildEnd() {
      const pluginOptions = await normalizeOptions(options)
      const { dirs, output, ts } = pluginOptions
      
      // 清除输出目录
      clearAndCreateAutoDir(output)
      // 添加gitignore排除
      gitignoreAddAutoImport(output)
      if (!dirs.length) return
      console.log('123');
      
      console.log('ts', ts);

      for (const dir of dirs) {
        // 创建merge
        const merge: Merge = {
          inputDir: dir.input,
          outputFile: path.join(output, `${dir.fileName}.${ts ? 'ts' : 'js'}`),
          dependencies: [],
          exports: [],
        }
        // 推入列表
        mergeList.push(merge)
        // 判断输入目录是否存在
        if (!fs.existsSync(merge.inputDir)) continue
        // 读取目录下的文件
        const readDirFiles = fs.readdirSync(merge.inputDir)
        // 判断是否有文件
        if (!readDirFiles.length) continue
        readDirFiles.forEach(async (fileId) => {
          // 文件名
          const fileName = fileId.split('.')[0]
          // 源文件路径
          const sourceFilePath = path.join(merge.inputDir, fileName)
          // 推入依赖数组
          merge.dependencies.push(sourceFilePath)
          // 获取旧的导出字符串
          const hasOutputFile = await fsExtra.existsSync(merge.outputFile)
          if (hasOutputFile) {
            const oldExportStr = fsp.readFile(merge.outputFile)
          } 
          mergeInsertExport(merge, fileName, sourceFilePath)
          const newExportStr = merge.exports.join('\n')
          console.log(newExportStr);
          
        })
        // fs.writeFileSync(merge.outputFile, merge.exports.join('\n'))
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