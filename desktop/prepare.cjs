const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),target=path.join(__dirname,'app');
fs.rmSync(target,{recursive:true,force:true});fs.mkdirSync(target,{recursive:true});
for(const name of fs.readdirSync(root)){if(/\.(html|css|js|svg|png|ico|webp|jpg|jpeg)$/.test(name))fs.copyFileSync(path.join(root,name),path.join(target,name));}
// Bundle the font so the interface does not require a network connection.
const font=path.join(__dirname,'node_modules/@fontsource/dm-sans/files');
fs.mkdirSync(path.join(target,'fonts'),{recursive:true});
let css='';for(const weight of [400,500,600,700]){const file=`dm-sans-latin-${weight}-normal.woff2`;fs.copyFileSync(path.join(font,file),path.join(target,'fonts',file));css+=`@font-face{font-family:'DM Sans';font-style:normal;font-weight:${weight};font-display:swap;src:url('./fonts/${file}') format('woff2');}\n`;}
const style=path.join(target,'style.css');fs.writeFileSync(style,css+fs.readFileSync(style,'utf8').replace(/@import\s+url\([^;]+;/g,''));
for(const file of fs.readdirSync(target).filter(x=>x.endsWith('.js')))require('node:child_process').execFileSync(process.execPath,['--check',path.join(target,file)]);
console.log('Bundled app, scripts checked and offline fonts copied.');
