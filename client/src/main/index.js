'use strict'

import {app, BrowserWindow, ipcMain} from 'electron'
import {autoUpdater} from 'electron-updater'

// const uploadUrl = 'http://127.0.0.1:8360/download/'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 400,
    width: 600,
    resizable: false
  })

  mainWindow.loadURL(winURL)
  mainWindow.setMenu(null)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
  updateHandle()
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

function updateHandle () {
  // autoUpdater.setFeedURL(uploadUrl)
  autoUpdater.autoDownload = false
  // autoUpdater.requestHeaders = ['key:value']
  // autoUpdater.autoInstallOnAppQuit = false
  // 错误
  autoUpdater.on('error', (...args) => {
    sendUpdateMessage({type: 'error', data: args})
  })
  // 检查中
  autoUpdater.on('checking-for-update', (...args) => {
    sendUpdateMessage({type: 'checking-for-update', data: args})
  })
  // 存在新版本
  autoUpdater.on('update-available', (...args) => {
    sendUpdateMessage({type: 'update-available', data: args})
  })
  // 没有新版本
  autoUpdater.on('update-not-available', (...args) => {
    sendUpdateMessage({type: 'update-not-available', data: args})
  })
  // 下载进度
  autoUpdater.on('download-progress', (...args) => {
    sendUpdateMessage({type: 'download-progress', data: args})
  })
  // 下载完成
  autoUpdater.on('update-downloaded', (...args) => {
    sendUpdateMessage({type: 'update-downloaded', data: args})
  })
}

ipcMain.on('message', (e, arg = {type: ''}) => {
  switch (arg.type) {
    case 'checkForUpdates':
      autoUpdater.checkForUpdates()
      break
    case 'checkForUpdatesAndNotify':
      autoUpdater.checkForUpdatesAndNotify()
      break
    case 'downloadUpdate':
      autoUpdater.downloadUpdate()
      break
    case 'quitAndInstall':
      autoUpdater.quitAndInstall(true, true)
      break
  }
})

function sendUpdateMessage (arg) {
  mainWindow.webContents.send('message', arg)
}
