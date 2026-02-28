// Constants
const POS7_NAMES = ['LOOSEHEAD PROP', 'HOOKER', 'TIGHTHEAD PROP', 'SECOND ROW', 'SECOND ROW', 'BLINDSIDE FLANKER', 'OPENSIDE FLANKER'];
const POS15_NAMES = ['LOOSEHEAD PROP', 'HOOKER', 'TIGHTHEAD PROP', 'LOCK', 'LOCK', 'BLINDSIDE FLANKER', 'OPENSIDE FLANKER', 'EIGHTH MAN', 'SCRUM HALF', 'FLY HALF', 'LEFT WING', 'INSIDE CENTRE', 'OUTSIDE CENTRE', 'RIGHT WING', 'FULLBACK'];

// Variables
let rugbyFormat = '15s';
let currentMode = 'team';
let layoutStyle = 'list';
let currentFormat = 'post';
let deviceMode = 'desktop';
let styleOptions = {
    headerSize: 40,
    nameSize: 24,
    spacing: 52,
    circleRadius: 40,
    overlay: 70,
    shadow: 2,
    showGrid: false
};
let isWhiteTheme = false;
let showResult = false;
let resultText = 'WIN';
let useDefaultLogo = false;
let defaultLogoLoaded = false;
let logoLoaded = false;
let bgLoaded = false;
let canvas, ctx;
let bgImage = new Image();
let logoImage = new Image();
let defaultLogoImage = new Image();

// Data functions
function getPlayerCount(){
    return rugbyFormat === '7s' ? 7 : 15;
}

function getSubCount(){
    return rugbyFormat === '7s' ? 3 : 8;
}

function getSubStart(){
    return rugbyFormat === '7s' ? 8 : 16;
}

function getPlayers(){
    if(!window.players) window.players = Array(getPlayerCount()).fill().map((_,i) => ({name: '', role: 'none'}));
    return window.players;
}

function getSubs(){
    if(!window.subs) window.subs = Array(getSubCount()).fill('');
    return window.subs;
}

// Layouts
function buildLayouts(){
    const layouts = {
        post: {
            teamList: {
                logo: {x: 540, y: 100, w: 200},
                header: {x: 540, y: 350},
                opponent: {x: 540, y: 420},
                result: {x: 540, y: 500},
                list: {x: 100, y: 600},
                subsTitle: {x: 100, y: 900},
                subsList: {x: 100, y: 950}
            },
            teamPitch: {
                logo: {x: 540, y: 100, w: 200},
                header: {x: 540, y: 350},
                opponent: {x: 540, y: 420},
                result: {x: 540, y: 500},
                positions: [
                    {x: 200, y: 650}, {x: 540, y: 650}, {x: 880, y: 650},
                    {x: 370, y: 750}, {x: 710, y: 750},
                    {x: 200, y: 850}, {x: 540, y: 850}, {x: 880, y: 850},
                    {x: 540, y: 950}, {x: 200, y: 1050}, {x: 540, y: 1050},
                    {x: 370, y: 1150}, {x: 710, y: 1150},
                    {x: 200, y: 1250}, {x: 880, y: 1250}, {x: 540, y: 1350}
                ],
                subsTitle: {x: 540, y: 1100},
                subsList: {x: 540, y: 1150}
            },
            teamList7: {
                logo: {x: 540, y: 100, w: 200},
                header: {x: 540, y: 350},
                opponent: {x: 540, y: 420},
                result: {x: 540, y: 500},
                list: {x: 100, y: 600},
                subsTitle: {x: 100, y: 900},
                subsList: {x: 100, y: 950}
            },
            teamPitch7: {
                logo: {x: 540, y: 100, w: 200},
                header: {x: 540, y: 350},
                opponent: {x: 540, y: 420},
                result: {x: 540, y: 500},
                positions: [
                    {x: 200, y: 650}, {x: 540, y: 650}, {x: 880, y: 650},
                    {x: 370, y: 750}, {x: 710, y: 750},
                    {x: 200, y: 850}, {x: 880, y: 850}
                ],
                subsTitle: {x: 540, y: 1100},
                subsList: {x: 540, y: 1150}
            },
            score: {
                logo: {x: 540, y: 100, w: 200},
                opponent: {x: 540, y: 350},
                result: {x: 540, y: 420},
                scoreBig: {x: 540, y: 600},
                scoreSub: {x: 540, y: 750},
                details: {x: 540, y: 850}
            }
        },
        story: {
            teamList: {
                logo: {x: 540, y: 100, w: 200},
                header: {x: 540, y: 350},
                opponent: {x: 540, y: 420},
                result: {x: 540, y: 500},
                list: {x: 100, y: 600},
                subsTitle: {x: 100, y: 900},
                subsList: {x: 100, y: 950}
            },
            teamPitch: {
                logo: {x: 540, y: 100, w: 200},
                header: {x: 540, y: 350},
                opponent: {x: 540, y: 420},
                result: {x: 540, y: 500},
                positions: [
                    {x: 200, y: 650}, {x: 540, y: 650}, {x: 880, y: 650},
                    {x: 370, y: 750}, {x: 710, y: 750},
                    {x: 200, y: 850}, {x: 540, y: 850}, {x: 880, y: 850},
                    {x: 540, y: 950}, {x: 200, y: 1050}, {x: 540, y: 1050},
                    {x: 370, y: 1150}, {x: 710, y: 1150},
                    {x: 200, y: 1250}, {x: 880, y: 1250}, {x: 540, y: 1350}
                ],
                subsTitle: {x: 540, y: 1100},
                subsList: {x: 540, y: 1150}
            },
            teamList7: {
                logo: {x: 540, y: 100, w: 200},
                header: {x: 540, y: 350},
                opponent: {x: 540, y: 420},
                result: {x: 540, y: 500},
                list: {x: 100, y: 600},
                subsTitle: {x: 100, y: 900},
                subsList: {x: 100, y: 950}
            },
            teamPitch7: {
                logo: {x: 540, y: 100, w: 200},
                header: {x: 540, y: 350},
                opponent: {x: 540, y: 420},
                result: {x: 540, y: 500},
                positions: [
                    {x: 200, y: 650}, {x: 540, y: 650}, {x: 880, y: 650},
                    {x: 370, y: 750}, {x: 710, y: 750},
                    {x: 200, y: 850}, {x: 880, y: 850}
                ],
                subsTitle: {x: 540, y: 1100},
                subsList: {x: 540, y: 1150}
            },
            score: {
                logo: {x: 540, y: 100, w: 200},
                opponent: {x: 540, y: 350},
                result: {x: 540, y: 420},
                scoreBig: {x: 540, y: 600},
                scoreSub: {x: 540, y: 750},
                details: {x: 540, y: 850}
            }
        }
    };
    return layouts;
}

let layouts = buildLayouts();

// Build player input rows
function buildPlayerRows(){
    const c = document.getElementById('playersContainer');
    c.innerHTML = '';
    const players = getPlayers();
    const n = getPlayerCount();
    const is7 = rugbyFormat === '7s';
    for(let i=0; i<n; i++){
        const d = document.createElement('div');
        d.className = 'flex gap-2 items-center group h-7 player-row';
        const ph = is7 ? POS7_NAMES[i] : 'Pos '+(i+1);
        const p = players[i];
        d.innerHTML = '<div class="w-5 text-center font-bold text-slate-500 font-mono" style="font-size:10px">' + String(i+1).padStart(2,'0') + '</div>' +
            '<input type="text" data-index="' + i + '" class="player-input flex-1 h-full px-2 rounded font-bold uppercase placeholder-slate-600" style="font-size:10px" placeholder="' + ph + '" value="' + p.name + '">' +
            '<div class="flex h-full rounded border border-slate-700 overflow-hidden">' +
                '<button class="role-btn role-c w-6 hover:z-10' + (p.role==='C' ? ' active-c' : '') + '" onclick="toggleRole(' + i + ',\'C\',this)">C</button>' +
                '<button class="role-btn role-vc w-6 border-l border-slate-700 hover:z-10' + (p.role==='VC' ? ' active-vc' : '') + '" onclick="toggleRole(' + i + ',\'VC\',this)">VC</button>' +
            '</div>';
        c.appendChild(d);
    }
    c.querySelectorAll('.player-input').forEach(inp => {
        inp.addEventListener('input', e => {
            getPlayers()[+e.target.dataset.index].name = e.target.value;
            drawCanvas();
        });
    });
}

// Build sub input rows
function buildSubRows(){
    const c = document.getElementById('subsContainer');
    c.innerHTML = '';
    const subs = getSubs();
    const n = getSubCount();
    const start = getSubStart();
    for(let i=0; i<n; i++){
        const d = document.createElement('div');
        d.className = 'flex gap-2 items-center h-7 sub-row';
        d.innerHTML = '<div class="w-5 text-center font-bold text-slate-500 font-mono" style="font-size:10px">' + (start+i) + '</div>' +
            '<input type="text" data-sub-index="' + i + '" class="sub-input flex-1 h-full px-2 rounded font-bold uppercase placeholder-slate-600" style="font-size:10px" placeholder="Sub Name" value="' + subs[i] + '">';
        c.appendChild(d);
    }
    c.querySelectorAll('.sub-input').forEach(inp => {
        inp.addEventListener('input', e => {
            getSubs()[+e.target.dataset.subIndex] = e.target.value;
            drawCanvas();
        });
    });
}

// Switch rugby format
function switchRugbyFormat(fmt){
    rugbyFormat = fmt;
    document.getElementById('tab15s').className = 'mode-tab' + (fmt==='15s' ? ' active' : '');
    document.getElementById('tab7s').className = 'mode-tab' + (fmt==='7s' ? ' active' : '');
    document.getElementById('startingTitle').textContent = fmt==='7s' ? 'Starting VII' : 'Starting XV';
    buildPlayerRows();
    buildSubRows();
    drawCanvas();
}

// Get current layout
function getCurrentLayout(){
    const modeKey = currentMode === 'team' ? (layoutStyle === 'list' ? 'teamList' : 'teamPitch') + (rugbyFormat === '7s' ? '7' : '') : 'score';
    return layouts[currentFormat][modeKey];
}

// Get mouse position on canvas
function getMousePos(evt){
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    return {x: (evt.clientX - rect.left) * scaleX, y: (evt.clientY - rect.top) * (canvas.height / rect.height)};
}

// Get hit target for drag
function getHitTarget(x, y){
    const L = getCurrentLayout();
    if(x > L.logo.x && x < L.logo.x + L.logo.w && y > L.logo.y && y < L.logo.y + L.logo.h) return {type: 'logo'};
    if(showResult && y > L.result.y - 40 && y < L.result.y + 40) return {type: 'result'};
    if(currentMode === 'team'){
        if(y > L.header.y - 60 && y < L.header.y + 10) return {type: 'header'};
        if(y > L.opponent.y - 30 && y < L.opponent.y + 10) return {type: 'opponent'};
        if(layoutStyle === 'pitch'){
            const pc = getPlayerCount();
            for(let i=0; i<pc; i++){
                const p = L.positions[i];
                if(Math.abs(x - p.x) < 40 && Math.abs(y - p.y) < 40) return {type: 'position', index: i};
            }
        } else {
            if(y > L.list.y - 20 && y < L.list.y + (52*getPlayerCount())) return {type: 'list'};
        }
        if(y > L.subsList.y - 30 && y < L.subsList.y + 100) return {type: 'subsList'};
    } else {
        if(y > L.opponent.y - 40 && y < L.opponent.y + 10) return {type: 'opponent'};
        if(y > L.scoreBig.y - 60 && y < L.scoreBig.y + 20) return {type: 'scoreBig'};
        if(y > L.details.y - 20 && y < L.details.y + 300) return {type: 'details'};
    }
    return null;
}

// Drag state
let isDragging = false, dragTarget = null, dragIndex = -1, dragStart = {x:0,y:0}, elStart = {x:0,y:0};

// Canvas event listeners
canvas.addEventListener('mousedown', e => {
    const pos = getMousePos(e);
    const hit = getHitTarget(pos.x, pos.y);
    if(hit){
        isDragging = true;
        dragTarget = hit.type;
        dragIndex = hit.index;
        dragStart = pos;
        const L = getCurrentLayout();
        if(hit.type === 'position') elStart = {...L.positions[dragIndex]};
        else elStart = {x: L[hit.type].x, y: L[hit.type].y};
    }
});

canvas.addEventListener('mousemove', e => {
    if(isDragging && dragTarget){
        const pos = getMousePos(e);
        const L = getCurrentLayout();
        if(dragTarget === 'position'){
            L.positions[dragIndex].x = elStart.x + (pos.x - dragStart.x);
            L.positions[dragIndex].y = elStart.y + (pos.y - dragStart.y);
        } else {
            L[dragTarget].x = elStart.x + (pos.x - dragStart.x);
            L[dragTarget].y = elStart.y + (pos.y - dragStart.y);
        }
        drawCanvas();
    }
});

canvas.addEventListener('mouseup', () => { isDragging = false; dragTarget = null; });

// UI functions
function setMode(mode){
    currentMode = mode;
    document.getElementById('tabTeam').className = 'mode-tab' + (mode === 'team' ? ' active' : '');
    document.getElementById('tabScore').className = 'mode-tab' + (mode === 'score' ? ' active' : '');
    document.getElementById('controlsTeam').classList.toggle('hidden', mode !== 'team');
    document.getElementById('controlsScore').classList.toggle('hidden', mode !== 'score');
    drawCanvas();
}

function setDevice(mode){
    deviceMode = mode;
    const shell = document.getElementById('previewShell');
    if(mode === 'mobile') shell.classList.add('mobile-frame');
    else shell.classList.remove('mobile-frame');
    setFormat(mode === 'desktop' ? 'post' : 'story', false);
    document.getElementById('btnDeviceDesktop').className = 'flex-1 py-1 text-[9px] font-bold rounded' + (mode==='desktop'?' bg-amber-500 text-black':' text-slate-400 hover:text-white');
    document.getElementById('btnDeviceMobile').className = 'flex-1 py-1 text-[9px] font-bold rounded' + (mode==='mobile'?' bg-amber-500 text-black':' text-slate-400 hover:text-white');
}

function setFormat(format, syncDevice = true){
    currentFormat = format;
    const H = format === 'post' ? 1350 : 1920;
    canvas.height = H;
    document.getElementById('btnPost').className = 'flex-1 py-1 text-[9px] font-bold rounded' + (format==='post'?' bg-amber-500 text-black':' text-slate-400 hover:text-white');
    document.getElementById('btnStory').className = 'flex-1 py-1 text-[9px] font-bold rounded' + (format==='story'?' bg-amber-500 text-black':' text-slate-400 hover:text-white');
    if(syncDevice){
        deviceMode = format === 'post' ? 'desktop' : 'mobile';
        document.getElementById('btnDeviceDesktop').className = 'flex-1 py-1 text-[9px] font-bold rounded' + (deviceMode==='desktop'?' bg-amber-500 text-black':' text-slate-400 hover:text-white');
        document.getElementById('btnDeviceMobile').className = 'flex-1 py-1 text-[9px] font-bold rounded' + (deviceMode==='mobile'?' bg-amber-500 text-black':' text-slate-400 hover:text-white');
        const shell = document.getElementById('previewShell');
        if(shell) shell.classList.toggle('mobile-frame', deviceMode === 'mobile');
    }
    drawCanvas();
}

function setLayoutStyle(style){
    layoutStyle = style;
    document.getElementById('btnList').className = 'flex-1 py-1 text-[9px] font-bold rounded' + (style==='list'?' bg-amber-500 text-black':' text-slate-400 hover:text-white');
    document.getElementById('btnPitch').className = 'flex-1 py-1 text-[9px] font-bold rounded' + (style==='pitch'?' bg-amber-500 text-black':' text-slate-400 hover:text-white');
    drawCanvas();
}

function updateStyle(key, val){
    const numVal = parseFloat(val);
    styleOptions[key] = isNaN(numVal) ? val : numVal;
    if(key === 'headerSize') document.getElementById('labelHeaderSize').innerText = styleOptions.headerSize + 'px';
    if(key === 'nameSize') document.getElementById('labelNameSize').innerText = styleOptions.nameSize + 'px';
    if(key === 'spacing') document.getElementById('labelSpacing').innerText = styleOptions.spacing + 'px';
    if(key === 'circleRadius') document.getElementById('labelRadius').innerText = styleOptions.circleRadius + 'px';
    if(key === 'overlay') document.getElementById('labelOverlay').innerText = styleOptions.overlay + '%';
    if(key === 'shadow') document.getElementById('labelShadow').innerText = styleOptions.shadow + 'px';
    drawCanvas();
}

function toggleGrid(){
    styleOptions.showGrid = document.getElementById('gridToggle').checked;
    drawCanvas();
}

function toggleSettings(show){
    const overlay = document.getElementById('settingsOverlay');
    const drawer = document.getElementById('settingsDrawer');
    const target = show ?? overlay.classList.contains('hidden');
    if(target){
        overlay.classList.remove('hidden');
        requestAnimationFrame(() => drawer.classList.remove('hidden-drawer'));
        document.body.style.overflow = 'hidden';
    } else {
        drawer.classList.add('hidden-drawer');
        setTimeout(() => overlay.classList.add('hidden'), 250);
        document.body.style.overflow = 'auto';
    }
}

function toggleKit(){
    isWhiteTheme = document.getElementById('kitToggle').checked;
    drawCanvas();
}

function toggleResult(){
    showResult = document.getElementById('resultToggle').checked;
    document.getElementById('resultControls').style.opacity = showResult ? 1 : 0.5;
    document.getElementById('resultControls').style.pointerEvents = showResult ? 'auto' : 'none';
    drawCanvas();
}

function setResult(res){
    resultText = res;
    drawCanvas();
}

function toggleDefaultLogo(){
    useDefaultLogo = document.getElementById('defaultLogoToggle').checked;
    if(useDefaultLogo && !defaultLogoLoaded){
        defaultLogoImage.onload = () => { defaultLogoLoaded = true; drawCanvas(); };
        defaultLogoImage.src = 'logo.png';
    }
    drawCanvas();
}

function resetLayout(){
    layouts = buildLayouts();
    drawCanvas();
}

function processPaste(){
    const lines = document.getElementById('pasteArea').value.split(/\r?\n/).filter(l => l.trim() !== '');
    const players = getPlayers();
    const subs = getSubs();
    const pc = getPlayerCount();
    const sc = getSubCount();
    for(let i=0; i<pc; i++){
        if(lines[i]){
            players[i].name = lines[i].replace(/^\d+[\.\)\s]+/, '').trim();
            document.querySelector('input[data-index="' + i + '"]').value = players[i].name;
        }
    }
    if(lines.length > pc){
        for(let i=0; i<sc; i++){
            if(lines[pc+i]){
                subs[i] = lines[pc+i].replace(/^\d+[\.\)\s]+/, '').trim();
                document.querySelector('input[data-sub-index="' + i + '"]').value = subs[i];
            }
        }
    }
    drawCanvas();
}

window.toggleRole = function(idx, role, btn){
    const players = getPlayers();
    players[idx].role = (players[idx].role === role) ? 'none' : role;
    const p = btn.parentElement;
    p.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active-c', 'active-vc'));
    if(players[idx].role === 'C') p.querySelector('.role-c').classList.add('active-c');
    if(players[idx].role === 'VC') p.querySelector('.role-vc').classList.add('active-vc');
    drawCanvas();
}

// File input listeners
document.getElementById('bgInput').addEventListener('change', e => {
    const f = e.target.files[0];
    if(f){
        const r = new FileReader();
        r.onload = evt => {
            bgImage.onload = () => { bgLoaded = true; drawCanvas(); };
            bgImage.src = evt.target.result;
        };
        r.readAsDataURL(f);
    }
});

document.getElementById('logoInput').addEventListener('change', e => {
    const f = e.target.files[0];
    if(f){
        const r = new FileReader();
        r.onload = evt => {
            logoImage.onload = () => { logoLoaded = true; drawCanvas(); };
            logoImage.src = evt.target.result;
        };
        r.readAsDataURL(f);
    }
});

document.addEventListener('keydown', e => { if(e.key === 'Escape') toggleSettings(false); });

function downloadImage(){
    try {
        const link = document.createElement('a');
        link.download = 'Merchiston_Rugby_' + currentMode + '_' + Date.now() + '.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch(e) {
        alert('Download failed. Use a local server or check browser permissions.');
    }
}

// Main draw function
function drawCanvas(){
    const W = 1080;
    const H = currentFormat === 'post' ? 1350 : 1920;
    const userAccent = document.getElementById('accentColor').value;
    const userText = document.getElementById('textColor').value;
    const userTint = (document.getElementById('overlayColor')?.value) || '#0f172a';
    const badgeFill = (document.getElementById('badgeColor')?.value) || (isWhiteTheme ? '#cbd5e1' : '#1e293b');
    const overlayStrength = (styleOptions.overlay || 70) / 100;
    const L = getCurrentLayout();
    const players = getPlayers();
    const subs = getSubs();
    const pc = getPlayerCount();
    const sc = getSubCount();

    const C = isWhiteTheme ? {
        bg: '#e2e8f0',
        tint: hexToRgba(userTint, overlayStrength * 0.6),
        gradStart: hexToRgba(userTint, overlayStrength * 0.45),
        gradEnd: hexToRgba(userTint, overlayStrength),
        textMain: userText, textSub: '#475569', gold: userAccent, grid: 'rgba(0,0,0,0.12)',
        resWin: '#166534', resLoss: '#991b1b', resDraw: '#475569'
    } : {
        bg: '#0f172a',
        tint: hexToRgba(userTint, overlayStrength * 0.4),
        gradStart: hexToRgba(userTint, overlayStrength * 0.55),
        gradEnd: hexToRgba(userTint, overlayStrength),
        textMain: userText, textSub: '#94a3b8', gold: userAccent, grid: 'rgba(255,255,255,0.1)',
        resWin: '#22c55e', resLoss: '#ef4444', resDraw: '#94a3b8'
    };

    // BG
    if(bgLoaded){
        const scale = Math.max(W/bgImage.width, H/bgImage.height);
        const x = (W/2)-(bgImage.width/2)*scale;
        const y = (H/2)-(bgImage.height/2)*scale;
        ctx.drawImage(bgImage, x, y, bgImage.width*scale, bgImage.height*scale);
        ctx.fillStyle = C.tint;
        ctx.fillRect(0,0,W,H);
        const g = ctx.createLinearGradient(0,0,0,H);
        g.addColorStop(0, C.gradStart);
        g.addColorStop(1, C.gradEnd);
        ctx.fillStyle = g;
        ctx.fillRect(0,0,W,H);
    } else {
        ctx.fillStyle = C.bg;
        ctx.fillRect(0,0,W,H);
        ctx.fillStyle = C.gradEnd;
        ctx.fillRect(0,0,W,H);
    }

    // Pitch lines
    if(currentMode === 'team' && layoutStyle === 'pitch' && styleOptions.showGrid){
        ctx.strokeStyle = C.grid;
        ctx.lineWidth = 2;
        const off = currentFormat === 'post' ? 350 : 600;
        const startY = off - 50;
        ctx.beginPath();
        ctx.moveTo(50, startY);
        ctx.lineTo(1030, startY);
        ctx.stroke();
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(50, startY+200);
        ctx.lineTo(1030, startY+200);
        ctx.stroke();
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(50, startY+400);
        ctx.lineTo(1030, startY+400);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(50, startY+600);
        ctx.lineTo(1030, startY+600);
        ctx.stroke();
        ctx.lineWidth = 1;
    }
    ctx.setLineDash([]);

    // Logo
    if(useDefaultLogo && defaultLogoLoaded){
        const lh = L.logo.w * (defaultLogoImage.height/defaultLogoImage.width);
        ctx.drawImage(defaultLogoImage, L.logo.x, L.logo.y, L.logo.w, lh);
    } else if(logoLoaded){
        const lh = L.logo.w * (logoImage.height/logoImage.width);
        ctx.drawImage(logoImage, L.logo.x, L.logo.y, L.logo.w, lh);
    }

    // Text
    const opponent = document.getElementById('opponentName').value || 'OPPONENT';
    const resColor = resultText === 'WIN' ? C.resWin : (resultText === 'LOSS' ? C.resLoss : C.resDraw);

    if(currentMode === 'team'){
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.font = '800 ' + styleOptions.headerSize + 'px Montserrat';
        ctx.fillStyle = C.textMain;
        ctx.fillText(rugbyFormat === '7s' ? 'STARTING VII' : 'STARTING XV', L.header.x, L.header.y);
        ctx.font = '500 30px Montserrat';
        ctx.fillStyle = C.textMain;
        ctx.fillText('VS ' + opponent.toUpperCase(), L.opponent.x, L.opponent.y);

        if(showResult){
            if(layoutStyle === 'pitch') ctx.textAlign = 'center';
            ctx.font = '900 40px Montserrat';
            ctx.fillStyle = resColor;
            ctx.fillText(resultText, L.result.x, L.result.y);
            ctx.strokeStyle = resColor;
            ctx.lineWidth = 4;
            const tw = ctx.measureText(resultText).width;
            ctx.strokeRect(L.result.x - (layoutStyle==='pitch'?tw/2+10:10), L.result.y - 30, tw + 20, 60);
        }

        if(layoutStyle === 'list'){
            let y = L.list.y;
            players.forEach((p, i) => {
                ctx.textAlign = 'right';
                ctx.font = '500 ' + styleOptions.nameSize + 'px Montserrat';
                ctx.fillStyle = C.textSub;
                ctx.fillText((i+1).toString().padStart(2,'0'), L.list.x, y);
                if(p.name){
                    ctx.textAlign = 'left';
                    ctx.font = '800 ' + styleOptions.nameSize + 'px Montserrat';
                    ctx.fillStyle = C.textMain;
                    ctx.fillText(p.name.toUpperCase(), L.list.x + 20, y);
                    if(p.role !== 'none'){
                        const nw = ctx.measureText(p.name.toUpperCase()).width;
                        ctx.fillStyle = C.gold;
                        ctx.font = '700 22px Montserrat';
                        ctx.fillText('(' + p.role + ')', L.list.x + 20 + nw + 12, y+2);
                    }
                }
                y += styleOptions.spacing;
            });
            const activeSubs = subs.map((n,i)=>({n,i})).filter(s=>s.n.trim()!=='');
            if(activeSubs.length > 0){
                let sy = L.subsList.y;
                ctx.textAlign = 'right';
                ctx.font = '800 32px Montserrat';
                ctx.fillStyle = C.textSub;
                ctx.fillText('SUBS', L.subsTitle.x, L.subsTitle.y);
                activeSubs.forEach(s => {
                    ctx.textAlign = 'right';
                    ctx.font = '500 28px Montserrat';
                    ctx.fillStyle = C.textSub;
                    ctx.fillText((getSubStart()+s.i).toString(), L.subsList.x, sy);
                    ctx.font = '700 28px Montserrat';
                    ctx.fillStyle = C.textMain;
                    ctx.fillText(s.n.toUpperCase(), L.subsList.x - 50, sy);
                    sy += 48;
                });
            }
        } else {
            ctx.textAlign = 'center';
            L.positions.forEach((pos, i) => {
                const p = players[i];
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, styleOptions.circleRadius, 0, 2*Math.PI);
                ctx.fillStyle = badgeFill;
                ctx.fill();
                ctx.strokeStyle = C.gold;
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.fillStyle = C.textMain;
                ctx.font = '800 24px Montserrat';
                ctx.fillText((i+1).toString(), pos.x, pos.y + 2);
                if(p.name){
                    const nameY = pos.y + styleOptions.circleRadius + 20;
                    ctx.font = '800 ' + Math.max(styleOptions.nameSize-8,14) + 'px Montserrat';
                    ctx.fillStyle = C.textMain;
                    ctx.shadowColor = isWhiteTheme ? 'white' : 'black';
                    ctx.shadowBlur = styleOptions.shadow;
                    ctx.fillText(p.name.toUpperCase(), pos.x, nameY);
                    ctx.shadowBlur = 0;
                    if(p.role !== 'none'){
                        ctx.font = '700 16px Montserrat';
                        ctx.fillStyle = C.gold;
                        ctx.fillText('(' + p.role + ')', pos.x, nameY + 18);
                    }
                }
            });
            const activeSubs = subs.map((n,i)=>({n,i})).filter(s=>s.n.trim()!=='');
            if(activeSubs.length > 0){
                ctx.font = '800 24px Montserrat';
                ctx.fillStyle = C.textSub;
                ctx.fillText('SUBSTITUTES', L.subsTitle.x, L.subsTitle.y);
                let subText = activeSubs.map(s => (getSubStart()+s.i) + '. ' + s.n.toUpperCase()).join('   •   ');
                ctx.font = '600 20px Montserrat';
                ctx.fillStyle = C.textMain;
                ctx.fillText(subText, L.subsList.x, L.subsList.y, 900);
            }
        }
    } else {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '500 30px Montserrat';
        ctx.fillStyle = C.textMain;
        ctx.fillText('MATCH RESULT VS', L.opponent.x, L.opponent.y - 40);
        ctx.font = '800 60px Montserrat';
        ctx.fillStyle = C.textMain;
        ctx.fillText(opponent.toUpperCase(), L.opponent.x, L.opponent.y + 10);
        if(showResult){
            ctx.font = '900 50px Montserrat';
            ctx.fillStyle = resColor;
            ctx.fillText(resultText, L.result.x, L.result.y);
        }
        const sHome = document.getElementById('scoreHome').value;
        const sAway = document.getElementById('scoreAway').value;
        const sHT = document.getElementById('scoreHT').value || '';
        ctx.font = '900 140px Montserrat';
        ctx.fillStyle = C.textMain;
        ctx.fillText(sHome + ' - ' + sAway, L.scoreBig.x, L.scoreBig.y);
        ctx.font = '700 24px Montserrat';
        ctx.fillStyle = C.textSub;
        if(sHT) ctx.fillText(sHT.toUpperCase(), L.scoreSub.x, L.scoreSub.y);
        const details = document.getElementById('scorersList').value.split('\n');
        let dy = L.details.y;
        ctx.font = '600 28px Montserrat';
        ctx.fillStyle = C.textMain;
        details.forEach(line => {
            ctx.fillText(line, L.details.x, dy);
            dy += 45;
        });
    }
}

// Init
function init(){
    canvas = document.getElementById('teamSheet');
    ctx = canvas.getContext('2d');
    buildPlayerRows();
    buildSubRows();
    setDevice('desktop');
    setLayoutStyle('list');
    drawCanvas();
}

if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Secondary wiring for environments that block inline handlers
const wireSettingsButtons = () => {
    const openBtn = document.getElementById('btnSettingsOpen');
    const closeBtn = document.getElementById('btnSettingsClose');
    const overlay = document.getElementById('settingsOverlay');
    openBtn?.addEventListener('click', () => toggleSettings(true));
    closeBtn?.addEventListener('click', () => toggleSettings(false));
    overlay?.addEventListener('click', e => { if(e.target === overlay) toggleSettings(false); });
};
if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', wireSettingsButtons);
} else {
    wireSettingsButtons();
}

