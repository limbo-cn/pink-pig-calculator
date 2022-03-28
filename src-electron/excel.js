import { ipcMain, dialog } from 'electron'
import fs from 'fs'

ipcMain.on('importExcel', (event) => {
    dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            { name: 'Excel', extensions: ['xlsx', 'xls'] }
        ]
    }).then(data => {
        if (data.filePaths === 0) {
            dialog.showErrorBox('错误', '无法加载文件')
            return
        }
        fs.readFile(data.filePaths[0], (err, data) => {
            if (err) {
                dialog.showErrorBox('错误', '无法加载文件')
                return
            }
            event.sender.send('importExcel-reply', data)
        })
    })
})
