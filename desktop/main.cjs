const {app,BrowserWindow,shell,session,Menu}=require('electron');
const path=require('node:path');const {pathToFileURL}=require('node:url');
const entry=pathToFileURL(path.join(__dirname,'app/index.html')).href;
let win;
function external(url){try{const parsed=new URL(url);if(['https:','http:'].includes(parsed.protocol))shell.openExternal(parsed.href);}catch{}}
app.setName('Keeps');
function create(){
 win=new BrowserWindow({title:'Keeps',width:1440,height:960,minWidth:760,minHeight:600,backgroundColor:'#171e2b',autoHideMenuBar:true,webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true,webSecurity:true}});
 win.webContents.setWindowOpenHandler(({url})=>{external(url);return {action:'deny'};});
 win.webContents.on('will-navigate',(event,url)=>{if(url.split('#')[0]!==entry){event.preventDefault();external(url);}});
 win.loadURL(entry);
 win.webContents.on('did-fail-load',(_event,code,description)=>console.error('Load failed',code,description));
 Menu.setApplicationMenu(Menu.buildFromTemplate([{label:'Keeps',submenu:[{label:'Reload',role:'reload'},{label:'Toggle full screen',role:'togglefullscreen'},{type:'separator'},{role:'quit'}]},{label:'Edit',submenu:[{role:'undo'},{role:'redo'},{type:'separator'},{role:'cut'},{role:'copy'},{role:'paste'},{role:'selectAll'}]},{label:'View',submenu:[{role:'resetZoom'},{role:'zoomIn'},{role:'zoomOut'}]}]));
}
if(!app.requestSingleInstanceLock())app.quit();else{
 app.on('second-instance',()=>{if(win){if(win.isMinimized())win.restore();win.focus();}});
 app.whenReady().then(()=>{session.defaultSession.setPermissionRequestHandler((_wc,_permission,callback)=>callback(false));session.defaultSession.setPermissionCheckHandler(()=>false);create();});
 app.on('window-all-closed',()=>app.quit());
}
