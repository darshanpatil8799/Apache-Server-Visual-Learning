(() => {
'use strict';
const C = {blue:'#4da3ff', teal:'#2dd4bf', purple:'#a78bfa', gold:'#fbbf24', green:'#34d399', red:'#f87171', txt:'#e6edf7', mut:'#a3b1cc', sg:'#7dd3fc'};
const $ = s => document.querySelector(s);
const rm = matchMedia('(prefers-reduced-motion: reduce)');

/* ---------- SVG helpers ---------- */
const box = (x, y, w, h, o = {}) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.rx ?? 12}" fill="${o.fill || 'none'}" stroke="${o.stroke || C.mut}" stroke-width="${o.sw || 2}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}/>`;
const t = (x, y, s, o = {}) => `<text x="${x}" y="${y}" fill="${o.fill || C.txt}" font-size="${o.size || 14}" font-weight="${o.w || 500}" text-anchor="${o.a || 'start'}"${o.mono ? ' class="m"' : ''}>${s}</text>`;
const use = (id, color) => `<use href="#p-${id}" class="wire" stroke="${color}"/>`;

/* ---------- Moving-object icons (centred on 0,0) ---------- */
const ICON = {
  env:  `<rect x="-13" y="-9" width="26" height="18" rx="3" fill="${C.gold}"/><path d="M-13-9L0 2L13-9" fill="none" stroke="#7a5a00" stroke-width="2"/>`,
  doc:  `<rect x="-10" y="-13" width="20" height="26" rx="3" fill="#e6edf7"/><path d="M-6-6H6M-6-1H6M-6 4H2" stroke="#475569" stroke-width="2"/>`,
  ok:   `<circle r="13" fill="${C.green}"/><path d="M-6 0L-2 5L6-5" fill="none" stroke="#052e1c" stroke-width="3" stroke-linecap="round"/>`,
  pkg:  `<rect x="-12" y="-12" width="24" height="24" rx="3" fill="#c08a4a"/><path d="M0-12V12M-12 0H12" stroke="#6b4423" stroke-width="2"/>`,
  lock: `<rect x="-10" y="-3" width="20" height="15" rx="3" fill="${C.gold}"/><path d="M-6-3V-8A6 6 0 0 1 6-8V-3" fill="none" stroke="${C.gold}" stroke-width="3"/>`,
  x:    `<circle r="13" fill="${C.red}"/><path d="M-5-5L5 5M5-5L-5 5" stroke="#450a0a" stroke-width="3" stroke-linecap="round"/>`,
  mag:  `<circle cx="-2" cy="-2" r="8" fill="rgba(255,255,255,.15)" stroke="${C.txt}" stroke-width="3"/><path d="M4 4L12 12" stroke="${C.txt}" stroke-width="4" stroke-linecap="round"/>`
};

/* ---------- Dashed paths the objects travel along ---------- */
const PATHS = {
  ssh:  'M170 195 H420',
  pkg:  'M650 108 V250',
  doc:  'M900 120 V345 H860',
  lock: 'M300 300 H385',
  req:  'M170 435 H300 V300 H450',
  resp: 'M450 335 H262 V455 H170',
  fetch:'M740 345 H640',
  blk:  'M170 435 H300 V300 H378',
  mag:  'M430 497 H960'
};

/* ---------- Components: s = first step shown, e = last step shown ---------- */
const COMPS = [
  {id:'aws', s:1, svg:
    box(190,20,890,580,{stroke:C.blue,fill:'rgba(77,163,255,.06)',rx:20}) + t(210,50,'AWS Cloud: the cloud city',{size:17,w:700,fill:C.blue}) +
    box(215,62,840,520,{stroke:C.blue,dash:'8 6',fill:'rgba(77,163,255,.05)'}) + t(235,88,'VPC: your private street',{fill:C.blue}) +
    box(360,100,670,440,{stroke:C.blue,fill:'rgba(77,163,255,.08)'}) + t(380,126,'Public subnet',{fill:C.blue}) +
    t(285,243,'Internet Gateway',{a:'middle',fill:C.blue,w:700}) + box(235,255,100,100,{stroke:C.blue,fill:'rgba(77,163,255,.18)'}) +
    `<path d="M252 345V290a33 33 0 0 1 66 0V345" fill="none" stroke="${C.blue}" stroke-width="3"/>` +
    box(420,180,550,300,{stroke:C.teal,fill:'rgba(45,212,191,.10)',sw:3}) + t(435,472,'EC2: rented shop building (Amazon Linux 2023)',{fill:C.teal,w:700})},
  {id:'admin', s:2, svg:
    box(20,150,150,90,{stroke:C.mut,fill:'rgba(255,255,255,.05)'}) + t(95,178,'Administrator',{a:'middle',w:700}) + t(95,198,"Ravi's laptop",{a:'middle',size:13,fill:C.mut}) + t(95,220,'SSH / EC2 Connect',{a:'middle',size:12,fill:C.mut}) +
    use('ssh',C.teal) + t(290,186,'SSH, port 22',{a:'middle',size:12,fill:C.teal})},
  {id:'apache', s:3, svg:
    box(450,230,250,220,{stroke:C.purple,fill:'rgba(167,139,250,.14)',sw:3}) + t(575,257,'Apache HTTPD',{a:'middle',size:17,w:700,fill:C.purple}) + t(575,277,'the receptionist',{a:'middle',size:13,fill:C.mut})},
  {id:'stopped', s:3, e:3, svg: t(575,360,'installed, not running yet',{a:'middle',size:13,fill:C.mut})},
  {id:'running', s:4, svg:
    t(575,360,'active (running)',{a:'middle',size:14,fill:C.green,w:700}) + `<circle cx="478" cy="355" r="6" fill="${C.green}"/>` +
    t(575,395,'listening on port 80',{a:'middle',size:13}) + t(575,425,'systemctl = power controls',{a:'middle',size:12,fill:C.mut}) +
    `<rect x="443" y="305" width="14" height="40" rx="3" fill="${C.gold}"/>` + t(575,318,'port 80: the entrance',{a:'middle',size:12,fill:C.gold})},
  {id:'shelf', s:5, svg:
    box(740,260,200,120,{stroke:C.gold,fill:'rgba(251,191,36,.08)'}) + t(840,284,'DocumentRoot shelf',{a:'middle',size:13,w:700,fill:C.gold}) + t(840,303,'/var/www/html/',{a:'middle',size:12,mono:1,fill:C.mut}) +
    box(795,322,90,36,{stroke:C.txt,fill:'rgba(255,255,255,.12)',rx:6,sw:1.5}) + t(840,345,'index.html',{a:'middle',size:12,mono:1})},
  {id:'sg', s:6, svg:
    box(390,140,610,370,{stroke:C.sg,dash:'10 6',rx:16}) + t(405,162,'Security Group: door guard',{fill:C.sg,w:700}) +
    `<rect x="382" y="284" width="16" height="32" rx="3" fill="${C.sg}"/>` +
    box(720,190,240,52,{stroke:C.sg,fill:'rgba(125,211,252,.10)',rx:8,sw:1.5}) +
    t(732,210,'Open: HTTP 80 from anyone',{size:12,fill:C.green}) + t(732,230,'Open: SSH 22 from admin IP only',{size:12,fill:C.sg})},
  {id:'visitor', s:7, svg:
    t(95,330,'The Internet',{a:'middle',size:13,fill:C.mut}) +
    box(20,380,150,110,{stroke:C.gold,fill:'rgba(251,191,36,.07)'}) + t(95,398,'Visitor browser',{a:'middle',size:13,w:700}) +
    box(28,406,134,20,{stroke:C.mut,rx:5,sw:1}) + t(95,421,'http://PUBLIC-IP',{a:'middle',size:12,mono:1,fill:C.gold}) +
    box(28,432,134,50,{stroke:C.mut,rx:5,sw:1,fill:'rgba(255,255,255,.04)'}) +
    use('req',C.gold) + t(180,424,'HTTP request',{size:12,fill:C.gold}) +
    t(435,200,'Public IPv4: the shop address',{size:13,fill:C.teal})},
  {id:'wait', s:7, e:7, svg: t(95,462,'waiting...',{a:'middle',size:12,fill:C.mut})},
  {id:'reply', s:8, svg: use('resp',C.green) + t(180,478,'HTTP 200 OK',{size:12,fill:C.green,w:700})},
  {id:'page', s:8, svg: t(95,454,'Welcome to',{a:'middle',size:12,w:700}) + t(95,472,'Ravi Shop',{a:'middle',size:12,w:700})},
  {id:'logs', s:9, svg:
    box(740,400,200,58,{stroke:C.mut,rx:8,sw:1.5,fill:'rgba(255,255,255,.05)'}) + t(840,421,'access_log: visitor register',{a:'middle',size:12}) + t(840,444,'error_log: problem register',{a:'middle',size:12,fill:C.red}) +
    t(380,528,'Check: status, port 80, localhost, security group, public IP, route table, logs',{size:12,fill:C.mut})},
  {id:'chain', s:10, svg:
    t(380,566,'Visitor, Internet, Gateway, Subnet, Security Group, EC2, Apache, index.html, Response',{size:12,fill:C.green}) +
    box(790,32,276,26,{stroke:C.gold,rx:13,sw:1.5,fill:'rgba(251,191,36,.12)'}) + t(928,50,'Next: HTTPS + your own domain name',{a:'middle',size:12,fill:C.gold})}
];

/* ---------- Moving objects per step ---------- */
function movers(step, phase) {
  switch (step) {
    case 2: return [{path:'ssh', icon:'lock', dur:3.5, pos:'420 195'}];
    case 3: return [{path:'pkg', icon:'pkg', dur:3, pos:'650 250'}];
    case 5: return [{path:'doc', icon:'doc', dur:3.5, pos:'860 345'}];
    case 6: return [{path:'lock', icon:'lock', dur:2.5, pos:'385 300'}];
    case 7: return [{path:'req', icon:'env', dur:4, pos:'450 300'}];
    case 8: return [
      {path:'req', icon:'env', dur:7, win:[0,.3], pos:'450 300'},
      {path:'fetch', icon:'doc', dur:7, win:[.32,.5], pos:'640 345'},
      {path:'resp', icon:'ok', dur:7, win:[.52,1], pos:'170 455'}];
    case 9: return phase === 0
      ? [{path:'blk', icon:'env', dur:4, win:[0,.65], pos:'378 300'},
         {raw:`<g transform="translate(398 300)">${rm.matches ? '' : '<animate attributeName="opacity" calcMode="discrete" values="0;1;0" keyTimes="0;.68;.98" dur="4s" repeatCount="indefinite"/>'}${ICON.x}</g>`},
         {path:'mag', icon:'mag', dur:8, pos:'700 497'}]
      : [{path:'req', icon:'env', dur:6, win:[0,.45], pos:'450 300'},
         {path:'resp', icon:'ok', dur:6, win:[.5,1], pos:'170 455'},
         {path:'mag', icon:'mag', dur:8, pos:'700 497'}];
    case 10: return [
      {path:'req', icon:'env', dur:9, win:[0,.28], pos:'450 300'},
      {path:'fetch', icon:'doc', dur:9, win:[.3,.42], pos:'640 345'},
      {path:'resp', icon:'ok', dur:9, win:[.45,1], pos:'170 455'}];
    default: return [];
  }
}
function mover(m) {
  if (m.raw) return m.raw;
  const [a, b] = m.win || [0, 1];
  if (rm.matches) return `<g transform="translate(${m.pos})">${ICON[m.icon]}</g>`;
  return `<g><animateMotion dur="${m.dur}s" repeatCount="indefinite" calcMode="linear" keyPoints="0;0;1;1" keyTimes="0;${a};${b};1"><mpath href="#p-${m.path}"/></animateMotion>` +
    `<animate attributeName="opacity" calcMode="discrete" values="0;1;0" keyTimes="0;${a};${b}" dur="${m.dur}s" repeatCount="indefinite"/>${ICON[m.icon]}</g>`;
}

/* ---------- Step content ---------- */
const STEPS = [
  {t:'AWS Cloud and EC2', sub:'Rent a shop in the cloud city',
   plain:'Ravi wants an online shop. AWS is a huge cloud city, and he rents a building there. That building is an EC2 instance, a small computer you rent by the hour, running Amazon Linux, the shop operating system.',
   tech:'EC2 runs inside a VPC (a private virtual network). A public subnet has a route to the Internet Gateway, so instances with a public IPv4 address can talk to the internet. We launch one EC2 instance with Amazon Linux 2023.',
   cmd:['# Console: EC2 > Launch instance','# AMI: Amazon Linux 2023','# Type: t3.micro (or free-tier eligible)','# Network: VPC + public subnet, auto-assign public IPv4: Enable'],
   watch:'The cloud, VPC, public subnet, Internet Gateway and the teal EC2 building fade in.'},
  {t:'Connect to EC2', sub:'Ravi walks into the shop',
   plain:'Before Ravi can set anything up, he needs to get inside his own shop. He uses a secure remote connection, like a private key to the back door.',
   tech:'SSH on port 22 with your key pair, or EC2 Instance Connect from the AWS console. The default user on Amazon Linux is ec2-user.',
   cmd:['chmod 400 my-key.pem','ssh -i my-key.pem ec2-user@PUBLIC-IP'],
   watch:'A gold lock (secure login) travels along the dashed line from the administrator to the EC2 building.'},
  {t:'Install Apache HTTPD', sub:'Hire the receptionist',
   plain:'Ravi hires a receptionist: Apache. The package manager delivers Apache to the shop like a parcel.',
   tech:'dnf is the package manager on Amazon Linux 2023. The httpd package installs the Apache HTTP Server, its config in /etc/httpd and logs in /var/log/httpd.',
   cmd:['sudo dnf update -y','sudo dnf install httpd -y'],
   watch:'A package drops from above into the purple Apache box. It is installed but not running yet.'},
  {t:'Start and enable Apache', sub:'Switch the power on',
   plain:'The receptionist is hired but asleep. systemctl is the power control: start turns Apache on now, enable makes it turn on by itself after every reboot.',
   tech:'systemd manages the httpd service. "enable --now" does both: starts the service and enables it at boot. Apache then listens on TCP port 80 for HTTP.',
   cmd:['sudo systemctl enable --now httpd','sudo systemctl status httpd'],
   watch:'The status turns green, "active (running)", and a gold door marks port 80 on the Apache box.'},
  {t:'Create the website file', sub:'Put the welcome page on the shelf',
   plain:'Apache serves whatever is on its storage shelf. Ravi places a welcome page there: index.html.',
   tech:'The default DocumentRoot is /var/www/html. When a visitor asks for /, Apache looks for index.html in that folder. Writing there needs sudo.',
   cmd:["echo '<h1>Welcome to Ravi Shop</h1>' | sudo tee /var/www/html/index.html",'ls -l /var/www/html/'],
   watch:'A document slides down onto the DocumentRoot shelf and index.html appears.'},
  {t:'Configure the Security Group', sub:'Brief the door guard',
   plain:'The door guard decides who may enter. Visitors may use the public entrance (port 80). Only Ravi, from his own address, may use the staff door (SSH, port 22).',
   tech:'A Security Group is a stateful virtual firewall on the instance. Inbound rules: HTTP TCP 80 from 0.0.0.0/0, SSH TCP 22 from your IP /32. Everything not allowed is denied, and replies to allowed requests flow back automatically.',
   cmd:['# EC2 > Security Groups > Inbound rules > Edit','# Type: HTTP   Protocol: TCP  Port: 80  Source: 0.0.0.0/0','# Type: SSH    Protocol: TCP  Port: 22  Source: MY IP (x.x.x.x/32)'],
   watch:'A dashed guard border wraps the EC2 building with a door, and a lock checks who gets through.'},
  {t:'Public IP and browser', sub:'A visitor finds the shop address',
   plain:'A customer types the shop address into the browser. The request, an envelope, travels from the internet through the main entrance and down the street to the shop.',
   tech:'The browser opens a TCP connection to PUBLIC-IP:80 and sends an HTTP GET request. Traffic enters the VPC through the Internet Gateway, crosses the public subnet, and is checked by the Security Group before it reaches the instance.',
   cmd:['# Find the address: EC2 > Instances > Public IPv4 address','http://PUBLIC-IP'],
   watch:'A gold envelope leaves the visitor browser, passes the Internet Gateway, and arrives at Apache.'},
  {t:'Apache serves the website', sub:'The receptionist delivers the page',
   plain:'The receptionist reads the request, fetches the welcome page from the shelf, and hands it back with a stamp that says everything is fine: 200 OK.',
   tech:'Apache maps / to /var/www/html/index.html, reads the file, and returns an HTTP/1.1 200 OK response with the HTML body. The browser renders it.',
   cmd:['curl -i http://localhost','# HTTP/1.1 200 OK','# <h1>Welcome to Ravi Shop</h1>'],
   watch:'The envelope arrives, a document is fetched from the shelf, and a green check carries the response back. The page appears in the browser.'},
  {t:'Monitoring and troubleshooting', sub:'Check the registers, fix the guard',
   plain:'If visitors cannot get in, Ravi checks things in order: is the receptionist awake, is the entrance open, does the shop work from inside, is the door guard blocking, is the address right? The visitor register and problem register tell the story.',
   tech:'Work from the inside out. Service status, port listener, localhost test, then Security Group, public IP and route table (0.0.0.0/0 to the Internet Gateway). Logs: journalctl for the service, access_log for requests, error_log for problems.',
   cmd:['sudo systemctl status httpd',"sudo ss -tlnp | grep ':80'",'curl http://localhost','sudo journalctl -u httpd','sudo tail -f /var/log/httpd/access_log','sudo tail -f /var/log/httpd/error_log'],
   watch:'First a request is stopped at the door by a red cross (port 80 closed). After the Security Group is fixed, the request succeeds. A magnifying glass inspects the shop.'},
  {t:'Complete architecture', sub:'The whole working path',
   plain:'Now the whole story fits in one picture: a visitor asks, the request enters the cloud city, passes the guard, meets the receptionist, who fetches the welcome page and sends it back.',
   tech:'Visitor, Internet, Internet Gateway, public subnet, Security Group, EC2, Apache HTTPD, index.html, HTTP response, visitor. For production, add HTTPS (TLS certificate, port 443) and a domain name (for example with Route 53) instead of a bare IP address.',
   cmd:['# Optional production improvements','# HTTPS: sudo dnf install mod_ssl -y  (plus a real certificate)','# Domain: point an A record to your Elastic IP'],
   watch:'The complete round trip loops: envelope in, page fetched, green check out. A gold pill suggests HTTPS and a domain name.'}
];
const LEGEND = [['env','HTTP request'],['doc','HTML file'],['ok','HTTP 200 response'],['pkg','Apache installation'],['lock','Security filtering'],['x','Blocked connection'],['mag','Troubleshooting']];

/* ---------- Rendering ---------- */
let cur = 1, glow = true, phase = 0, playT = null, phaseT = null;

function draw() {
  const defs = '<defs>' + Object.entries(PATHS).map(([k, d]) => `<path id="p-${k}" d="${d}"/>`).join('') + '</defs>';
  const comps = COMPS.filter(c => cur >= c.s && cur <= (c.e || 99)).map(c => {
    const isNew = glow && c.s === cur;
    return `<g class="${isNew ? 'new' : ''}">${c.svg}</g>`;
  }).join('');
  const banner = cur === 9 ? (phase === 0
    ? t(1010,126,'Blocked: port 80 is closed',{a:'end',size:13,fill:C.red,w:700})
    : t(1010,126,'Fixed: port 80 is open',{a:'end',size:13,fill:C.green,w:700})) : '';
  $('#scene').innerHTML = defs + comps + banner + movers(cur, phase).map(mover).join('');
}

function caption() {
  const s = STEPS[cur - 1];
  $('#c-title').textContent = `Step ${cur}: ${s.t}`;
  $('#c-plain').textContent = s.plain;
  $('#c-tech').textContent = s.tech;
  $('#c-cmd').textContent = s.cmd.join('\n');
  $('#c-watch').textContent = s.watch;
  $('#count').textContent = `Step ${cur} of ${STEPS.length}`;
  document.querySelectorAll('.step').forEach((b, i) => {
    b.classList.toggle('done', i + 1 < cur);
    if (i + 1 === cur) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
  });
  $('#prev').disabled = cur === 1;
  $('#next').disabled = cur === STEPS.length;
}

function runPhase() {
  clearTimeout(phaseT);
  if (cur !== 9) return;
  phaseT = setTimeout(() => { phase = phase ? 0 : 1; glow = false; draw(); runPhase(); }, phase === 0 ? 4000 : 6000);
}

function go(n) {
  cur = Math.max(1, Math.min(STEPS.length, n));
  phase = 0; glow = true;
  draw(); caption(); runPhase();
}

function setPlay(on) {
  clearInterval(playT);
  const b = $('#play');
  b.setAttribute('aria-pressed', String(on));
  b.textContent = on ? 'Pause' : 'Auto-play';
  if (on) playT = setInterval(() => {
    if (cur >= STEPS.length) { setPlay(false); return; }
    go(cur + 1);
  }, 5000);
}

function init() {
  $('#steps').innerHTML = STEPS.map((s, i) => `<li><button type="button" class="step" data-i="${i + 1}"><span class="n">${i + 1}</span><span><b>${s.t}</b><small>${s.sub}</small></span></button></li>`).join('');
  $('#legend').innerHTML = LEGEND.map(([k, l]) => `<li><svg width="28" height="28" viewBox="-16 -16 32 32" aria-hidden="true">${ICON[k]}</svg>${l}</li>`).join('');
  $('#steps').addEventListener('click', e => { const b = e.target.closest('.step'); if (b) { setPlay(false); go(+b.dataset.i); } });
  $('#prev').onclick = () => { setPlay(false); go(cur - 1); };
  $('#next').onclick = () => { setPlay(false); go(cur + 1); };
  $('#reset').onclick = () => { setPlay(false); go(1); };
  $('#play').onclick = () => { const on = $('#play').getAttribute('aria-pressed') !== 'true'; if (on && cur >= STEPS.length) go(1); setPlay(on); };
  $('#theme').onclick = () => {
    const d = document.documentElement, next = d.dataset.theme === 'dark' ? 'light' : 'dark';
    d.dataset.theme = next; try { localStorage.setItem('avs-theme', next); } catch (e) { /* ignore */ }
  };
  let saved = null; try { saved = localStorage.getItem('avs-theme'); } catch (e) { /* ignore */ }
  document.documentElement.dataset.theme = saved || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  rm.addEventListener('change', () => { glow = false; draw(); });
  document.addEventListener('keydown', e => {
    if (e.target.closest('button')) return;
    if (e.key === 'ArrowRight') go(cur + 1); else if (e.key === 'ArrowLeft') go(cur - 1);
  });
  go(1);
}
init();
})();
