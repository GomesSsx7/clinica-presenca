import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const required=["index.html","privacy.html","terms.html","faq.html","404.html","robots.txt","sitemap.xml","favicon.svg","social-card.svg","site.webmanifest"];
for(const file of required){
  if(!fs.existsSync(path.join(root,file))) throw new Error("Arquivo obrigatório ausente: "+file);
}

const index=fs.readFileSync(path.join(root,"index.html"),"utf8");
const script=(index.match(/<script>([\s\S]*?)<\/script>/)||[])[1];
if(!script) throw new Error("Script principal ausente");
new Function(script);

for(const requiredText of [
  'rel="canonical"',
  'name="description"',
  'property="og:title"',
  'href="/favicon.svg"',
  'id="cookieConsent"',
  'privacy.html',
  'terms.html',
  'faq.html'
]){
  if(!index.includes(requiredText)) throw new Error("Checklist ausente no index: "+requiredText);
}

const localHref=/href=["']\/?([^"'#?]+)["']/g;
for(const file of ["index.html","privacy.html","terms.html","faq.html","404.html"]){
  const html=fs.readFileSync(path.join(root,file),"utf8");
  let m;
  while((m=localHref.exec(html))){
    const target=m[1];
    if(/^https?:/.test(target)||target==="") continue;
    const resolved=target===" "?null:path.join(root,target);
    if(resolved&&!fs.existsSync(resolved)) throw new Error(file+" aponta para arquivo inexistente: "+target);
  }
}

const bad=[];
for(const p of [/\$\([^)]*\)\.forEach/g,/\$\([^)]*\)\.map/g,/\$\([^)]*\)\.filter/g]){
  let m; while((m=p.exec(index))!==null){ if(m.index===0||index[m.index-1]!=="$") bad.push(m[0]); }
}
if(bad.length) throw new Error("Seletores de coleção inválidos: "+bad.join(", "));

console.log("Site smoke check: OK");
