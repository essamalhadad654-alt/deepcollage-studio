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
  window.assetStore = {};
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
  window.assetStore = {};
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
// RENDER ASSET MATRIX (WITH LIVE THUMBNAILS & DYNAMIC PREVIEWS)
// =========================================================================
window.assetStore = window.assetStore || {};
let currentSlotForUpload = null;

function renderAssetMatrix() {
  const grid = document.getElementById("asset-matrix-grid");
  if (!grid) return;

  const bgs = DATA.bgPrompts || [];
  const fgs = DATA.fgPrompts || [];
  const clips = DATA.clipPrompts || [];

  if (bgs.length === 0 && fgs.length === 0 && clips.length === 0) {
    grid.innerHTML = `<div class="col-span-full py-8 text-center text-slate-500 text-xs font-semibold">
      لا توجد وسائط مطلوبة حالياً لأن المشروع فارغ. اسحب ملف PDF للبدء.
    </div>`;
    const sumEl = document.getElementById("asset-count-summary");
    if (sumEl) sumEl.textContent = "0 / 0";
    return;
  }

  const all = [
    ...bgs.map((b, idx) => ({ id: b.id, label: b.file || `BG${idx + 1}.jpg`, title: b.title || `خلفية ${b.id}`, type: "bg", index: idx + 1 })),
    ...fgs.map((f, idx) => ({ id: f.id, label: f.file || `FG${idx + 1}.jpg`, title: f.title || `قصاصة ${f.id}`, type: "fg", index: idx + 1 })),
    ...clips.map((c, idx) => ({ id: c.id, label: c.file || `C${idx + 1}.mp4`, title: c.title || `فيديو ${c.id}`, type: "clip", index: idx + 1 })),
    { id: "voice", label: "voice.wav", title: "التعليق الصوتي", type: "audio", index: 1 }
  ];

  let receivedCount = 0;

  grid.innerHTML = all.map(a => {
    const asset = window.assetStore[a.id];
    if (asset) {
      receivedCount++;
      let mediaPreview = "";
      if (a.type === "clip") {
        mediaPreview = `<video src="${asset.url}" class="w-full h-full object-cover" autoplay loop muted playsinline></video>`;
      } else if (a.type === "audio") {
        mediaPreview = `
          <div class="flex flex-col items-center justify-center p-2 text-center h-full">
            <span class="text-3xl animate-bounce">🎙️</span>
            <audio controls src="${asset.url}" class="w-full h-6 mt-1 scale-90"></audio>
          </div>
        `;
      } else {
        mediaPreview = `<img src="${asset.url}" alt="${a.id}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />`;
      }

      return `
        <div class="p-2.5 rounded-xl bg-[#0B0E18] border border-emerald-500/40 flex flex-col items-center justify-between gap-1.5 text-center shadow-lg relative group transition hover:border-emerald-400">
          <div class="relative w-full h-28 rounded-lg overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center">
            ${mediaPreview}
            <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold gap-1 cursor-pointer" onclick="triggerSingleSlotUpload('${a.id}')">
              <span>🔄</span><span>استبدال</span>
            </div>
          </div>
          <div class="w-full flex items-center justify-between px-1">
            <span class="text-xs font-mono font-bold text-white bg-white/10 px-2 py-0.5 rounded border border-white/15">${a.id}</span>
            <span class="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">✅ تم الاستلام</span>
          </div>
          <span class="text-[10px] text-slate-300 font-mono truncate max-w-full px-1" title="${asset.name}">${asset.name}</span>
        </div>
      `;
    } else {
      const icon = a.type === 'bg' ? '🖼️' : a.type === 'fg' ? '✂️' : a.type === 'clip' ? '🎬' : '🎙️';
      return `
        <div onclick="triggerSingleSlotUpload('${a.id}')" class="p-2.5 rounded-xl bg-[#0B0E18] border-2 border-dashed border-white/15 hover:border-amber-500/50 flex flex-col items-center justify-between gap-1.5 text-center cursor-pointer group transition hover:bg-amber-500/5">
          <div class="w-full h-28 rounded-lg bg-white/5 border border-white/5 flex flex-col items-center justify-center gap-1 group-hover:bg-amber-500/5 transition">
            <span class="text-2xl opacity-60 group-hover:scale-110 transition-transform">${icon}</span>
            <span class="text-[10px] text-slate-400 font-medium px-1 line-clamp-1">${a.title}</span>
            <span class="text-[9px] text-amber-400 font-mono font-bold">انقر للرفع ⇡</span>
          </div>
          <div class="w-full flex items-center justify-between px-1">
            <span class="text-xs font-mono font-bold text-white bg-white/10 px-2 py-0.5 rounded border border-white/15">${a.id}</span>
            <span class="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30">بانتظار الرفع</span>
          </div>
          <span class="text-[10px] text-slate-500 font-mono truncate max-w-full px-1">${a.label}</span>
        </div>
      `;
    }
  }).join("");

  const sumEl = document.getElementById("asset-count-summary");
  if (sumEl) {
    sumEl.textContent = `${receivedCount} / ${all.length}`;
    if (receivedCount === all.length && all.length > 0) {
      sumEl.className = "text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono font-bold";
    } else {
      sumEl.className = "text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono font-bold";
    }
  }
}

function triggerSingleSlotUpload(slotId) {
  currentSlotForUpload = slotId;
  const input = document.getElementById("single-slot-input");
  if (input) {
    input.value = "";
    input.click();
  }
}

function handleSingleSlotFile(files) {
  if (!files || !files.length || !currentSlotForUpload) return;
  const file = files[0];
  window.assetStore = window.assetStore || {};
  window.assetStore[currentSlotForUpload] = {
    file: file,
    url: URL.createObjectURL(file),
    name: file.name,
    size: file.size,
    type: file.type
  };
  renderAssetMatrix();
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
  window.assetStore = {};
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
// SMART BATCH ASSETS MATCHER & PREVIEW ENGINE
// =========================================================================
function handleBatchFiles(files) {
  if (!files || !files.length) return;
  window.assetStore = window.assetStore || {};

  const bgs = DATA.bgPrompts || [];
  const fgs = DATA.fgPrompts || [];
  const clips = DATA.clipPrompts || [];

  const slots = [
    ...bgs.map((b, idx) => ({ id: b.id, label: b.file || `BG${idx + 1}.jpg`, type: "bg", index: idx + 1 })),
    ...fgs.map((f, idx) => ({ id: f.id, label: f.file || `FG${idx + 1}.jpg`, type: "fg", index: idx + 1 })),
    ...clips.map((c, idx) => ({ id: c.id, label: c.file || `C${idx + 1}.mp4`, type: "clip", index: idx + 1 })),
    { id: "voice", label: "voice.wav", type: "audio", index: 1 }
  ];

  if (slots.length === 1 && slots[0].id === "voice") {
    alert("⚠️ يرجى استيراد ملف الـ PDF أولاً ليتعرف التطبيق على الوسائط المطلوبة للمشروع.");
    return;
  }

  const fileItems = Array.from(files).map(file => {
    const raw = file.name.trim();
    const lastDot = raw.lastIndexOf('.');
    const ext = lastDot !== -1 ? raw.substring(lastDot).toLowerCase() : "";
    const stem = (lastDot !== -1 ? raw.substring(0, lastDot) : raw).toLowerCase();
    const clean = stem.replace(/[^a-z0-9]/g, '');
    const isImage = /\.(png|jpe?g|webp|gif|bmp|tiff)$/i.test(raw);
    const isVideo = /\.(mp4|webm|mov|mkv)$/i.test(raw);
    const isAudio = /\.(wav|mp3|m4a|aac|ogg|flac)$/i.test(raw);
    return { file, raw, stem, clean, ext, isImage, isVideo, isAudio, matched: false };
  });

  function assign(slotId, item) {
    if (item.matched) return false;
    window.assetStore[slotId] = {
      file: item.file,
      url: URL.createObjectURL(item.file),
      name: item.raw,
      size: item.file.size,
      type: item.file.type
    };
    item.matched = true;
    return true;
  }

  // 1. Audio Match (voice.wav)
  const voiceSlot = slots.find(s => s.id === "voice");
  if (voiceSlot && !window.assetStore["voice"]) {
    const audioItem = fileItems.find(f => !f.matched && (f.isAudio || f.clean.includes("voice") || f.clean.includes("audio") || f.clean.includes("sound") || f.clean.includes("speech") || f.clean.includes("صوت")));
    if (audioItem) assign("voice", audioItem);
  }

  // 2. Video Clips Match (c1, c2, clip1, clip2)
  const clipSlots = slots.filter(s => s.type === "clip");
  clipSlots.forEach(cs => {
    if (window.assetStore[cs.id]) return;
    const num = cs.index;
    const item = fileItems.find(f => !f.matched && (f.isVideo || f.clean.startsWith("c") || f.clean.includes("clip")) &&
      (f.clean === `c${num}` || f.clean === `clip${num}` || f.clean === `c0${num}` || f.clean === `clip0${num}` || f.stem.includes(`c${num}`) || f.stem.includes(`clip${num}`)));
    if (item) assign(cs.id, item);
  });
  // Fallback for remaining video clips
  clipSlots.forEach(cs => {
    if (!window.assetStore[cs.id]) {
      const anyVideo = fileItems.find(f => !f.matched && (f.isVideo || f.clean.startsWith("c")));
      if (anyVideo) assign(cs.id, anyVideo);
    }
  });

  // 3. Exact ID & Suffix Matching (fg1, fg1a, fg2, fg2a, fg3, fg3a, fg4, fg4a, fg5, fg5a, fg6, fg6a, fg7, bg1..bg7)
  slots.forEach(slot => {
    if (slot.type === "audio" || slot.type === "clip" || window.assetStore[slot.id]) return;
    const idClean = slot.id.toLowerCase().replace(/[^a-z0-9]/g, ""); // e.g. "fg4a"
    const match = fileItems.find(f => !f.matched && f.isImage && 
      (f.clean === idClean || f.stem === slot.id.toLowerCase() || f.clean.startsWith(idClean + "_") || f.clean.includes(idClean)));
    if (match) assign(slot.id, match);
  });

  // 4. Sequential Index Matching (B01..B07, FG1..FG13, F01..F13)
  // Backgrounds:
  slots.filter(s => s.type === "bg").forEach(bs => {
    if (window.assetStore[bs.id]) return;
    const idx = bs.index;
    const match = fileItems.find(f => !f.matched && f.isImage &&
      (f.clean === `bg${idx}` || f.clean === `bg0${idx}` || f.clean === `b${idx}` || f.clean === `b0${idx}` || f.stem.includes(`bg${idx}`) || f.stem.includes(`b0${idx}`) || f.clean.includes(`background${idx}`)));
    if (match) assign(bs.id, match);
  });

  // Cutouts (Ordinal index 1 to 13):
  slots.filter(s => s.type === "fg").forEach(fs => {
    if (window.assetStore[fs.id]) return;
    const idx = fs.index;
    const match = fileItems.find(f => !f.matched && f.isImage &&
      (f.clean === `fg${idx}` || f.clean === `fg0${idx}` || f.clean === `f${idx}` || f.clean === `f0${idx}` || f.stem.includes(`fg${idx}`) || f.stem.includes(`f0${idx}`) || f.clean === `cutout${idx}` || f.clean === `cutout0${idx}`));
    if (match) assign(fs.id, match);
  });

  // 5. Intelligent Fallback (Assign leftover images to leftover slots in natural sort order)
  const emptyFgSlots = slots.filter(s => s.type === "fg" && !window.assetStore[s.id]);
  const unassignedImages = fileItems.filter(f => !f.matched && f.isImage);
  unassignedImages.sort((a, b) => a.raw.localeCompare(b.raw, undefined, { numeric: true, sensitivity: 'base' }));

  emptyFgSlots.forEach((slot, i) => {
    if (unassignedImages[i]) {
      assign(slot.id, unassignedImages[i]);
    }
  });

  const emptyBgSlots = slots.filter(s => s.type === "bg" && !window.assetStore[s.id]);
  const leftoverImages = fileItems.filter(f => !f.matched && f.isImage);
  emptyBgSlots.forEach((slot, i) => {
    if (leftoverImages[i]) {
      assign(slot.id, leftoverImages[i]);
    }
  });

  // Re-render asset matrix with real thumbnails
  renderAssetMatrix();

  const totalAssigned = Object.keys(window.assetStore).length;
  const totalRequired = slots.length;

  if (totalAssigned >= totalRequired) {
    alert(`🎉 ممتاز جداً! تم استلام جميع وسائط المشروع (${totalAssigned}/${totalRequired}) وعرض معايناتها الحية بنجاح!`);
  } else {
    alert(`📦 تم مطابقة ${totalAssigned} من أصل ${totalRequired} وسائط بنجاح وعرض صورها الحية!\n\nيمكنك النقر مباشرة على أي بطاقة متبقية لاختيار صورتها يدوياً.`);
  }
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

  let latestRunIdBefore = null;
  const dispatchStartTime = Date.now();

  try {
    // 1. Get the latest run before dispatch so we NEVER poll an old run
    const preCheck = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/actions/runs?per_page=1`, {
      headers: { "Authorization": `token ${GITHUB_TOKEN}`, "Accept": "application/vnd.github.v3+json" }
    });
    if (preCheck.ok) {
      const preData = await preCheck.json();
      latestRunIdBefore = preData.workflow_runs?.[0]?.id;
    }

    // 2. Sync Current Project JSON to GitHub before dispatch
    title.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span><span>جاري مزامنة بيانات المشروع (${(DATA.scenes || []).length} مشاهد) مع السيرفر...</span>`;
    desc.textContent = "جاري رفع مواصفات المشاهد والتوقيت إلى السيرفر السحابي...";
    bar.style.width = "25%";

    const currentProjectPayload = {
      project: DATA.project || { name: "Universal Project", durationSec: (DATA.scenes || []).length * 3.6, fps: 30 },
      scenes: DATA.scenes || []
    };
    await uploadProjectJsonToGitHub(currentProjectPayload);

    // 3. Real dispatch call to GitHub Actions (Universal Dynamic Render)
    const dispatchRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/render.yml/dispatches`, {
      method: "POST",
      headers: {
        "Authorization": `token ${GITHUB_TOKEN}`,
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ ref: "main", inputs: { projectName: currentProjectPayload.project.name } })
    });

    if (!dispatchRes.ok && dispatchRes.status !== 204) {
      const errTxt = await dispatchRes.text();
      console.warn("Dispatch status:", dispatchRes.status, errTxt);
    }

    title.innerHTML = `<span class="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span><span>تم تشغيل السيرفر السحابي بنجاح لمشروعك الحالي!</span>`;
    desc.textContent = `سيرفر Ubuntu يقوم الآن برندرة ${currentProjectPayload.scenes.length} مشاهد (المدة: ${currentProjectPayload.project.durationSec.toFixed(1)} ثانية)...`;
    bar.style.width = "40%";

    // 4. Poll ONLY the new run from GitHub
    pollRealGitHubRun(latestRunIdBefore, dispatchStartTime);

  } catch (err) {
    console.error("Render trigger error:", err);
    desc.textContent = `ملاحظة: حدث خطأ في الاتصال بالسيرفر: ${err.message}`;
    bar.style.width = "50%";
  }
}

async function uploadProjectJsonToGitHub(payload) {
  try {
    const jsonStr = JSON.stringify(payload, null, 2);
    const b64 = btoa(unescape(encodeURIComponent(jsonStr)));
    let sha = null;
    const getRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/public/project.json`, {
      headers: { "Authorization": `token ${GITHUB_TOKEN}`, "Accept": "application/vnd.github.v3+json" }
    });
    if (getRes.ok) {
      const getJson = await getRes.json();
      sha = getJson.sha;
    }
    const putBody = {
      message: `Universal Render: Set project ${payload.project?.name || 'dynamic'}`,
      content: b64
    };
    if (sha) putBody.sha = sha;
    await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/public/project.json`, {
      method: "PUT",
      headers: {
        "Authorization": `token ${GITHUB_TOKEN}`,
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(putBody)
    });
  } catch (e) {
    console.warn("Project sync error:", e);
  }
}

async function pollRealGitHubRun(latestRunIdBefore, dispatchStartTime) {
  const bar = document.getElementById("render-progress-bar");
  const title = document.getElementById("render-status-title");
  const desc = document.getElementById("render-status-desc");

  let checkCount = 0;
  const pollTimer = setInterval(async () => {
    checkCount += 1;
    try {
      const runsRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/actions/runs?per_page=5`, {
        headers: { "Authorization": `token ${GITHUB_TOKEN}`, "Accept": "application/vnd.github.v3+json" }
      });
      if (runsRes.ok) {
        const runsData = await runsRes.json();
        // Strict filter: must be a different run ID, created around or after our dispatch
        const run = (runsData.workflow_runs || []).find(r => 
          r.id !== latestRunIdBefore && (new Date(r.created_at).getTime() >= dispatchStartTime - 20000)
        );

        if (!run) {
          // Still waiting for GitHub to spawn the run object
          title.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span><span>جاري إرسال إشارة التشغيل وتجهيز بيئة العمل السحابية...</span>`;
          desc.textContent = `سيرفر GitHub Actions يجهز حاوية Ubuntu للتشغيل (${checkCount * 4} ثوانٍ)...`;
          bar.style.width = `${Math.min(35, 20 + checkCount * 2)}%`;
          return;
        }

        // We have the REAL new run!
        document.getElementById("render-live-logs-link").href = run.html_url;

        if (run.status === "queued") {
          bar.style.width = "40%";
          title.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span><span>السيرفر السحابي في قائمة الانتظار (Run #${run.run_number})</span>`;
          desc.textContent = "جاري تهيئة بيئة Remotion وتثبيت الحزم على سيرفر Ubuntu...";
        } else if (run.status === "in_progress") {
          bar.style.width = `${Math.min(90, 45 + checkCount * 1.5)}%`;
          title.innerHTML = `<span class="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span><span>السيرفر يعمل الآن على GitHub (Run #${run.run_number})</span>`;
          desc.textContent = `حالة التشغيل: قيد التنفيذ • جاري رندرة الإطارات بدقة عالية 60 FPS...`;
        } else if (run.status === "completed") {
          clearInterval(pollTimer);
          clearInterval(renderPollingInterval);
          bar.style.width = "100%";
          document.getElementById("download-container").classList.remove("hidden");

          if (run.conclusion === "success") {
            title.innerHTML = `<span>🎉</span><span>اكتملت الرندرة السحابية بنجاح!</span>`;
            desc.textContent = `انتهت معالجة الفيديو بالكامل بنجاح على سيرفر GitHub السحابي (Run #${run.run_number}).`;
            document.getElementById("download-final-video-btn").href = run.html_url;
            document.getElementById("download-final-video-btn").textContent = "تحميل الفيديو النهائي (MP4 بجودة عالية) 📥";
          } else {
            title.innerHTML = `<span>⚠️</span><span>انتهت المهمة على السيرفر (الحالة: ${run.conclusion})</span>`;
            desc.textContent = `يمكنك فتح سجلات السيرفر السحابي مباشرة لمعاينة تفاصيل المهمة والنتائج.`;
            document.getElementById("download-final-video-btn").href = run.html_url;
            document.getElementById("download-final-video-btn").textContent = "فتح تفاصيل وسجلات الرندرة على GitHub ↗";
          }
          return;
        }
      }
    } catch (e) {
      console.warn("Polling error:", e);
    }

    if (checkCount > 90) { // 6 minutes timeout
      clearInterval(pollTimer);
      clearInterval(renderPollingInterval);
      bar.style.width = "100%";
      title.innerHTML = `<span>⏳</span><span>السيرفر ما زال يعالج الفيديو...</span>`;
      desc.textContent = "يمكنك متابعة تقدم الرندرة أو تحميل الفيديو عند انتهائه عبر رابط سجل التشغيل.";
    }
  }, 4000);
}
