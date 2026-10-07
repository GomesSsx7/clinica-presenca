from pathlib import Path

p = Path("index.html")
s = p.read_text(encoding="utf-8")

def rep(old, new, label):
    global s
    if old not in s:
        raise SystemExit(f"{label} not found")
    s = s.replace(old, new, 1)

rep(
'.row,.head{display:grid;grid-template-columns:2fr .7fr 1.3fr .6fr .6fr;padding:11px 13px;gap:10px;align-items:center}',
'.row,.head{display:grid;grid-template-columns:2fr .7fr 1.3fr .6fr .6fr .7fr;padding:11px 13px;gap:10px;align-items:center}',
'attendance grid'
)

rep(
'.report .row,.report .head{grid-template-columns:2fr .7fr .7fr .8fr .8fr}',
'.report .row,.report .head{grid-template-columns:2fr .7fr .7fr .8fr .8fr .7fr}',
'report grid'
)

rep(
'select=patient_id,status,attendance_date&clinic_id=eq.',
'select=patient_id,status,attendance_date,signature_strokes,signed_at&clinic_id=eq.',
'attendance select'
)

rep(
'<div class="head"><div>Paciente</div><div>Horário</div><div>Status</div><div>Presenças</div><div>Faltas</div></div>',
'<div class="head"><div>Paciente</div><div>Horário</div><div>Status</div><div>Presenças</div><div>Faltas</div><div>Ficha</div></div>',
'attendance header'
)

rep(
'<div class="red">'+t.absent+'</div></div>',
'<div class="red">'+t.absent+'</div><div><button class="btn secondary" data-sheet="'+x.id+'">Ficha</button></div></div>',
'attendance row export'
)

rep(
'$$("[data-s]").forEach(function(b){b.onclick=function(){mark(b.dataset.id,b.dataset.s,map[b.dataset.id])}})}$("#qs").oninput=rows;',
'$$("[data-s]").forEach(function(b){b.onclick=function(){var id=b.dataset.id,n=b.dataset.s,c=map[id];if(n==="present"&&c!=="present"){signatureModal(function(strokes){mark(id,n,c,strokes)})}else mark(id,n,c,null)}});$$("[data-sheet]").forEach(function(b){b.onclick=function(){var p=S.patients.find(function(x){return x.id===b.dataset.sheet});if(p)exportPatientSheet(p)}})}$("#qs").oninput=rows;',
'attendance handlers'
)

old_mark = '''async function mark(id,n,c){try{if(n===c)await req("/rest/v1/attendance_entries?clinic_id=eq."+S.member.clinic_id+"&patient_id=eq."+id+"&attendance_date=eq."+S.date,{method:"DELETE"});else await req("/rest/v1/attendance_entries?on_conflict=patient_id,attendance_date",{method:"POST",headers:{Prefer:"resolution=merge-duplicates,return=minimal"},body:JSON.stringify({clinic_id:S.member.clinic_id,patient_id:id,attendance_date:S.date,status:n})});attendance()}catch(x){alert(x.message)}}'''
new_mark = '''async function mark(id,n,c,signature){try{if(n===c)await req("/rest/v1/attendance_entries?clinic_id=eq."+S.member.clinic_id+"&patient_id=eq."+id+"&attendance_date=eq."+S.date,{method:"DELETE"});else{var payload={clinic_id:S.member.clinic_id,patient_id:id,attendance_date:S.date,status:n};if(n==="present")payload.signature_strokes=signature;await req("/rest/v1/attendance_entries?on_conflict=patient_id,attendance_date",{method:"POST",headers:{Prefer:"resolution=merge-duplicates,return=minimal"},body:JSON.stringify(payload)})}attendance()}catch(x){alert(x.message)}}'''
rep(old_mark, new_mark, 'mark function')

helpers = r'''
function signatureModal(done){var d=document.createElement("div");d.className="modalbg";d.innerHTML='<div class="card modal"><h2>Assinatura do paciente</h2><p style="color:var(--muted);margin-top:-4px">Peça ao paciente para assinar no espaço abaixo para confirmar a presença desta sessão.</p><div id="sgm"></div><canvas id="sigc" width="720" height="220" style="width:100%;height:180px;border:1px solid #cad5e2;border-radius:10px;background:#fff;touch-action:none;display:block"></canvas><div class="actions"><button id="sgclear" class="btn secondary">Limpar</button><button id="sgcancel" class="btn secondary">Cancelar</button><button id="sgsave" class="btn primary">Confirmar presença</button></div></div>';document.body.appendChild(d);var c=$("#sigc",d),ctx=c.getContext("2d"),drawing=false,strokes=[];ctx.lineWidth=3;ctx.lineCap="round";ctx.lineJoin="round";ctx.strokeStyle="#172033";function pt(ev){var r=c.getBoundingClientRect();return [Math.max(0,Math.min(1,(ev.clientX-r.left)/r.width)),Math.max(0,Math.min(1,(ev.clientY-r.top)/r.height))]}function drawPoint(a,b){ctx.lineTo(b[0]*c.width,b[1]*c.height);ctx.stroke()}c.onpointerdown=function(ev){drawing=true;c.setPointerCapture(ev.pointerId);var p=pt(ev);strokes.push([p]);ctx.beginPath();ctx.moveTo(p[0]*c.width,p[1]*c.height)};c.onpointermove=function(ev){if(!drawing)return;var p=pt(ev),st=strokes[strokes.length-1],prev=st[st.length-1];st.push(p);drawPoint(prev,p)};c.onpointerup=c.onpointercancel=function(){drawing=false};$("#sgclear",d).onclick=function(){strokes=[];ctx.clearRect(0,0,c.width,c.height);$("#sgm",d).innerHTML=""};$("#sgcancel",d).onclick=function(){d.remove()};$("#sgsave",d).onclick=function(){var total=strokes.reduce(function(n,a){return n+a.length},0);if(total<6){msg("#sgm","Peça ao paciente para fazer uma assinatura completa.",false);return}d.remove();done(strokes)}}

function signatureData(strokes){if(!Array.isArray(strokes))return"";var paths=[];strokes.forEach(function(st){if(!Array.isArray(st)||st.length<2)return;var pts=[];st.forEach(function(p){if(!Array.isArray(p)||p.length<2)return;var x=Number(p[0]),y=Number(p[1]);if(!Number.isFinite(x)||!Number.isFinite(y))return;x=Math.max(0,Math.min(1,x));y=Math.max(0,Math.min(1,y));pts.push((x*720).toFixed(1)+","+(y*220).toFixed(1))});if(pts.length>1)paths.push('<polyline points="'+pts.join(" ")+'" fill="none" stroke="#172033" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>')});if(!paths.length)return"";var svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 220" width="720" height="220">'+paths.join("")+'</svg>';return"data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg)}

async function exportPatientSheet(p){var w=window.open("","_blank");if(!w){alert("O navegador bloqueou a janela de impressão. Permita pop-ups para este site e tente novamente.");return}w.document.write('<p style="font-family:Arial;padding:24px">Preparando ficha...</p>');try{var rows=await req("/rest/v1/attendance_entries?select=attendance_date,status,signature_strokes,signed_at&clinic_id=eq."+S.member.clinic_id+"&patient_id=eq."+p.id+"&order=attendance_date.asc"),items=rows||[],pages=[];for(var i=0;i<Math.max(items.length,1);i+=10)pages.push(items.slice(i,i+10));var html='<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Ficha - '+e(p.full_name)+'</title><style>@page{size:A4;margin:14mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#111;margin:0;background:#eee}.tools{position:sticky;top:0;background:#1a3150;color:white;padding:10px 14px;text-align:center}.tools button{padding:9px 14px;border:0;border-radius:7px;font-weight:700;cursor:pointer}.page{width:210mm;min-height:297mm;margin:12px auto;background:white;padding:14mm;page-break-after:always}.title{text-align:center;font-weight:800;font-size:18px;margin-bottom:14px}.meta{display:grid;grid-template-columns:2fr 1fr 1fr;gap:8px;border-bottom:1px solid #222;padding-bottom:10px;margin-bottom:14px;font-size:13px}.meta div{min-height:24px}.tbl{width:100%;border-collapse:collapse;font-size:13px}.tbl th,.tbl td{border:1px solid #222;padding:5px;text-align:center;height:50px}.tbl th{background:#f2f2f2}.tbl td.name{text-align:left}.sig{max-width:210px;max-height:42px;display:block;margin:auto}.foot{margin-top:14px;font-size:11px;color:#555}.no-print{display:block}@media print{body{background:white}.tools{display:none}.page{margin:0;padding:0;width:auto;min-height:auto;page-break-after:always}.page:last-child{page-break-after:auto}}</style></head><body><div class="tools"><button onclick="window.print()">Imprimir / Salvar em PDF</button></div>';pages.forEach(function(pg,pi){html+='<section class="page"><div class="title">CONTROLE DE CONSULTAS – '+e(cname()).toUpperCase()+'</div><div class="meta"><div><b>NOME:</b> '+e(p.full_name)+'</div><div><b>TEL.:</b> '+e(p.phone||"—")+'</div><div><b>HORÁRIO:</b> '+e((p.default_time||"").slice(0,5)||"—")+'</div></div><table class="tbl"><thead><tr><th style="width:8%">Sessão</th><th style="width:20%">Data</th><th>Assinatura do paciente</th><th style="width:22%">Dia da falta</th></tr></thead><tbody>';for(var j=0;j<10;j++){var idx=pi*10+j,x=pg[j],num=idx+1;if(x){var date=x.attendance_date.split("-").reverse().join("/"),img=x.status==="present"&&x.signature_strokes?'<img class="sig" alt="Assinatura" src="'+signatureData(x.signature_strokes)+'">':"";html+='<tr><td>'+num+'</td><td>'+e(date)+'</td><td>'+img+'</td><td>'+(x.status==="absent"?e(date):"")+'</td></tr>'}else html+='<tr><td>'+num+'</td><td></td><td></td><td></td></tr>'}html+='</tbody></table><div class="foot">Ficha gerada pelo sistema em '+new Date().toLocaleString("pt-BR")+'. Cada presença registrada exige assinatura do paciente.</div></section>'});html+='</body></html>';w.document.open();w.document.write(html);w.document.close()}catch(x){w.document.open();w.document.write('<p style="font-family:Arial;padding:24px;color:#a12b34">Não foi possível gerar a ficha: '+e(x.message)+'</p>');w.document.close()}}
'''

rep('function modal(p,done){', helpers + '\nfunction modal(p,done){', 'helper insertion')

rep(
'<button class="btn secondary" data-tg="'+x.id+'">'+(x.active?"Inativar":"Reativar")+'</button></div></div>',
'<button class="btn secondary" data-tg="'+x.id+'">'+(x.active?"Inativar":"Reativar")+'</button> <button class="btn secondary" data-pr="'+x.id+'">Ficha / PDF</button></div></div>',
'patient export button'
)

rep(
'$$("[data-tg]").forEach(function(b){b.onclick=async function(){var p=S.patients.find(function(x){return x.id===b.dataset.tg});await req("/rest/v1/patients?id=eq."+p.id+"&clinic_id=eq."+S.member.clinic_id,{method:"PATCH",headers:{Prefer:"return=minimal"},body:JSON.stringify({active:!p.active})});patients()}})}',
'$$("[data-tg]").forEach(function(b){b.onclick=async function(){var p=S.patients.find(function(x){return x.id===b.dataset.tg});await req("/rest/v1/patients?id=eq."+p.id+"&clinic_id=eq."+S.member.clinic_id,{method:"PATCH",headers:{Prefer:"return=minimal"},body:JSON.stringify({active:!p.active})});patients()}});$$("[data-pr]").forEach(function(b){b.onclick=function(){var p=S.patients.find(function(x){return x.id===b.dataset.pr});if(p)exportPatientSheet(p)}})}',
'patient export handler'
)

rep(
'<div class="head"><div>Paciente</div><div>Presenças</div><div>Faltas</div><div>Taxa</div><div>Situação</div></div>',
'<div class="head"><div>Paciente</div><div>Presenças</div><div>Faltas</div><div>Taxa</div><div>Situação</div><div>Ficha</div></div>',
'report header'
)

rep(
'<div>'+(x.active?"Ativo":"Inativo")+'</div></div>',
'<div>'+(x.active?"Ativo":"Inativo")+'</div><div><button class="btn secondary" data-rp="'+x.id+'">PDF</button></div></div>',
'report row'
)

rep(
'$("#om").onclick=function(){S.month=$("#mo").value||S.month;reports()}}',
'$("#om").onclick=function(){S.month=$("#mo").value||S.month;reports()};$$("[data-rp]").forEach(function(b){b.onclick=function(){var p=rows.find(function(x){return x.id===b.dataset.rp});if(p)exportPatientSheet(p)}})}',
'report handlers'
)

p.write_text(s, encoding="utf-8")
