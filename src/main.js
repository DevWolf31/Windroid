const {Menu, BrowserWindow, app, ipcMain} = require('electron');

// Internal:
const path = require('path'), fs = require('fs');

// External:
const nconf = require('./node_modules/nconf');

const createWindow = async () => {
    async function sleep(ms){
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    function time(){
        var date = new Date();
        return '' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() + ':' + date.getMilliseconds();
    }


    var fsystem = {};

    fsystem.createFolder = async(path) => {if(!fs.existsSync(path)){fs.mkdirSync(path);}}
    fsystem.createFile = async(path, name, content) => {if(!fs.existsSync(path + '\\' + name)){fs.writeFileSync(path + '\\' + name, content);}}

    // | - Constants:

    var system = {};

    system.path = `\\windroid`;
    system.systemPath = `${system.path}\\system`;
    system.userPath = `${system.path}\\user`;
    system.version = `3.6.0`;

    system.log = (mod, string) => {
        console.log(`[${mod}: ${time()}]: ${string}`);
    };
    system.error = (mod, string) => {
        console.error(`[${mod}: ${time()}]: ${string}`);
    };
    system.warn = (mod, string) => {
        console.warn(`[${mod}: ${time()}]: ${string}`);
    };

    await fsystem.createFolder(system.systemPath);
    await fsystem.createFolder(system.userPath);
    await fsystem.createFile(system.systemPath, 'configuration.json', '{}');

    const appWindow = new BrowserWindow({
        x: 0,
        y: 0,
        minWidth: 1000,
        minHeight: 820,
        maxWidth: 1820,
        maxHeight: 820,
        width: 1820,
        height: 820,
        maximizable: false,
        webPreferences: {
            preload: path.join(__dirname,  'js\\api.js')
        }
    });

    // Menu.setApplicationMenu(null);

    // Application Code:
    await nconf.file(system.systemPath + '\\configuration.json');
    await nconf.load();

    system.log(`System`, `Windroid v${system.version}`);
    
    // | - Api:
    // |   | - System:
    ipcMain.handle('system:gconf', async (event, key) => {
        return system.getConfiguration(key);
    });
    ipcMain.handle('system:sconf', async (event, key, value) => {
        system.setConfiguration(key, value);
    });
    // |   | - User:
    ipcMain.handle('user:rgscene', async () => {
        appWindow.loadFile(path.join(__dirname, 'html\\register-user-scene.html'));
    });
    ipcMain.handle('user:lgscene', async () => {
        if(nconf.get('user:name') && nconf.get("user:password")){
            appWindow.loadFile(path.join(__dirname, 'html\\login-protected-user-scene.html'));
        } else {
            
        }
    });
    ipcMain.handle('user:gname', async () => {
        return nconf.get('user:name');
    });
    ipcMain.handle('user:gpass', async () => {
        return nconf.get('user:password');
    });
    ipcMain.handle('user:sname', async (e, ...arg) => {
        await nconf.set('user:name', arg[0]);
    });
    ipcMain.handle('user:spass', async (e, ...arg) => {
        await nconf.set('user:password', arg[0]);
    });
    ipcMain.handle('user:reg', async (e, ...arg) => {
        system.log(`User`, `User created.`);
        system.log(`User`, `Name: \'${arg[0]}\'.`);
        system.log(`User`, `Password: \'${arg[1]}\.`);

        await nconf.set('user:name', arg[0]);
        await nconf.set('user:password', arg[1]);
        await nconf.save();
    });
    ipcMain.handle('user:log', async (e, ...arg) => {

    });

    // | - User Interface:
    // |   | - Splash Screen:

    appWindow.loadFile(path.join(__dirname, 'html\\splash-scene.html'));
    await sleep(3.5 * 1000);

    // |   | - No Registered Screen (Conditional):
    if(!nconf.get('user:name')){
        appWindow.loadFile(path.join(__dirname, 'html\\user-unregistered-scene.html'));
    }
    // |   | - Login Protected User Screen (Conditional):
    if(nconf.get('user:name') && nconf.get("user:password")){
        appWindow.loadFile(path.join(__dirname, 'html\\login-protected-user-scene.html'));
    }
}
app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if(BrowserWindow.getAllWindows().length === 0){
            createWindow()
        }
    })
})
app.on('window-all-clossed', () => {
    app.quit()
})