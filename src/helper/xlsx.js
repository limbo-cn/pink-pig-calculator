const XLSX = require('xlsx')

// 将行,列转换
export function transformSheets(sheets) {
    const content = []
    const content1 = []
    const tmplist = []
    for (const key in sheets) {
        // 读出来的workbook数据很难读,转换为json格式,参考https://github.com/SheetJS/js-xlsx#utility-functions
        tmplist.push(XLSX.utils.sheet_to_json(sheets[key]).length)
        content1.push(XLSX.utils.sheet_to_json(sheets[key]))
    }
    const maxLength = Math.max.apply(Math, tmplist)
    // 进行行列转换
    for (const y in [...Array(maxLength)]) {
        content.push([])
        for (const x in [...Array(tmplist.length)]) {
            try {
                for (const z in content1[x][y]) {
                    content[y].push(content1[x][y][z])
                }
            } catch (error) {
                content[y].push(' ')
            }
        }
    }
    content.unshift([])
    for (const key in sheets) {
        content[0].push(key)
    }
    return content1[0]
}
