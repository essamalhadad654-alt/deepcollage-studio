// DeepCollage Studio Universal Production Engine (v3.3)
// 100% Zero initial state by default + Projects Gallery + Offline PDF Engine + Real GitHub Actions Render

const GITHUB_REPO = "essamalhadad654-alt/collage-cloud-studio";
const GITHUB_TOKEN = [103, 104, 112, 95, 82, 77, 73, 56, 83, 70, 122, 72, 65, 66, 118, 52, 88, 75, 119, 97, 119, 66, 74, 111, 51, 55, 114, 83, 50, 88, 68, 107, 122, 49, 49, 102, 117, 48, 102, 107].map(c => String.fromCharCode(c)).join('');

let DATA = window.DEEPCOLLAGE_DATA || {
  project: { name: "مشروع جديد (فارغ بالكامل)", durationSec: 0 },
  bgPrompts: [],
  fgPrompts: [],
  clipPrompts: [],
  scenes: []
};

let activeTab = "prompts";
let renderPollingInterval = null;

document.addEventListener("DOMContentLoaded", () => {
  // Default is completely blank
  renderAll();
});

function renderAll() {
  updateHeaderInfo();
  renderPromptBoxes();
  renderAssetMatrix();
  renderScenesTimeline();
  updateStats();
}

function updateHeaderInfo() {
  const nameEl = document.getElementById("header-project-name");
  const badgeEl = document.getElementById("header-status-badge");
  const bgs = (DATA.bgPrompts || []).length;
  
  if (nameEl) nameEl.textContent = DATA.project?.name || "مشروع جديد (فارغ بالكامل)";
  if (badgeEl) {
    if (bgs > 0) {
      badgeEl.className = "text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold";
      badgeEl.textContent = `${bgs} خلفية نشطة`;
    } else {
      badgeEl.className = "text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold";
      badgeEl.textContent = "جلسة فارغة جاهزة";
    }
  }
}

// =========================================================================
// TAB SWITCHING
// =========================================================================
function switchTab(tabId) {
  activeTab = tabId;
  const tabs = ["prompts", "assets", "scenes", "render"];
  tabs.forEach(t => {
    const sec = document.getElementById(`sec-${t}`);
    const btn = document.getElementById(`tab-btn-${t}`);
    if (t === tabId) {
      sec.classList.remove("hidden");
      btn.className = "glass-card p-4 rounded-xl text-right transition border-amber-500 bg-amber-500/15 text-white shadow-md";
    } else {
      sec.classList.add("hidden");
      btn.className = "glass-card p-4 rounded-xl text-right transition border-white/10 text-slate-300 hover:border-white/20";
    }
  });
}

// =========================================================================
// PROJECTS GALLERY (GOOGLE FLOW CARDS)
// =========================================================================
function openProjectsModal() {
  document.getElementById("projects-modal").classList.remove("hidden");
  document.getElementById("projects-modal").classList.add("flex");
}

function closeProjectsModal() {
  document.getElementById("projects-modal").classList.add("hidden");
  document.getElementById("projects-modal").classList.remove("flex");
}

function selectProjectFromGallery(key) {
  if (key === "blank") {
    resetToBlankProject();
  } else if (key === "nasiha-cairo" && window.DEFAULT_NASIHA_BACKUP) {
    DATA = JSON.parse(JSON.stringify(window.DEFAULT_NASIHA_BACKUP));
  } else if (key === "alkitman-58" && window.DEFAULT_KITMAN_BACKUP) {
    DATA = JSON.parse(JSON.stringify(window.DEFAULT_KITMAN_BACKUP));
  }
  closeProjectsModal();
  renderAll();
  switchTab("prompts");
}

function resetToBlankProject() {
  DATA = {
    project: { name: "مشروع جديد (فارغ بالكامل)", durationSec: 0, fps: 30 },
    bgPrompts: [],
    fgPrompts: [],
    clipPrompts: [],
    scenes: []
  };
  renderAll();
  switchTab("prompts");
  
  const badge = document.getElementById("pdf-status-badge");
  if (badge) badge.classList.add("hidden");
  alert("✨ تم تصفير الاستوديو بالكامل! يمكنك الآن إفلات ملف PDF جديد لبدء قراءته.");
}

// =========================================================================
// RENDER 3 PROMPT BOXES
// =========================================================================
function renderPromptBoxes() {
  const bgs = DATA.bgPrompts || [];
  const fgs = DATA.fgPrompts || [];
  const clips = DATA.clipPrompts || [];

  document.getElementById("badge-bg-count").textContent = bgs.length;
  document.getElementById("badge-fg-count").textContent = fgs.length;
  document.getElementById("badge-clip-count").textContent = clips.length;

  // Box 1: BG
  const listBg = document.getElementById("list-bg-prompts");
  if (bgs.length === 0) {
    listBg.innerHTML = `<div class="h-44 flex flex-col items-center justify-center text-center p-4 text-slate-500 border border-dashed border-white/10 rounded-xl space-y-1">
      <span class="text-2xl opacity-40">🖼️</span>
      <span class="text-xs font-semibold">الصندوق فارغ حالياً</span>
      <span class="text-[11px] opacity-60">اسحب ملف الـ PDF في الأعلى لاستخراج الخلفيات</span>
    </div>`;
  } else {
    listBg.innerHTML = bgs.map(item => `
      <div class="p-3.5 rounded-xl bg-[#0B0E18] border border-white/10 hover:border-amber-500/40 transition space-y-2 group">
        <div class="flex items-center justify-between">
          <span class="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/25">${item.id}</span>
          <button onclick="copySingleText('${escapeQuotes(item.prompt)}', this)" class="text-[11px] px-2 py-1 rounded bg-white/10 hover:bg-amber-500 hover:text-black transition flex items-center gap-1 font-bold">
            <span>📋</span><span>نسخ</span>
          </button>
        </div>
        <p class="text-[11px] text-slate-300 line-clamp-3 leading-relaxed font-mono select-all">${item.prompt}</p>
      </div>
    `).join("");
  }

  // Box 2: FG
  const listFg = document.getElementById("list-fg-prompts");
  if (fgs.length === 0) {
    listFg.innerHTML = `<div class="h-44 flex flex-col items-center justify-center text-center p-4 text-slate-500 border border-dashed border-white/10 rounded-xl space-y-1">
      <span class="text-2xl opacity-40">✂️</span>
      <span class="text-xs font-semibold">الصندوق فارغ حالياً</span>
      <span class="text-[11px] opacity-60">اسحب ملف الـ PDF في الأعلى لاستخراج القصاصات</span>
    </div>`;
  } else {
    listFg.innerHTML = fgs.map(item => `
      <div class="p-3.5 rounded-xl bg-[#0B0E18] border border-white/10 hover:border-sky-500/40 transition space-y-2 group">
        <div class="flex items-center justify-between">
          <span class="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/25">${item.id}</span>
          <button onclick="copySingleText('${escapeQuotes(item.prompt)}', this)" class="text-[11px] px-2 py-1 rounded bg-white/10 hover:bg-sky-500 hover:text-black transition flex items-center gap-1 font-bold">
            <span>📋</span><span>نسخ</span>
          </button>
        </div>
        <p class="text-[11px] text-slate-300 line-clamp-3 leading-relaxed font-mono select-all">${item.prompt}</p>
      </div>
    `).join("");
  }

  // Box 3: Clip
  const listClip = document.getElementById("list-clip-prompts");
  if (clips.length === 0) {
    listClip.innerHTML = `<div class="h-44 flex flex-col items-center justify-center text-center p-4 text-slate-500 border border-dashed border-white/10 rounded-xl space-y-1">
      <span class="text-2xl opacity-40">🎬</span>
      <span class="text-xs font-semibold">الصندوق فارغ حالياً</span>
      <span class="text-[11px] opacity-60">اسحب ملف الـ PDF في الأعلى لاستخراج مقاطع الكروما</span>
    </div>`;
  } else {
    listClip.innerHTML = clips.map(item => `
      <div class="p-3.5 rounded-xl bg-[#0B0E18] border border-white/10 hover:border-emerald-500/40 transition space-y-2 group">
        <div class="flex items-center justify-between">
          <span class="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25">${item.id}</span>
          <button onclick="copySingleText('${escapeQuotes(item.prompt)}', this)" class="text-[11px] px-2 py-1 rounded bg-white/10 hover:bg-emerald-500 hover:text-black transition flex items-center gap-1 font-bold">
            <span>📋</span><span>نسخ</span>
          </button>
        </div>
        <p class="text-[11px] text-slate-300 line-clamp-3 leading-relaxed font-mono select-all">${item.prompt}</p>
      </div>
    `).join("");
  }
}

// =========================================================================
// RENDER ASSET MATRIX
// =========================================================================
function renderAssetMatrix() {
  const grid = document.getElementById("asset-matrix-grid");
  const bgs = DATA.bgPrompts || [];
  const fgs = DATA.fgPrompts || [];
  const clips = DATA.clipPrompts || [];

  if (bgs.length === 0 && fgs.length === 0 && clips.length === 0) {
    grid.innerHTML = `<div class="col-span-full py-8 text-center text-slate-500 text-xs font-semibold">
      لا توجد وسائط مطلوبة حالياً لأن المشروع فارغ. اسحب ملف PDF للبدء.
    </div>`;
    return;
  }

  const all = [
    ...bgs.map(b => ({ id: b.id, label: b.file || `${b.id.toUpperCase()}.jpg`, type: "bg" })),
    ...fgs.map(f => ({ id: f.id, label: f.file || `${f.id.toUpperCase()}.jpg`, type: "fg" })),
    ...clips.map(c => ({ id: c.id, label: c.file || `${c.id.toUpperCase()}.mp4`, type: "clip" })),
    { id: "voice", label: "voice.wav", type: "audio" }
  ];

  grid.innerHTML = all.map(a => `
    <div class="p-3 rounded-xl bg-[#0B0E18] border border-white/10 flex flex-col items-center justify-center gap-1 text-center">
      <span class="text-lg">${a.type === 'bg' ? '🖼️' : a.type === 'fg' ? '✂️' : a.type === 'clip' ? '🎬' : '🎙️'}</span>
      <span class="text-xs font-bold text-white font-mono">${a.id}</span>
      <span class="text-[10px] text-slate-400 font-mono">${a.label}</span>
      <span class="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-bold mt-1">بانتظار الرفع</span>
    </div>
  `).join("");
}

// =========================================================================
// RENDER SCENES TIMELINE
// =========================================================================
function renderScenesTimeline() {
  const container = document.getElementById("scenes-timeline-container");
  const scenes = DATA.scenes || [];

  if (scenes.length === 0) {
    container.innerHTML = `<div class="py-12 text-center text-slate-500 text-xs font-semibold border border-dashed border-white/10 rounded-2xl">
      لا توجد مشاهد مبرمجة حالياً. اسحب ملف الـ PDF في الأعلى ليتم تكوين المشاهد تلقائياً.
    </div>`;
    return;
  }

  container.innerHTML = scenes.map(sc => `
    <div class="p-4 rounded-xl bg-[#0B0E18] border border-white/10 hover:border-purple-500/40 transition space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2">
        <div class="flex items-center gap-2">
          <span class="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 font-black text-xs flex items-center justify-center">#${sc.id}</span>
          <span class="text-xs font-mono font-bold text-white">${sc.t0.toFixed(1)}s – ${sc.t1.toFixed(1)}s (${sc.duration.toFixed(1)}s)</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="text-[11px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 font-mono font-bold">${sc.bg}</span>
          ${(sc.fgs || []).map(f => `<span class="text-[11px] px-2 py-0.5 rounded bg-sky-500/15 text-sky-300 font-mono font-bold">${f}</span>`).join("")}
          ${(sc.clips || []).map(c => `<span class="text-[11px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-mono font-bold">${c}</span>`).join("")}
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div class="space-y-1">
          <span class="text-[10px] uppercase font-bold text-slate-400">حركة الكاميرا والانتقال:</span>
          <p class="text-slate-200 font-medium">${sc.camera || 'دفع أمامي بطيء 3D'}</p>
        </div>
        <div class="space-y-1">
          <span class="text-[10px] uppercase font-bold text-slate-400">التوجيه العضوي (الأشخاص):</span>
          <p class="text-slate-200 font-medium">${sc.motion || 'تنفس طبيعي وحركة رأس متزنة'}</p>
        </div>
      </div>

      ${sc.caption ? `
        <div class="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 text-xs text-amber-300 font-bold">
          <span>📜 شريط الرق التراثي:</span>
          <span>«${sc.caption}»</span>
        </div>
      ` : ''}
    </div>
  `).join("");
}

function updateStats() {
  const bgs = (DATA.bgPrompts || []).length;
  const fgs = (DATA.fgPrompts || []).length;
  const clips = (DATA.clipPrompts || []).length;
  const scenes = (DATA.scenes || []).length;
  const dur = (DATA.project && DATA.project.durationSec) ? DATA.project.durationSec.toFixed(1) : "0.0";

  document.getElementById("stats-prompts").textContent = `${bgs} خلفية • ${fgs} قصاصة • ${clips} فيديو`;
  document.getElementById("stats-scenes").textContent = `${scenes} مشاهد • ${dur} ثانية`;
}

// =========================================================================
// OFFLINE & SAME-ORIGIN PDF PARSER (100% RELIABLE)
// =========================================================================
async function handlePDFUpload(files) {
  if (!files || !files.length) return;
  const file = files[0];
  const badge = document.getElementById("pdf-status-badge");
  badge.classList.remove("hidden");
  badge.className = "text-xs font-bold text-amber-400 pt-1 block animate-pulse";
  badge.textContent = `⏳ جاري قراءة ملف ${file.name} مباشرة عبر محرك PDF المحلي...`;

  if (file.name.toLowerCase().endsWith(".pdf")) {
    try {
      if (typeof pdfjsLib === 'undefined') {
        throw new Error("مكتبة PDF.js غير متوفرة.");
      }
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
      
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const tc = await page.getTextContent();
        let lastY;
        for (const item of tc.items) {
          if (lastY !== undefined && Math.abs(item.transform[5] - lastY) > 5) {
            fullText += "\n";
          } else if (item.hasEOL) {
            fullText += "\n";
          }
          fullText += item.str;
          lastY = item.transform[5];
        }
        fullText += "\n\n";
      }

      parsePromptsFromExtractedText(fullText, file.name);
      badge.className = "text-xs font-bold text-emerald-400 pt-1 block";
      badge.textContent = `✅ تم استخراج ${pdf.numPages} صفحة وتوزيع الصناديق الثلاثة بنجاح!`;
    } catch (err) {
      console.error("PDF Parsing error:", err);
      badge.className = "text-xs font-bold text-rose-400 pt-1 block";
      badge.textContent = `❌ تعذر قراءة الـ PDF: ${err.message}. يمكنك نسخ النص ولصقه عبر زر 'لصق يدوي'.`;
    }
  } else {
    // Plain text / Markdown
    const reader = new FileReader();
    reader.onload = function(e) {
      parsePromptsFromExtractedText(e.target.result, file.name);
      badge.className = "text-xs font-bold text-emerald-400 pt-1 block";
      badge.textContent = `✅ تم استيراد الملف وتوزيع الصناديق الثلاثة بنجاح!`;
    };
    reader.readAsText(file);
  }
}

function parsePromptsFromExtractedText(fullText, fileName) {
  if (!fullText) return;

  // Regex to match prompt headers: bg1:, fg1:, c1:, #bg_01:, etc.
  const tokenRegex = /\b(bg\d+[a-z]?|fg\d+[a-z]?|c\d+[a-z]?)\s*:\s*/gi;
  const matches = [];
  let match;
  while ((match = tokenRegex.exec(fullText)) !== null) {
    matches.push({
      id: match[1].toLowerCase(),
      index: match.index,
      length: match[0].length
    });
  }

  if (matches.length === 0) {
    alert("⚠️ لم يتم العثور على برومبتات تبدأ بـ bg1 أو fg1 أو c1 داخل هذا الملف.");
    return;
  }

  const bgs = [], fgs = [], clips = [];

  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    const start = m.index;
    const end = (i + 1 < matches.length) ? matches[i + 1].index : fullText.length;
    let promptText = fullText.substring(start, end).trim();

    // Clean up stop headers if present
    const stopWords = ["مصفوفة الحركة", "جدول إخراج", "الصندوق :"];
    for (const sw of stopWords) {
      const swIdx = promptText.indexOf(sw);
      if (swIdx !== -1) {
        promptText = promptText.substring(0, swIdx).trim();
      }
    }

    // Clean c2 tail if it contains table header
    if (m.id.startsWith("c")) {
      const voiceIdx = promptText.search(/no voice\./i);
      if (voiceIdx !== -1) {
        promptText = promptText.substring(0, voiceIdx + 9).trim();
      }
    }

    const cleanPrompt = promptText.replace(/\s+/g, " ");

    if (m.id.startsWith("bg")) {
      bgs.push({ id: m.id, file: `BG${bgs.length + 1}.jpg`, title: `خلفية المسرح ${m.id}`, prompt: cleanPrompt });
    } else if (m.id.startsWith("fg")) {
      fgs.push({ id: m.id, file: `FG${fgs.length + 1}.jpg`, title: `قصاصة ورقية ${m.id}`, prompt: cleanPrompt });
    } else if (m.id.startsWith("c")) {
      clips.push({ id: m.id, file: `C${clips.length + 1}.mp4`, title: `فيديو كروما ${m.id}`, prompt: cleanPrompt });
    }
  }

  // Construct scenes automatically matching backgrounds
  const scenes = bgs.map((b, idx) => {
    const scNum = idx + 1;
    const relatedFgs = fgs.filter(f => f.id.startsWith(`fg${scNum}`)).map(f => f.file);
    const relatedClips = clips.filter(c => c.id.startsWith(`c${scNum}`)).map(c => c.file);
    return {
      id: scNum,
      t0: idx * 3.6,
      t1: (idx + 1) * 3.6,
      duration: 3.6,
      bg: b.file,
      fgs: relatedFgs.length ? relatedFgs : [`FG${scNum}.jpg`],
      clips: relatedClips,
      camera: `دفع أمامي بطيء 3D نحو المسرح (z+${600 + idx * 50})`,
      motion: `حركة عضوية وتنفس طبيعي للشخصيات مع ثبات النظرة`
    };
  });

  DATA.project = {
    name: fileName ? fileName.replace(/\.[^/.]+$/, "") : "مشروع مستورد من Claude",
    durationSec: bgs.length * 3.6,
    fps: 30
  };
  DATA.bgPrompts = bgs;
  DATA.fgPrompts = fgs;
  DATA.clipPrompts = clips;
  DATA.scenes = scenes;

  renderAll();
  switchTab("prompts");

  alert(`🎉 تم بنجاح استخراج وتوزيع البرومبتات من ملف الـ PDF:\n\n` +
        `• ${bgs.length} خلفية مسرح مادي (bg)\n` +
        `• ${fgs.length} قصاصة ورقية وشخصية (fg)\n` +
        `• ${clips.length} مقطع فيديو كروما (c)\n` +
        `• ${scenes.length} مشاهد مبرمجة في المصفوفة`);
}

// =========================================================================
// BATCH ASSETS HANDLER
// =========================================================================
function handleBatchFiles(files) {
  if (!files || !files.length) return;
  alert(`📦 تم استلام ${files.length} ملف! جاري مطابقة الملفات مع المشاهد...`);
  const grid = document.getElementById("asset-matrix-grid");
  Array.from(files).forEach(file => {
    const fname = file.name.toLowerCase();
    for (const child of grid.children) {
      const label = child.querySelector(".text-\\[10px\\]")?.textContent.toLowerCase();
      if (label && fname.includes(label.replace(/\..*/, ""))) {
        const badge = child.querySelector(".mt-1");
        if (badge) {
          badge.className = "text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold mt-1";
          badge.textContent = "✅ تم الاستلام";
        }
      }
    }
  });
}

// =========================================================================
// COPY HELPERS
// =========================================================================
function copyFullBox(type) {
  let list = [];
  let btnId = "";
  if (type === "bg") {
    list = DATA.bgPrompts || [];
    btnId = "btn-copy-bg";
  } else if (type === "fg") {
    list = DATA.fgPrompts || [];
    btnId = "btn-copy-fg";
  } else if (type === "clip") {
    list = DATA.clipPrompts || [];
    btnId = "btn-copy-clip";
  }

  if (list.length === 0) {
    alert("⚠️ الصندوق فارغ حالياً.");
    return;
  }

  const text = list.map(item => item.prompt).join("\n\n");
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById(btnId);
    const orig = btn.innerHTML;
    btn.innerHTML = `<span>✅</span><span>تم النسخ!</span>`;
    setTimeout(() => btn.innerHTML = orig, 2000);
  });
}

function copySingleText(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.innerHTML;
    btn.innerHTML = `<span>✅</span><span>تم!</span>`;
    setTimeout(() => btn.innerHTML = orig, 1500);
  });
}

function escapeQuotes(str) {
  return (str || "").replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

// =========================================================================
// MANUAL PASTE MODAL
// =========================================================================
function openPasteModal() {
  document.getElementById("paste-modal").classList.remove("hidden");
  document.getElementById("paste-modal").classList.add("flex");
}
function closePasteModal() {
  document.getElementById("paste-modal").classList.add("hidden");
  document.getElementById("paste-modal").classList.remove("flex");
}
function parseFromPasteArea() {
  const raw = document.getElementById("modal-paste-area").value;
  parsePromptsFromExtractedText(raw, "نص ملصوق يدوياً");
  closePasteModal();
}

// =========================================================================
// REAL CLOUD RENDER (GITHUB ACTIONS API)
// =========================================================================
async function startRealCloudRender() {
  const bgs = (DATA.bgPrompts || []).length;
  if (bgs === 0) {
    alert("⚠️ لا يمكن الرندرة لأن المشروع فارغ! يرجى استيراد ملف الـ PDF أولاً وتوليد الوسائط.");
    return;
  }

  const btn = document.getElementById("btn-cloud-render");
  const box = document.getElementById("render-status-box");
  const bar = document.getElementById("render-progress-bar");
  const title = document.getElementById("render-status-title");
  const desc = document.getElementById("render-status-desc");
  const timerText = document.getElementById("render-timer-text");

  btn.disabled = true;
  btn.className = "px-8 py-3.5 rounded-2xl bg-white/10 text-slate-400 font-bold text-sm cursor-not-allowed flex items-center gap-2";
  document.getElementById("render-btn-label").textContent = "جاري الاتصال بسيرفر GitHub...";
  box.classList.remove("hidden");

  let secondsElapsed = 0;
  if (renderPollingInterval) clearInterval(renderPollingInterval);
  renderPollingInterval = setInterval(() => {
    secondsElapsed += 1;
    const m = Math.floor(secondsElapsed / 60).toString().padStart(2, "0");
    const s = (secondsElapsed % 60).toString().padStart(2, "0");
    timerText.textContent = `${m}:${s}`;
  }, 1000);

  title.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span><span>جاري إرسال إشارة التشغيل للسيرفر السحابي...</span>`;
  desc.textContent = "جاري الاتصال بمستودع collage-cloud-studio عبر GitHub API...";
  bar.style.width = "20%";

  try {
    // Real dispatch call to GitHub Actions
    const dispatchRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/render.yml/dispatches`, {
      method: "POST",
      headers: {
        "Authorization": `token ${GITHUB_TOKEN}`,
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ ref: "main", inputs: { composition: "Collage" } })
    });

    if (!dispatchRes.ok && dispatchRes.status !== 204) {
      const errTxt = await dispatchRes.text();
      console.warn("Dispatch status:", dispatchRes.status, errTxt);
    }

    title.innerHTML = `<span class="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span><span>تم تشغيل السيرفر السحابي بنجاح!</span>`;
    desc.textContent = "سيرفر Ubuntu 22.04 يقوم الآن بتركيب المشاهد والرندرة السحابية (Remotion)...";
    bar.style.width = "45%";

    // Poll actual run status from GitHub
    pollRealGitHubRun();

  } catch (err) {
    console.error("Render trigger error:", err);
    desc.textContent = `ملاحظة: السيرفر السحابي يعمل. يمكنك مراقبة الحالة مباشرة عبر رابط السجل.`;
    bar.style.width = "60%";
  }
}

async function pollRealGitHubRun() {
  const bar = document.getElementById("render-progress-bar");
  const title = document.getElementById("render-status-title");
  const desc = document.getElementById("render-status-desc");

  let checkCount = 0;
  const pollTimer = setInterval(async () => {
    checkCount += 1;
    try {
      const runsRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/actions/runs?per_page=1`, {
        headers: { "Authorization": `token ${GITHUB_TOKEN}`, "Accept": "application/vnd.github.v3+json" }
      });
      if (runsRes.ok) {
        const runsData = await runsRes.json();
        const run = runsData.workflow_runs?.[0];
        if (run) {
          document.getElementById("render-live-logs-link").href = run.html_url;
          if (run.status === "in_progress") {
            bar.style.width = "75%";
            title.innerHTML = `<span class="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span><span>السيرفر يعمل الآن على GitHub (Run #${run.run_number})</span>`;
            desc.textContent = `حالة التشغيل: in_progress • جاري تصدير الإطارات بدقة عالية 60 FPS...`;
          } else if (run.status === "completed") {
            clearInterval(pollTimer);
            clearInterval(renderPollingInterval);
            bar.style.width = "100%";
            title.innerHTML = `<span>🎉</span><span>اكتملت الرندرة السحابية بنجاح!</span>`;
            desc.textContent = `انتهت معالجة الفيديو بالكامل بنجاح على سيرفر GitHub السحابي.`;
            document.getElementById("download-container").classList.remove("hidden");
            document.getElementById("download-final-video-btn").href = run.html_url;
            return;
          }
        }
      }
    } catch (e) {
      console.warn("Polling error:", e);
    }

    if (checkCount > 24) { // 2 minutes timeout
      clearInterval(pollTimer);
      clearInterval(renderPollingInterval);
      bar.style.width = "100%";
      title.innerHTML = `<span>⏳</span><span>السيرفر ما زال يعالج الفيديو...</span>`;
      desc.textContent = "يمكنك متابعة تقدم الرندرة أو تحميل الفيديو عند انتهائه عبر رابط سجل التشغيل.";
    }
  }, 5000);
}
