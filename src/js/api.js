const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('windroid', {
    system: {
        getConfiguration: async (key) => ipcRenderer.invoke('system:gconf', key),
        setConfiguration: async (key, value) => ipcRenderer.invoke('system:sconf', key, value),
    },
    user: {
        registerScene: async () => ipcRenderer.invoke('user:rgscene'),
        loginScene: async () => ipcRenderer.invoke('user:lgscene'),

        getName: async () => await ipcRenderer.invoke('user:gname'),
        getPass: async () => await ipcRenderer.invoke('user:gpass'),

        setName: async (arg) => ipcRenderer.invoke('user:sname', arg),
        setPass: async (arg) => ipcRenderer.invoke('user:spass', arg),
        
        register: async (arg0, arg1) => ipcRenderer.invoke('user:reg', arg0, arg1),
        login: async (arg0, arg1) => ipcRenderer.invoke('user:log', arg0, arg1)
    }
})