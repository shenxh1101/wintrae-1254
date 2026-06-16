import { app, BrowserWindow, Menu } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isPackaged = app.isPackaged;
const distPath = path.join(__dirname, '../dist/index.html');

function ensureDist() {
  if (isPackaged) return;
  if (fs.existsSync(distPath)) return;
  console.log('[海岛救助站] 首次运行，正在准备游戏资源...');
  try {
    execSync('npm run build', {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
      shell: true,
    });
    console.log('[海岛救助站] 游戏资源准备完成！');
  } catch (e) {
    console.error('[海岛救助站] 资源准备失败，尝试连接开发服务器...');
  }
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 640,
    title: '海岛救助站',
    backgroundColor: '#87CEEB',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: isPackaged,
    },
    icon: path.join(__dirname, 'icon.png'),
  });

  if (isPackaged || fs.existsSync(distPath)) {
    mainWindow.loadFile(distPath);
  } else {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  const template = [
    {
      label: '游戏',
      submenu: [
        {
          label: '重新开始',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.webContents.reload();
          },
        },
        { type: 'separator' },
        {
          label: '退出',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Alt+F4',
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: '视图',
      submenu: [
        {
          label: '放大',
          accelerator: 'CmdOrCtrl+Plus',
          click: () => {
            const currentZoom = mainWindow.webContents.getZoomLevel();
            mainWindow.webContents.setZoomLevel(currentZoom + 0.5);
          },
        },
        {
          label: '缩小',
          accelerator: 'CmdOrCtrl+-',
          click: () => {
            const currentZoom = mainWindow.webContents.getZoomLevel();
            mainWindow.webContents.setZoomLevel(currentZoom - 0.5);
          },
        },
        {
          label: '重置缩放',
          accelerator: 'CmdOrCtrl+0',
          click: () => {
            mainWindow.webContents.setZoomLevel(0);
          },
        },
        { type: 'separator' },
        {
          label: '全屏',
          accelerator: 'F11',
          click: () => {
            mainWindow.setFullScreen(!mainWindow.isFullScreen());
          },
        },
      ],
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '关于海岛救助站',
          click: () => {
            const aboutWindow = new BrowserWindow({
              width: 400,
              height: 300,
              title: '关于海岛救助站',
              resizable: false,
              minimizable: false,
              maximizable: false,
              parent: mainWindow,
              modal: true,
            });
            aboutWindow.setMenu(null);
            aboutWindow.loadURL(`data:text/html;charset=utf-8,
              <html>
                <head><title>关于海岛救助站</title></head>
                <body style="font-family: sans-serif; text-align: center; padding: 30px; background: linear-gradient(135deg, #87CEEB, #98D8C8);">
                  <h1 style="color: #006064;">🏝️ 海岛救助站</h1>
                  <p style="font-size: 16px; color: #004D40;">版本 ${app.getVersion()}</p>
                  <p style="margin-top: 20px; color: #004D40;">一款面向亲子用户的经营类游戏</p>
                  <p style="color: #004D40;">救助海洋动物，建设最美海岛！</p>
                </body>
              </html>
            `);
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

ensureDist();

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
