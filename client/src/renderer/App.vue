<template>
  <div id="app">
    当前版本：{{version}}
    <button @click="checkForUpdates">检查更新</button>
    <button @click="toggleDevTools">打开/关闭开发者工具</button>

    <div class="update-box" v-if="updateStep!==-2">
      <div class="inner-box">
        <div @click="closeUpdateBox" class="close-btn">x</div>
        <div class="update-msg">{{updateMsg[updateStep+1]}}</div>
        <div class="progress-bar" v-if="updateStep===3">
          <div class="progress-text">{{progress+'%'}}</div>
          <div class="progress" :style="{width:progress+'%'}"></div>
        </div>
        <div class="version" v-if="updateStep===1">V{{newVersion}}</div>
        <div class="btn-box">
          <button @click="downloadUpdate" v-if="updateStep === 1">下载更新</button>
          <button @click="rebootNow" v-if="updateStep === 4">立即重启</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
  export default {
    name: 'landing-page',
    data () {
      return {
        updateMsg: ['错误', '检查更新中', '发现新版本，是否下载？', '恭喜，您的软件已是最新版本', '软件正在下载中...', '更新下载完成，下次启动后安装生效'],
        updateStep: -2,
        newVersion: '',
        progress: 0,
        downloadProgress: 0,
        showConfirmUpdate: false
      }
    },
    computed: {
      version () {
        return this.$electron.remote.app.getVersion()
      }
    },
    mounted () {
      this.$electron.ipcRenderer.removeAllListeners('message')
      this.$electron.ipcRenderer.on('message', (ev, arg = {type: ''}) => {
        console.log(arg)
        switch (arg.type) {
          case 'error':
            this.updateStep = -1
            break
          case 'checking-for-update':
            this.updateStep = 0
            break
          case 'update-available':
            this.updateStep = 1
            this.newVersion = arg.data[0].version
            break
          case 'update-not-available':
            this.updateStep = 2
            break
          case 'download-progress':
            this.updateStep = 3
            break
          case 'update-downloaded':
            this.updateStep = 4
            break
        }
      })
    },
    methods: {
      sendMessage (arg) {
        this.$electron.ipcRenderer.send('message', arg)
      },
      checkForUpdates () {
        this.sendMessage({
          type: 'checkForUpdates'
          // type: 'checkForUpdatesAndNotify'
        })
      },
      toggleDevTools () {
        this.$electron.remote.getCurrentWindow().webContents.toggleDevTools()
      },
      rebootNow () {
        this.sendMessage({type: 'quitAndInstall'})
      },
      closeUpdateBox () {
        this.updateStep = -2
      },
      downloadUpdate () {
        this.sendMessage({type: 'downloadUpdate'})
      }
    }
  }
</script>

<style lang="scss">

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  #app {
    background: radial-gradient(
        ellipse at top left,
        rgba(255, 255, 255, 1) 40%,
        rgba(229, 229, 229, .9) 100%
    );
    height: 100vh;
    width: 100vw;

    .update-box {
      position: fixed;
      top: 0;
      left: 0;
      background-color: rgba(0, 0, 0, 0.2);
      height: 100%;
      width: 100%;

      .inner-box {
        height: 75%;
        width: 75%;
        background-color: white;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        margin: auto;

        .close-btn {
          position: absolute;
          top: 0;
          right: 0;
          text-align: center;
          width: 30px;
          height: 30px;
          line-height: 30px;
          cursor: default;
          user-select: none;
          font-size: 24px;
          font-family: Consolas;

          &:hover {
            background-color: red;
            color: white;
          }
        }

        .update-msg {
          position: absolute;
          text-align: center;
          font-size: 24px;
          top: 40px;
          width: 100%;
        }

        .progress-bar {
          height: 30px;
          position: absolute;
          top: 120px;
          left: 0;
          right: 0;
          width: 80%;
          margin: 0 auto;
          border-radius: 15px;
          overflow: hidden;
          border: 1px solid #ccc;

          .progress-text {
            position: absolute;
            width: 100%;
            text-align: center;
            line-height: 30px;
          }

          .progress {
            height: 100%;
            background-color: #c3d9ff;
          }
        }

        .version {
          position: absolute;
          top: 120px;
          font-size: 30px;
          text-align: center;
          width: 100%;
        }

        .btn-box {
          text-align: center;
          position: absolute;
          width: 100%;
          bottom: 40px;

          button {
            font-size: 16px;
            padding: 3px 20px;
            border: 1px solid #ccc;
            outline: none;
            border-radius: 3px;
            margin-left: 20px;

            &:hover {
              background-color: #c3d9ff;
            }

            &:nth-child(1) {
              margin-left: 0;
            }
          }
        }
      }
    }

  }

</style>
