(function(){
  document.documentElement.classList.add('js');
  const root=document.documentElement;
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const css=n=>getComputedStyle(root).getPropertyValue(n).trim();

  /* theme toggle */
  try{const t=localStorage.getItem('aa-theme'); if(t) root.setAttribute('data-theme',t);}catch(e){}
  document.getElementById('themeBtn').addEventListener('click',()=>{
    const cur=root.getAttribute('data-theme')||(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');
    const next=cur==='dark'?'light':'dark';
    root.setAttribute('data-theme',next);
    try{localStorage.setItem('aa-theme',next);}catch(e){}
    if(document.getElementById('saw')) drawSaw();
  });

  /* London clock */
  const clk=document.getElementById('clock');
  const fmt=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',hour:'2-digit',minute:'2-digit',second:'2-digit'});
  const tickClock=()=>{clk.textContent=fmt.format(new Date());};
  tickClock(); setInterval(tickClock,1000);

  /* barcode */
  const bc=document.getElementById('barcode'); let seed=7;
  const rnd=()=>{seed=(seed*9301+49297)%233280;return seed/233280;};
  if(bc) for(let i=0;i<64;i++){const s=document.createElement('span');s.style.width=(1+Math.floor(rnd()*3))+'px';if(rnd()>.82)s.style.opacity='0';bc.appendChild(s);}

  /* ticker */
  const lines=[
    ['OK','Route','DAC → LON complete'],
    ['LIVE','Scrabbl Technologies','Founder & CEO since Sep 2026'],
    ['OK','MSc LSCM','University of Hull · completed'],
    ['OK','Dissertation','Li-ion battery supply chains · PRISMA 2020'],
    ['OK','Projects coordinated','30+'],
    ['OK','Events delivered','25+'],
    ['OK','dev.resolved','Co-founder & COO · 2024–2025'],
    ['OK','BSc Computer Science','IUB · 2024'],
    ['OPEN','Availability','UK graduate & operations roles']
  ];
  const tk=document.getElementById('ticker');
  const html=lines.map(l=>`<span><b>[${l[0]}]</b><em>${l[1]}</em>${l[2]}</span>`).join('');
  if(tk) tk.innerHTML=html+html;

  /* reveal on scroll (content visible at rest; only enhanced when below fold) */
  const els=[...document.querySelectorAll('.reveal')];
  if('IntersectionObserver' in window && !reduce){
    const vh=window.innerHeight;
    els.forEach(el=>{ if(el.getBoundingClientRect().top>vh) el.classList.add('pending'); });
    const io=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){e.target.classList.remove('pending');io.unobserve(e.target);} }),{rootMargin:'0px 0px -8% 0px'});
    els.forEach(el=>io.observe(el));
  }

  /* mobile menu */
  const mb=document.getElementById('menuBtn'), mn=document.getElementById('mnav');
  if(mb&&mn) mb.addEventListener('click',()=>{ const open=mn.hidden; mn.hidden=!open; mb.setAttribute('aria-expanded',String(open)); });

  if(document.getElementById('net')){
  /* network canvas */
  const cv=document.getElementById('net'), ctx=cv.getContext('2d');
  let W=0,H=0,nodes=[],edges=[],packets=[],mouse={x:-999,y:-999};
  let named={};
  function build(){
    const r=cv.getBoundingClientRect(); const dpr=Math.min(window.devicePixelRatio||1,2);
    W=r.width;H=r.height;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
    let s=11; const rr=()=>{s=(s*9301+49297)%233280;return s/233280;};
    const n=W<700?11:16; nodes=[];
    for(let i=0;i<n;i++){ nodes.push({x:(.06+.88*((i+rr()*.8)/n))*W, y:(.12+.76*rr())*H}); }
    named=n>11?{0:'DAC',2:'IUB',5:'HULL',8:'LON'}:{0:'DAC',3:'IUB',6:'HULL',9:'LON'};
    edges=[]; nodes.forEach((a,i)=>{ const d=nodes.map((b,j)=>({j,d:Math.hypot(a.x-b.x,a.y-b.y)})).filter(o=>o.j!==i).sort((p,q)=>p.d-q.d);
      d.slice(0,2).forEach(o=>{ if(!edges.some(e=>(e[0]===i&&e[1]===o.j)||(e[0]===o.j&&e[1]===i))) edges.push([i,o.j]); }); });
    packets=edges.map((e,k)=>({e:k,t:rr(),v:.0012+rr()*.0025}));
  }
  function frame(){
    ctx.clearRect(0,0,W,H);
    const line=css('--line'), acc=css('--accent'), mut=css('--muted'), live=css('--live');
    ctx.lineWidth=1; ctx.strokeStyle=line;
    edges.forEach(([a,b])=>{ctx.beginPath();ctx.moveTo(nodes[a].x,nodes[a].y);ctx.lineTo(nodes[b].x,nodes[b].y);ctx.stroke();});
    packets.forEach(p=>{ const [a,b]=edges[p.e]; if(!reduce){p.t+=p.v; if(p.t>1)p.t=0;}
      const x=nodes[a].x+(nodes[b].x-nodes[a].x)*p.t, y=nodes[a].y+(nodes[b].y-nodes[a].y)*p.t;
      ctx.fillStyle=acc; ctx.globalAlpha=.85; ctx.fillRect(x-2,y-2,4,4); ctx.globalAlpha=1; });
    nodes.forEach((n,i)=>{ const near=Math.hypot(n.x-mouse.x,n.y-mouse.y)<110;
      ctx.beginPath();ctx.arc(n.x,n.y,near?4.5:2.6,0,7);ctx.fillStyle=near?live:mut;ctx.fill();
      if(named[i]){ctx.font='500 10px "IBM Plex Mono", monospace';ctx.fillStyle=mut;ctx.fillText(named[i],n.x+8,n.y-8);} });
    if(!reduce) requestAnimationFrame(frame);
  }
  build(); frame();
  window.addEventListener('resize',()=>{build(); if(reduce) frame();});
  document.querySelector('.hero').addEventListener('pointermove',e=>{const r=cv.getBoundingClientRect();mouse.x=e.clientX-r.left;mouse.y=e.clientY-r.top;});

  }

  /* career tracker checkpoints */
  document.querySelectorAll('#trkRoute .cp[data-t] button').forEach(btn=>btn.addEventListener('click',()=>{
    const li=btn.parentElement, row=document.getElementById(li.dataset.t); if(!row) return;
    document.querySelectorAll('#trkRoute .cp').forEach(c=>c.classList.toggle('sel',c===li));
    document.querySelectorAll('.stop.hl').forEach(s=>s.classList.remove('hl'));
    row.classList.remove('pending'); row.classList.add('hl');
    row.scrollIntoView({behavior:reduce?'auto':'smooth',block:'center'});
    clearTimeout(row._t); row._t=setTimeout(()=>row.classList.remove('hl'),2400);
  }));

  /* portrait parallax */
  const pt=document.getElementById('portrait');
  if(pt && !reduce && matchMedia('(pointer:fine)').matches){
    document.querySelector('.hero').addEventListener('pointermove',e=>{
      const r=pt.getBoundingClientRect(); const x=(e.clientX-(r.left+r.width/2))/r.width, y=(e.clientY-(r.top+r.height/2))/r.height;
      pt.style.setProperty('--px',(x*14).toFixed(1)+'px'); pt.style.setProperty('--py',(y*10).toFixed(1)+'px');
      pt.style.setProperty('--dx',(-x*10).toFixed(1)+'px'); pt.style.setProperty('--dy',(-y*8).toFixed(1)+'px');
    });
    document.querySelector('.hero').addEventListener('pointerleave',()=>['--px','--py','--dx','--dy'].forEach(v=>pt.style.setProperty(v,'0px')));
  }

  if(document.getElementById('explain')){
  /* nexus */
  const P={
    'sc-tech':{k:['sc','tech'],t:'Data-led decisions',d:'Supply chains produce data at every step: orders, lead times, stock counts. My computer science background lets me turn that data into forecasts, dashboards and simple tools so decisions rest on evidence rather than habit. The calculator on this page is a small example.',c:['Demand forecasting','KPI dashboards','Inventory models','MSc analytics']},
    'tech-ent':{k:['tech','ent'],t:'Products that ship',d:'At Scrabbl Technologies, technology meets commercial reality. As CEO I make sure we build software that solves a real business problem, delivered on time with a clear owner for each piece.',c:['Scrabbl Technologies','Custom software','Team structure','Delivery']},
    'sc-ent':{k:['sc','ent'],t:'Operations that scale',d:'Running Ace Events and leading operations at Tiger Lily taught me that growth breaks weak processes first. I build simple, repeatable systems for suppliers, stock and staffing so a business can take on more without falling over.',c:['25+ events','Supplier networks','Rota planning','Process design']},
    'all':{k:['sc','tech','ent'],t:'How I work',d:'Understand the physical flow, measure it, then build or buy the tool that improves it, and make sure there is a business reason behind every change. That is the thread through my degrees, my roles and the company I lead.',c:['Analytical','Hands-on','Commercial','Builder']}
  };
  const ex=document.getElementById('explain'), groups=[...document.querySelectorAll('.venn g')], pairs=[...document.querySelectorAll('.pair')];
  function setPair(id){ const p=P[id];
    pairs.forEach(b=>b.setAttribute('aria-pressed',b.dataset.p===id));
    groups.forEach(g=>g.classList.toggle('on',p.k.includes(g.dataset.k)));
    ex.innerHTML=`<h3>${p.t}</h3><p>${p.d}</p><div class="chips">${p.c.map(x=>`<span class="chip hi">${x}</span>`).join('')}</div>`; }
  pairs.forEach(b=>b.addEventListener('click',()=>setPair(b.dataset.p)));
  groups.forEach(g=>g.addEventListener('click',()=>{ const k=g.dataset.k; setPair(k==='sc'?'sc-ent':k==='tech'?'sc-tech':'tech-ent'); }));
  setPair('sc-tech');

  }

  /* inventory calculator */
  const $=id=>document.getElementById(id); const H_COST=2.5;
  const hasCalc=!!$('saw');
  const fmtN=n=>Math.round(n).toLocaleString('en-GB');
  function drawSaw(){
    const d=+$('d').value,L=+$('L').value,sd=+$('s').value,S=+$('S').value;
    $('dO').textContent=d+' units'; $('LO').textContent=L+(L===1?' day':' days'); $('sO').textContent=sd+(sd===1?' day':' days'); $('SO').textContent='£'+S;
    const SS=d*sd, ROP=d*L+SS, D=d*365, Q=Math.max(1,Math.sqrt(2*D*S/H_COST));
    $('rROP').innerHTML=fmtN(ROP)+'<small>units</small>'; $('rEOQ').innerHTML=fmtN(Q)+'<small>units</small>'; $('rN').innerHTML=(D/Q).toFixed(1)+'<small>/ yr</small>';
    // simulate 60 days
    const days=60; let stock=Q+SS, pending=[], pts=[], orders=[], arrivals=[];
    for(let t=0;t<=days;t++){
      pending=pending.filter(o=>{ if(o<=t){stock+=Q;arrivals.push(t);return false;} return true;});
      pts.push([t,stock]);
      if(stock<=ROP && pending.length===0){pending.push(t+L);orders.push([t,stock]);}
      stock=Math.max(0,stock-d);
    }
    const maxY=Math.max(...pts.map(p=>p[1]),ROP)*1.12;
    const x0=44,x1=548,y0=196,y1=14, X=t=>x0+(x1-x0)*t/days, Y=v=>y0-(y0-y1)*v/maxY;
    let g='';
    const step=maxY>2000?1000:maxY>800?250:maxY>300?100:50;
    for(let v=0;v<=maxY;v+=step){g+=`<line class="ax" x1="${x0}" x2="${x1}" y1="${Y(v)}" y2="${Y(v)}" opacity=".5"/><text class="tx" x="${x0-6}" y="${Y(v)+3}" text-anchor="end">${fmtN(v)}</text>`;}
    for(let t=0;t<=days;t+=10){g+=`<text class="tx" x="${X(t)}" y="${y0+16}" text-anchor="middle">Day ${t}</text>`;}
    const path=pts.map((p,i)=>(i?'L':'M')+X(p[0]).toFixed(1)+' '+Y(p[1]).toFixed(1)).join(' ');
    g+=`<path class="area" d="${path} L${X(days)} ${y0} L${X(0)} ${y0} Z"/>`;
    g+=`<line class="ss" x1="${x0}" x2="${x1}" y1="${Y(SS)}" y2="${Y(SS)}"/>`;
    g+=`<line class="rop" x1="${x0}" x2="${x1}" y1="${Y(ROP)}" y2="${Y(ROP)}"/>`;
    g+=`<path class="stock" d="${path}"/>`;
    orders.forEach(o=>{g+=`<circle class="ord" cx="${X(o[0])}" cy="${Y(o[1])}" r="3.5"/>`;});
    g+=`<text class="lbl-rop" x="${x1}" y="${Y(ROP)-5}" text-anchor="end">ROP ${fmtN(ROP)}</text>`;
    if(SS>0) g+=`<text class="lbl-ss" x="${x1}" y="${Y(SS)+12}" text-anchor="end">Safety stock ${fmtN(SS)}</text>`;
    g+=`<line class="ax" x1="${x0}" x2="${x1}" y1="${y0}" y2="${y0}"/>`;
    $('saw').innerHTML=g;
  }
  if(hasCalc){ ['d','L','s','S'].forEach(id=>$(id).addEventListener('input',drawSaw)); drawSaw(); }

  /* skill filter */
  const fb=[...document.querySelectorAll('.filter')], sk=[...document.querySelectorAll('.skill')];
  fb.forEach(b=>b.addEventListener('click',()=>{ const f=b.dataset.f;
    fb.forEach(x=>x.setAttribute('aria-pressed',x===b));
    sk.forEach(s=>s.classList.toggle('dim',f!=='all'&&s.dataset.c!==f));
    document.querySelectorAll('.tools[data-c]').forEach(t=>{ t.hidden = f!=='all' && t.dataset.c!==f; }); }));

  /* copy email */
  const cb=$('copyBtn');
  if(cb) cb.addEventListener('click',()=>{ const txt=$('email').textContent;
    const done=()=>{cb.textContent='Copied';setTimeout(()=>cb.textContent='Copy',1600);};
    const fallback=()=>{const r=document.createRange();r.selectNodeContents($('email'));const s=getSelection();s.removeAllRanges();s.addRange(r);cb.textContent='Selected';setTimeout(()=>cb.textContent='Copy',1600);};
    try{ navigator.clipboard.writeText(txt).then(done,fallback);}catch(e){fallback();} });
})();
