import { createUnplugin } from 'unplugin'
import { Merge, Options, UseOptions } from '../types'
import { mergeInsertExport, clearAndCreateAutoDir, gitignoreAddAutoImport, normalizeOptions } from './helper'
import path from 'path'
import fs from 'fs'

const mergeList: Merge[] = []

export let mergeOutputDir: string = ''
export let useOptions: UseOptions = {} as UseOptions

export default createUnplugin<Options>((options) => {
  useOptions = normalizeOptions(options)
  const {mergeDirs, mergeOutput} = useOptions

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
          inputDir: path.join(process.cwd(), dir),
          outputFile: path.join(mergeOutput, `${dir}.js`),
          dependencies: [],
          exports: [],
        }
        mergeList.push(merge)
        if (!fs.existsSync(merge.inputDir)) continue

        const readDirFiles = fs.readdirSync(merge.inputDir)
        if (!readDirFiles.length) continue
        
        readDirFiles.forEach((fileName) => mergeInsertExport(merge, dir, fileName))
        fs.writeFileSync(merge.outputFile, merge.exports.join('\n'))
      }
    },
    handleHotUpdate({ file }: { file: string }) {
      file = path.normalize(file)
      
      for (const merge of mergeList) {
        const fileSplit = path.normalize(file).split(path.sep)
        const fileName = fileSplit.pop()?.split('.')[0] as string
        const fileDir = fileSplit.join(path.sep)
        const fileDirName = fileSplit.pop() as string
        if (fileDir !== merge.inputDir) continue

        const hasFile = merge.dependencies.some((item) => item === file)
        if (hasFile) continue

        mergeInsertExport(merge, fileDirName, fileName)
        fs.writeFileSync(merge.outputFile, merge.exports.join('\n'))
      }
    }
  }
})