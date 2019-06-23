const { app, BrowserWindow, Menu, dialog } = require('electron');
const fs = require('fs');

// window 객체는 전역 변수로 유지. 이렇게 하지 않으면, 
// 자바스크립트 객체가 가비지 콜렉트될 때 자동으로 창이 닫힐 것입니다.
let win

function createWindow () {
  // 브라우저 창을 생성합니다.
  win = new BrowserWindow({ width: 800, height: 600 })
  win.setResizable(false);
  
  var menu = Menu.buildFromTemplate([
    {
      label: 'Files',
      accelerator: 'CommandOrControl+o',
      click: function () {
        openFileDialog()
      }
    },
    {
      label: 'Info',
      click: function() {
        dialog.showMessageBox(win,{type: "none", title: "Information",
      message: "개발자 깃허브:https://github.com/lchbest10?tab=repositories로 문의바랍니다."}
        ,(response,checkboxChecked) => {
        console.log(response)
      })
      }
    }
  ])
  Menu.setApplicationMenu(menu)
  
  // 앱의 index.html 파일을 로드합니다.
  win.loadFile('index.html')

  // 개발자 도구를 엽니다.
  win.webContents.openDevTools()

  // 창이 닫힐 때 발생합니다
  win.on('closed', () => {
    // window 객체에 대한 참조해제. 여러 개의 창을 지원하는 앱이라면 
    // 창을 배열에 저장할 수 있습니다. 이곳은 관련 요소를 삭제하기에 좋은 장소입니다.
    win = null
  })
}

// 이 메서드는 Electron이 초기화를 마치고 
// 브라우저 창을 생성할 준비가 되었을 때  호출될 것입니다.
// 어떤 API는 이 이벤트가 나타난 이후에만 사용할 수 있습니다.
app.on('ready', createWindow)

// 모든 창이 닫혔을 때 종료.
app.on('window-all-closed', () => {
  // macOS에서는 사용자가 명확하게 Cmd + Q를 누르기 전까지는
  // 애플리케이션이나 메뉴 바가 활성화된 상태로 머물러 있는 것이 일반적입니다.
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // macOS에서는 dock 아이콘이 클릭되고 다른 윈도우가 열려있지 않았다면
  // 앱에서 새로운 창을 다시 여는 것이 일반적입니다.
  if (win === null) {
    createWindow()
  }
})

function openFileDialog() {
  dialog.showOpenDialog(win, {
    properties: ['openFile'],
    filters: [{
      name: 'Audio', extensions:['mp3','ogg','m4a','wav']
    }]
  } , filepath  => {

    if (filepath) {
      // fs.writeFile('path.txt', filepath, function (err, data) {
      //   if (err) console.log(err);
      // });
      //scanFile(filepath)
      var music;
      fs.readFile(String(filepath), (err,data) => {
        if(err) alert(err);
        music = data;
        win.webContents.send('selected-filepath',filepath);
        win.webContents.send('selected-file',music);
      });
    }

  }) 
}
//the path argument must be of type string fs.readfile
function scanFile(filepath) {
  if(!filepath || filepath[0] == 'undefined') return;
  console.log(filepath[0])
  fs.readFile(filepath[0],"utf8", (err,data) => {
    if(err) console.log(err);
    var arr = [];
    if (data.substr(-4) === '.mp3' || data.substr(-4) === '.m4a'
    || data.substr(-5) === '.webm' || data.substr(-4) === '.wav'
    || data.substr(-4) === '.aac' || data.substr(-4) === '.ogg'
    || data.substr(-5) === '.opus') {
    arr.push(data);
  }
  var objToSend = {};
    objToSend.files = arr;
    objToSend.path = filepath;

    win.webContents.send('selected-file', objToSend)
  })  
}           