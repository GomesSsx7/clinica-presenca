import fs from "node:fs";

const source=fs.readFileSync("index.html","utf8");
const style=(source.match(/<style>([\s\S]*?)<\/style>/i)||[])[1];
if(!style) throw new Error("style block not found");

const html=`<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<style>${style}</style>
</head>
<body>
<div id="app">
  <div class="shell">
    <aside class="nav">
      <div class="app-brand"><span class="app-brand-logo"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></span><div class="app-brand-name"><span>Clínica</span><strong>Presença</strong></div></div>
      <div class="clinicbar"><label>UNIDADE ATUAL</label><select><option>Clínica Centro — Unidade Principal</option></select></div>
      <button data-v="attendance" class="active"><span>Atendimentos</span></button>
      <button data-v="patients"><span>Pacientes</span></button>
      <button data-v="reports"><span>Relatórios</span></button>
      <button data-v="settings"><span>Configurações</span></button>
    </aside>
    <div>
      <header class="mobile-top"><div class="mobile-top-brand"><span class="mini-logo"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></span><span>Clínica Presença</span></div><select class="mobile-unit"><option>Clínica Centro — Unidade Principal</option></select></header>
      <nav class="mobile-bottom">
        <button class="active"><span>Atendimentos</span></button><button><span>Pacientes</span></button><button><span>Relatórios</span></button><button><span>Config.</span></button>
      </nav>
      <main class="main">
        <div class="header"><div><div class="eyebrow">Unidade Principal</div><h1>Atendimentos</h1><p>quarta-feira, 14 de outubro</p></div><div class="datebar"><button id="prevDay" class="btn secondary iconbtn">‹</button><input class="input" type="date" value="2026-10-14"><button id="todayBtn" class="btn secondary todaybtn">Hoje</button><button id="nextDay" class="btn secondary iconbtn">›</button></div></div>
        <div class="metrics">
          <div class="card metric"><span>Pacientes do dia</span><strong>4</strong></div>
          <div class="card metric"><span>P · Presente</span><strong>2</strong></div>
          <div class="card metric"><span>F · Falta</span><strong>1</strong></div>
          <div class="card metric"><span>F.J · Falta justificada</span><strong>1</strong></div>
        </div>
        <section class="card panel">
          <div class="toolbar"><input class="input search" placeholder="Buscar paciente"><button class="btn primary">+ Novo paciente</button></div>
          <div class="tablewrap"><div class="table"><div class="head"><div>Paciente</div><div>Horário</div><div>Status</div><div>Resumo</div><div>Documentos</div></div><div id="rows">
            ${["Maria Aparecida de Souza Oliveira","João Pedro Santos","Ana Carolina Ferreira","Carlos Eduardo Almeida"].map((name,i)=>`<div class="row"><div class="name"><strong>${name}</strong><small>(22) 99999-1234</small></div><div>0${8+i}:00</div><div><div class="statusset"><button class="status present">P</button><button class="status absence">F</button><button class="status absence">F.J</button></div></div><div><div class="summarychips"><span>P <b>2</b></span><span>F <b>1</b></span><span>F.J <b>0</b></span></div></div><div class="chips"><button class="btn secondary">Prontuário</button><button class="btn secondary">Ficha</button></div></div>`).join("")}
          </div></div></div>
        </section>
      </main>
    </div>
  </div>
</div>
<script>
setTimeout(function(){
  var vw=window.innerWidth;
  var sw=document.documentElement.scrollWidth;
  var offenders=Array.from(document.querySelectorAll("body *")).filter(function(el){
    var cs=getComputedStyle(el);
    if(cs.position==="fixed")return false;
    var r=el.getBoundingClientRect();
    return r.right>vw+2||r.left<-2;
  }).slice(0,8).map(function(el){return typeof el.className==="string"?el.className:el.tagName});
  var bottom=getComputedStyle(document.querySelector(".mobile-bottom")).display;
  var nav=getComputedStyle(document.querySelector(".nav")).display;
  var expectedTouch=vw<=1180;
  var navOk=expectedTouch?(bottom!=="none"&&nav==="none"):(bottom==="none"&&nav!=="none");
  var ok=sw<=vw+2&&offenders.length===0&&navOk;
  document.documentElement.setAttribute("data-responsive",ok?"ok":"fail");
  document.documentElement.setAttribute("data-responsive-info",JSON.stringify({vw:vw,sw:sw,navOk:navOk,offenders:offenders}));
},50);
</script>
</body>
</html>`;

fs.writeFileSync(".responsive-probe.html",html);
