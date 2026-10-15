import fs from "node:fs";

let html=fs.readFileSync("index.html","utf8");
let app=fs.readFileSync("app.js","utf8");

html=html.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>\s*/i,"");
const scriptTag='<script src="/app.js" defer></script>';
if(!html.includes(scriptTag)) throw new Error("app.js script tag not found");

const marker="boot();";
const pos=app.lastIndexOf(marker);
if(pos<0) throw new Error("boot marker not found");

const mock=`
localStorage.setItem("cp-privacy-choice","essential");
S.user={id:"mock-user",user_metadata:{username:"admin"}};
S.member={clinic_id:"mock-clinic",role:"owner",clinics:{name:"Clínica Teste"}};
S.settings={timezone:"America/Sao_Paulo",operating_weekdays:[1,2,4,5]};
S.locations=[
  {id:"loc-1",name:"Clínica Centro — Unidade Principal",operating_weekdays:[1,2,4,5],active:true},
  {id:"loc-2",name:"Clínica Bairro",operating_weekdays:[1,2,4,5],active:true}
];
S.location=S.locations[0];
S.profile=null;
S.statuses=[
  {code:"P",label:"Presente",category:"present",requires_patient_signature:true,active:true,display_order:10},
  {code:"F",label:"Falta",category:"absence",requires_patient_signature:false,active:true,display_order:20},
  {code:"F.J",label:"Falta justificada",category:"absence",requires_patient_signature:false,active:true,display_order:30}
];
S.date="2026-10-14";
S.patients=[
  {id:"p1",full_name:"Maria Aparecida de Souza Oliveira",phone:"(22) 99999-1234",default_time:"08:00:00",active:true,location_id:"loc-1"},
  {id:"p2",full_name:"João Pedro Santos",phone:"(22) 98888-4321",default_time:"09:30:00",active:true,location_id:"loc-1"},
  {id:"p3",full_name:"Ana Carolina Ferreira",phone:"(22) 97777-5555",default_time:"10:15:00",active:true,location_id:"loc-1"},
  {id:"p4",full_name:"Carlos Eduardo Almeida",phone:"(22) 96666-9999",default_time:"13:45:00",active:true,location_id:"loc-1"}
];
S.entries=[{patient_id:"p1",status_code:"P"},{patient_id:"p2",status_code:"F.J"}];
S.monthEntries=[
  {patient_id:"p1",status_code:"P"},{patient_id:"p1",status_code:"P"},{patient_id:"p1",status_code:"F"},
  {patient_id:"p2",status_code:"F.J"},{patient_id:"p2",status_code:"P"}
];
shell();
drawAttendance();
setTimeout(function(){
  var vw=window.innerWidth;
  var sw=document.documentElement.scrollWidth;
  var offenders=Array.from(document.querySelectorAll("body *")).filter(function(el){
    var cs=getComputedStyle(el);
    if(cs.position==="fixed")return false;
    var r=el.getBoundingClientRect();
    return r.right>vw+2||r.left<-2;
  }).slice(0,8).map(function(el){return el.className||el.tagName});
  var bottom=getComputedStyle(document.querySelector(".mobile-bottom")).display;
  var nav=getComputedStyle(document.querySelector(".nav")).display;
  var expectedTouch=vw<=1180;
  var navOk=expectedTouch?(bottom!=="none"&&nav==="none"):(bottom==="none"&&nav!=="none");
  var ok=sw<=vw+2&&offenders.length===0&&navOk;
  document.documentElement.setAttribute("data-responsive",ok?"ok":"fail");
  document.documentElement.setAttribute("data-responsive-info",JSON.stringify({vw:vw,sw:sw,navOk:navOk,offenders:offenders}));
},120);
`;

app=app.slice(0,pos)+mock+app.slice(pos+marker.length);
html=html.replace(scriptTag,"<script>"+app.replace(/<\/script/gi,"<\\/script")+"</script>");
fs.writeFileSync(".responsive-probe.html",html);
