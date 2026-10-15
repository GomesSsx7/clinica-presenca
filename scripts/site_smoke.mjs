import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const required=["index.html","app.js","privacy.html","terms.html","faq.html","404.html","robots.txt","sitemap.xml","favicon.svg","social-card.svg","site.webmanifest"];
for(const file of required){
  if(!fs.existsSync(path.join(root,file))) throw new Error("Arquivo obrigatório ausente: "+file);
}

const index=fs.readFileSync(path.join(root,"index.html"),"utf8");
const app=fs.readFileSync(path.join(root,"app.js"),"utf8");
new Function(app);

for(const requiredText of [
  'rel="canonical"',
  'name="description"',
  'property="og:title"',
  'href="/favicon.svg"',
  'http-equiv="Content-Security-Policy"',
  "script-src 'self'",
  'src="/app.js"',
  'privacy.html',
  'terms.html',
  'faq.html'
]){
  if(!index.includes(requiredText)) throw new Error("Checklist ausente no index: "+requiredText);
}

if(/<script>([\s\S]*?)<\/script>/i.test(index)) throw new Error("JavaScript inline voltou para index.html");
if(/\son[a-z]+\s*=/i.test(index)) throw new Error("Handler inline detectado no HTML principal");
if(!app.includes("function e(v)")) throw new Error("Escape HTML helper ausente");
if(app.includes('localStorage.setItem("cp-session"')) throw new Error("Sessão voltou a ser persistida em localStorage");
if(!app.includes('sessionStorage.setItem("cp-session"')) throw new Error("Sessão não está em sessionStorage");

const forbidden=[
  "SUPABASE_SERVICE_ROLE_KEY",
  "sb_secret_",
  "BEGIN PRIVATE KEY",
  "sk-proj-",
  "sk_live_"
];
for(const token of forbidden){
  for(const file of required.concat([".github/workflows/site-smoke.yml"])){
    if(!fs.existsSync(path.join(root,file))) continue;
    const txt=fs.readFileSync(path.join(root,file),"utf8");
    if(txt.includes(token)) throw new Error("Possível segredo encontrado em "+file+": "+token);
  }
}

const localHref=/href=["']\/?([^"'#?]+)["']/g;
for(const file of ["index.html","privacy.html","terms.html","faq.html","404.html"]){
  const html=fs.readFileSync(path.join(root,file),"utf8");
  let m;
  while((m=localHref.exec(html))){
    const target=m[1];
    if(/^https?:/.test(target)||target.startsWith("/")||target==="") continue;
    const resolved=path.join(root,target);
    if(!fs.existsSync(resolved)) throw new Error(file+" aponta para arquivo inexistente: "+target);
  }
}

const bad=[];
for(const p of [/\$\([^)]*\)\.forEach/g,/\$\([^)]*\)\.map/g,/\$\([^)]*\)\.filter/g]){
  let m; while((m=p.exec(app))!==null){ if(m.index===0||app[m.index-1]!=="$") bad.push(m[0]); }
}
if(bad.length) throw new Error("Seletores de coleção inválidos: "+bad.join(", "));

console.log("Site smoke/security check: OK");
