const path = require('path');
const os = require('os');
const fs = require('fs');
const resizeImg = require('resize-img');
const {app, BrowserWindow, Menu, ipcMain, shell} = require('electron');

const isDev = process.env.NODE_ENV !== 'production';
const isMac = process.platform === 'darwin';

let mainWindow;

function createMainWindow(){
    mainWindow = new BrowserWindow ({
        title: 'evanskaps Image Resizer',
        width: isDev? 1000 : 500,
        height: 1280,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js')
        }
    })
    //Devtools open if in development env
    if (isDev){
        mainWindow.webContents.openDevTools();
    }
    mainWindow.loadFile(path.join(__dirname, './renderer/index.html'));
}

function createAboutWindow(){
    const aboutWindow = new BrowserWindow({
        title: 'About evanskaps',
        width: isDev?1000: 300,
        height: 500,
    })
    if(isDev){
        aboutWindow.webContents.openDevTools();
    }
    aboutWindow.loadFile(path.join(__dirname, './renderer/about.html'))
}



//load app
app.whenReady().then(()=>{
    createMainWindow();
    //menu setup
    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);

    //remove mainWindow from memory on close
    mainWindow.on('closed', ()=>(mainWindow=null));

    app.on('activate',()=>{
        if (BrowserWindow.getAllWindows.length === 0){
            createMainWindow();
        }
    })    
});

//menu template
const menu = [
    ...(isMac 
        ? [
            {
                label: app.name,
                submenu: [
                    {
                        label: 'About',
                        click: createAboutWindow,
                    },
                ],
             }
          ] 
        : []),
    {
        role:'fileMenu',
    },
    ...(!isMac ? [{
        label: 'Help',
        submenu: [{
            label:'About',
            click: createAboutWindow,
        }]
    }] :[] )
];

app.on('window-all-closed', ()=>{
    if(!isMac){
        app.quit();
    }
})


//repsonding to ipcRenderer
ipcMain.on('image:resize', (e,options)=>{
    options.dest = path.join(os.homedir(), 'OneDrive', 'Desktop', 'imageresizer');
    resizeImage(options);
});

async function resizeImage({imgPath, width, height, dest}){
    try{
        const newPath = await resizeImg(fs.readFileSync(imgPath), {
            width: +width,
            height: +height
        })
        // create the new file name
        const filename = path.basename(imgPath);
        //create dest folder if not exist
        if (!fs.existsSync(dest)){
            fs.mkdirSync(dest);
        }
        //add file to dest 
        fs.writeFileSync(path.join(dest,filename), newPath);
        //send msg to renderer (frontend)
        mainWindow.webContents.send('done');
        //open dest folder
        shell.openPath(dest);

    }catch(err){
        console.log(err);
    }
}