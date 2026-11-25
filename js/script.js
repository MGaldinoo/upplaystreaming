/* ===== Configuração: troque pelo seu número (DDI+DDD+número) ===== */
const API_URL = ""; /* endereço do seu backend que cria o teste no painel; vazio = modo demonstração */
const WHATS = "5581992387518";
const PLANOS = [
  {nome:"Mensal", preco:"29,90", mes:"29,90", per:"/mês", itens:["1 tela","Canais, filmes e séries","Suporte WhatsApp"]},
  {nome:"Trimestral", preco:"79,90", mes:"26,63", per:"/3 meses", itens:["2 telas","Canais, filmes e séries","Suporte prioritário"], top:true},
  {nome:"Anual", preco:"249,90", mes:"20,83", per:"/ano", itens:["3 telas","Todos os recursos","Suporte prioritário"]}
];
const wa = t => `https://wa.me/${WHATS}?text=${encodeURIComponent(t)}`;
const $ = s => document.querySelector(s);

/* ===== Planos ===== */
$("#planGrid").innerHTML = PLANOS.map(p => `
  <article class="plan ${p.top ? "top" : ""}">
    <h3>${p.nome}${p.top ? " – mais escolhido" : ""}</h3>
    <p class="price">R$ ${p.preco} <small>${p.per}</small></p>
    ${p.mes !== p.preco ? `<p class="hint" style="margin:-.3rem 0 .6rem">equivale a R$ ${p.mes} por mês</p>` : ""}
    <ul>${p.itens.map(i => `<li>${i}</li>`).join("")}</ul>
    <a class="btn wa" target="_blank" rel="noopener" href="${wa("Olá! Quero assinar o plano " + p.nome + ".")}">Assinar pelo WhatsApp</a>
  </article>`).join("");
document.querySelectorAll("[data-wa]").forEach(a => a.href = wa(a.dataset.wa));
$("#ano").textContent = new Date().getFullYear();

/* Abas de instalação */
document.querySelectorAll("[data-tab]").forEach(b => b.onclick = () => {
  document.querySelectorAll("[data-tab]").forEach(x => x.setAttribute("aria-selected", x === b));
  document.querySelectorAll(".panel").forEach(p => p.hidden = p.id !== b.dataset.tab);
});
/* Termos e privacidade */
document.querySelectorAll("[data-dlg]").forEach(b => b.onclick = () => document.getElementById(b.dataset.dlg).showModal());
/* Máscara do WhatsApp */
$("#zap").addEventListener("input", e => {
  const d = e.target.value.replace(/\D/g, "").slice(0, 11);
  e.target.value = d.length > 7 ? `${d.slice(0,2)} ${d.slice(2,7)}-${d.slice(7)}` : d.length > 2 ? `${d.slice(0,2)} ${d.slice(2)}` : d;
});
/* Copiar dados */
$("#copyBtn").onclick = async () => {
  const t = `Usuário: ${$("#cUser").textContent}\nSenha: ${$("#cPass").textContent}`;
  try{ await navigator.clipboard.writeText(t); $("#copyBtn").textContent = "Copiado ✔"; }catch(e){ $("#copyBtn").textContent = "Copie manualmente"; }
  setTimeout(() => $("#copyBtn").textContent = "Copiar dados", 2000);
};

/* Detecta o aparelho e abre a aba de instalação certa */
function showTab(id){
  document.querySelectorAll("[data-tab]").forEach(x => x.setAttribute("aria-selected", x.dataset.tab === id));
  document.querySelectorAll(".panel").forEach(p => p.hidden = p.id !== id);
}
const mapTab = {"Smart TV":"p1","TV Box / Android TV":"p2","Celular Android":"p2","Tablet":"p2","iPhone / iPad":"p3","Computador / Notebook":"p4"};
(function(){
  const ua = navigator.userAgent; let ap = "Computador / Notebook";
  if(/Tizen|Web0S|WebOS|SmartTV|SMART-TV|HbbTV|NetCast|VIDAA/i.test(ua)) ap = "Smart TV";
  else if(/iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) ap = "iPhone / iPad";
  else if(/Android/i.test(ua)) ap = /AFT|TV|BRAVIA|Box/i.test(ua) ? "TV Box / Android TV" : (/Mobile/i.test(ua) ? "Celular Android" : "Tablet");
  $("#aparelho").value = ap; showTab(mapTab[ap]);
  $("#detect").textContent = `Detectamos: ${ap}. Se não for este, escolha o seu aparelho abaixo.`;
})();
$("#aparelho").addEventListener("change", e => showTab(mapTab[e.target.value]));

/* Tamanho da letra */
const fs = [100, 112, 125]; let fi = 0; try{ fi = +localStorage.getItem("fonte") || 0; }catch(e){}
function setFont(){ document.documentElement.style.fontSize = fs[fi] + "%"; $("#fontBtn").textContent = fi ? `A+ Letra ${fs[fi]}%` : "A+ Letra maior"; }
setFont();
$("#fontBtn").onclick = () => { fi = (fi + 1) % 3; setFont(); try{ localStorage.setItem("fonte", fi); }catch(e){} };

/* Meu teste: consulta pelo WhatsApp */
$("#lookup").addEventListener("submit", async e => {
  e.preventDefault();
  const m = $("#msg2"); m.textContent = "";
  const d = $("#zap2").value.replace(/\D/g, "");
  if(d.length < 10){ m.textContent = "Digite o WhatsApp com DDD."; return; }
  const doc = await dbGet(d.length <= 11 ? "55" + d : d);
  if(!doc){ m.textContent = "Não encontramos teste deste número neste aparelho. Gere um novo acima ou chame no WhatsApp."; return; }
  showResult(doc, true);
});

/* ===== Tema (modo noite) ===== */
const root = document.documentElement, themeBtn = $("#themeBtn");
function setTheme(t){
  root.dataset.theme = t;
  const dark = t === "dark";
  themeBtn.textContent = dark ? "☀️ Modo claro" : "🌙 Modo noite";
  themeBtn.setAttribute("aria-pressed", dark);
  try{ localStorage.setItem("tema", t); }catch(e){}
}
let saved = null; try{ saved = localStorage.getItem("tema"); }catch(e){}
setTheme(saved || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
themeBtn.onclick = () => setTheme(root.dataset.theme === "dark" ? "light" : "dark");

/* ===== Menu lateral (gaveta no mobile) ===== */
const side = $("#sidebar"), scrim = $("#scrim"), menuBtn = $("#menuBtn");
function toggleMenu(open){
  side.classList.toggle("open", open); scrim.hidden = !open;
  menuBtn.setAttribute("aria-expanded", open);
}
menuBtn.onclick = () => toggleMenu(!side.classList.contains("open"));
scrim.onclick = () => toggleMenu(false);
side.querySelectorAll("nav a").forEach(a => a.addEventListener("click", () => toggleMenu(false)));
document.addEventListener("keydown", e => { if(e.key === "Escape") toggleMenu(false); });

/* Destaca o item do menu da seção visível */
const links = [...side.querySelectorAll("nav a")];
const io = new IntersectionObserver(es => es.forEach(e => {
  if(e.isIntersecting) links.forEach(l => l.classList.toggle("active", l.getAttribute("href") === "#" + e.target.id));
}), {rootMargin:"-40% 0px -55% 0px"});
document.querySelectorAll("main section, #inicio").forEach(s => io.observe(s));

/* ===== Banco NoSQL (IndexedDB): coleção "testes" ===== */
const mem = {}; // plano B se o navegador bloquear o IndexedDB
function openDB(){
  return new Promise((ok, fail) => {
    try{
      const r = indexedDB.open("streamazul", 1);
      r.onupgradeneeded = () => r.result.createObjectStore("testes", {keyPath:"zap"});
      r.onsuccess = () => ok(r.result);
      r.onerror = () => fail(r.error);
    }catch(e){ fail(e); }
  });
}
async function dbGet(zap){
  try{
    const db = await openDB();
    return await new Promise((ok, fail) => { const q = db.transaction("testes").objectStore("testes").get(zap); q.onsuccess = () => ok(q.result); q.onerror = () => fail(q.error); });
  }catch(e){ return mem[zap]; }
}
async function dbPut(doc){
  try{
    const db = await openDB();
    await new Promise((ok, fail) => { const t = db.transaction("testes","readwrite"); t.objectStore("testes").put(doc); t.oncomplete = ok; t.onerror = () => fail(t.error); });
  }catch(e){ mem[doc.zap] = doc; }
}

/* ===== Gerar teste ===== */
const rnd = (n, set) => Array.from({length:n}, () => set[Math.floor(Math.random()*set.length)]).join("");
const fmt = d => d.toLocaleString("pt-BR", {dateStyle:"short", timeStyle:"short"});

function showResult(doc, repetido){
  $("#resTxt").textContent = repetido
    ? "Este WhatsApp já gerou um teste. Aqui estão os dados dele:"
    : `${doc.nome}, seu teste de 4 horas está pronto. Use os dados abaixo no aplicativo do seu aparelho (${doc.aparelho}).`;
  $("#cUser").textContent = doc.user; $("#cPass").textContent = doc.pass; $("#cExp").textContent = fmt(new Date(doc.expira));
  clearInterval(window.tm);
  const tick = () => { const ms = doc.expira - Date.now(); $("#cLeft").textContent = ms > 0 ? `${Math.floor(ms/3600000)}h ${String(Math.floor(ms%3600000/60000)).padStart(2,"0")}min` : "Expirado"; };
  tick(); window.tm = setInterval(tick, 30000);
  $("#resSub").href = wa(`Olá! Quero assinar. Meu usuário de teste: ${doc.user}`);
  $("#resWa").href = wa(`Olá! Sou ${doc.nome}. Gerei um teste no site.\nUsuário: ${doc.user}\nSenha: ${doc.pass}\nAparelho: ${doc.aparelho}`);
  $("#result").hidden = false;
  $("#result").scrollIntoView({behavior:"smooth", block:"center"});
}

$("#testForm").addEventListener("submit", async e => {
  e.preventDefault();
  const msg = $("#msg"); msg.textContent = "";
  const nome = $("#nome").value.trim(), digitos = $("#zap").value.replace(/\D/g, "");
  if(nome.length < 2){ msg.textContent = "Digite seu nome."; $("#nome").focus(); return; }
  if(digitos.length < 10 || digitos.length > 13){ msg.textContent = "Digite o WhatsApp com DDD, por exemplo 81 99999-9999."; $("#zap").focus(); return; }
  if($("#site").value) return; /* anti-robô */
  if(!$("#aceito").checked){ msg.textContent = "Aceite os termos e a política de privacidade para continuar."; $("#aceito").focus(); return; }
  let n = 0; try{ n = +localStorage.getItem("qtdTestes") || 0; }catch(err){}
  if(n >= 2){ msg.textContent = "Limite de testes neste aparelho. Fale com a gente no WhatsApp."; return; }
  const zap = digitos.length <= 11 ? "55" + digitos : digitos;
  const btn = $("#gerar"); btn.disabled = true; btn.textContent = "Gerando...";
  const antigo = await dbGet(zap);
  if(antigo){ showResult(antigo, true); }
  else{
    const doc = {
      zap, nome, aparelho: $("#aparelho").value,
      user: "t" + rnd(7, "abcdefghjkmnpqrstuvwxyz23456789"),
      pass: rnd(8, "ABCDEFGHJKMNPQRSTUVWXYZ23456789"),
      criado: Date.now(), expira: Date.now() + 4*3600*1000
    };
    let final = doc;
    if(API_URL){
      try{
        const r = await fetch(API_URL, {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({nome, zap, aparelho:doc.aparelho})});
        if(!r.ok) throw new Error("api");
        final = {...doc, ...(await r.json())};
      }catch(err){ msg.textContent = "Não foi possível gerar agora. Chame no WhatsApp."; btn.disabled = false; btn.textContent = "Gerar teste"; return; }
    }
    await dbPut(final);
    try{ localStorage.setItem("qtdTestes", n + 1); }catch(err){}
    showResult(final, false);
  }
  btn.disabled = false; btn.textContent = "Gerar teste";
});
