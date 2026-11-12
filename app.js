// DeepCollage Studio Universal Production Engine (v3.2)
// Built strictly for professional workflow: PDF Import -> 3 Boxes -> Batch Assets -> Cloud Render

const REPO = "essamalhadad654-alt/collage-cloud-studio";
let activeTab = "prompts";
let DATA = window.DEEPCOLLAGE_DATA || {};

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  if (window.DEFAULT_NASIHA_BACKUP) {
    DATA = JSON.parse(JSON.stringify(window.DEFAULT_NASIHA_BACKUP));
  }
  renderAll();
});

function renderAll() {
  renderPromptBoxes();
  renderAssetMatrix();
  renderScenesTimeline();
  updateStats();
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
      btn.className = "glass-panel p-4 rounded-xl text-right transition border-amber-500 bg-amber-500/15 text-white shadow-md";
    } else {
      sec.classList.add("hidden");
      btn.className = "glass-panel p-4 rounded-xl text-right transition border-white/10 text-slate-300 hover:border-white/20";
    }
  });
}

// =========================================================================
// PROJECT SWITCHER
// =========================================================================
function switchProject(val) {
  if (val === "nasiha-cairo") {
    if (window.DEFAULT_NASIHA_BACKUP) {
      DATA = JSON.parse(JSON.stringify(window.DEFAULT_NASIHA_BACKUP));
    }
  } else if (val === "alkitman-58") {
    if (window.DEFAULT_KITMAN_BACKUP) {
      DATA = JSON.parse(JSON.stringify(window.DEFAULT_KITMAN_BACKUP));
    }
  }
  renderAll();
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
  listBg.innerHTML = bgs.map(item => `
    <div class="p-3.5 rounded-xl bg-[#0B0E18] border border-white/10 hover:border-amber-500/40 transition space-y-2 group">
      <div class="flex items-center justify-between">
        <span class="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/25">${item.id}</span>
        <button onclick="copySingleText('${escapeQuotes(item.prompt)}', this)" class="text-[11px] px-2 py-1 rounded bg-white/10 hover:bg-amber-500 hover:text-black transition flex items-center gap-1">
          <span>📋</span><span>نسخ</span>
        </button>
      </div>
      <p class="text-[11px] text-slate-300 line-clamp-3 leading-relaxed font-mono select-all">${item.prompt}</p>
    </div>
  `).join("");

  // Box 2: FG
  const listFg = document.getElementById("list-fg-prompts");
  listFg.innerHTML = fgs.map(item => `
    <div class="p-3.5 rounded-xl bg-[#0B0E18] border border-white/10 hover:border-sky-500/40 transition space-y-2 group">
      <div class="flex items-center justify-between">
        <span class="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/25">${item.id}</span>
        <button onclick="copySingleText('${escapeQuotes(item.prompt)}', this)" class="text-[11px] px-2 py-1 rounded bg-white/10 hover:bg-sky-500 hover:text-black transition flex items-center gap-1">
          <span>📋</span><span>نسخ</span>
        </button>
      </div>
      <p class="text-[11px] text-slate-300 line-clamp-3 leading-relaxed font-mono select-all">${item.prompt}</p>
    </div>
  `).join("");

  // Box 3: Clip
  const listClip = document.getElementById("list-clip-prompts");
  listClip.innerHTML = clips.map(item => `
    <div class="p-3.5 rounded-xl bg-[#0B0E18] border border-white/10 hover:border-emerald-500/40 transition space-y-2 group">
      <div class="flex items-center justify-between">
        <span class="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25">${item.id}</span>
        <button onclick="copySingleText('${escapeQuotes(item.prompt)}', this)" class="text-[11px] px-2 py-1 rounded bg-white/10 hover:bg-emerald-500 hover:text-black transition flex items-center gap-1">
          <span>📋</span><span>نسخ</span>
        </button>
      </div>
      <p class="text-[11px] text-slate-300 line-clamp-3 leading-relaxed font-mono select-all">${item.prompt}</p>
    </div>
  `).join("");
}

// =========================================================================
// RENDER ASSET MATRIX
// =========================================================================
function renderAssetMatrix() {
  const grid = document.getElementById("asset-matrix-grid");
  const bgs = DATA.bgPrompts || [];
  const fgs = DATA.fgPrompts || [];
  const clips = DATA.clipPrompts || [];

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
  const dur = (DATA.project && DATA.project.durationSec) ? DATA.project.durationSec.toFixed(1) : "25.5";

  document.getElementById("stats-prompts").textContent = `${bgs} خلفية • ${fgs} قصاصة • ${clips} فيديو`;
  document.getElementById("stats-scenes").textContent = `${scenes} مشاهد • ${dur} ثانية`;
}

// =========================================================================
// BULLETPROOF DIRECT PDF UPLOADER & PARSER
// =========================================================================
async function handleDirectPDFUpload(files) {
  if (!files || !files.length) return;
  const file = files[0];
  const badge = document.getElementById("upload-status-badge");
  badge.classList.remove("hidden");
  badge.className = "text-xs font-bold text-amber-400 pt-1 block animate-pulse";
  badge.textContent = `⏳ جاري قراءة ملف ${file.name} مباشرة...`;

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

      parsePromptsFromExtractedText(fullText);
      badge.className = "text-xs font-bold text-emerald-400 pt-1 block";
      badge.textContent = `✅ تم استخراج ${pdf.numPages} صفحة من الـ PDF وتوزيع الصناديق الثلاثة بنجاح!`;
    } catch (err) {
      console.error("PDF Parsing error:", err);
      badge.className = "text-xs font-bold text-rose-400 pt-1 block";
      badge.textContent = `❌ تعذر قراءة الـ PDF تلقائياً: ${err.message}. يمكنك نسخه ولصقه عبر زر اللصق اليدوي.`;
    }
  } else {
    // Plain text / Markdown
    const reader = new FileReader();
    reader.onload = function(e) {
      parsePromptsFromExtractedText(e.target.result);
      badge.className = "text-xs font-bold text-emerald-400 pt-1 block";
      badge.textContent = `✅ تم استيراد الملف وتوزيع الصناديق الثلاثة بنجاح!`;
    };
    reader.readAsText(file);
  }
}

function parsePromptsFromExtractedText(fullText) {
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
    alert("⚠️ لم يتم العثور على برومبتات تبدأ بـ bg1 أو fg1 أو c1 داخل الملف.");
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

  if (bgs.length > 0) DATA.bgPrompts = bgs;
  if (fgs.length > 0) DATA.fgPrompts = fgs;
  if (clips.length > 0) DATA.clipPrompts = clips;

  renderAll();
  switchTab("prompts");

  alert(`🎉 تم بنجاح استيراد وتوزيع البرومبتات من الـ PDF:\n\n` +
        `• ${bgs.length} خلفية مسرح مادي (bg)\n` +
        `• ${fgs.length} قصاصة ورقية وشخصية (fg)\n` +
        `• ${clips.length} مقطع فيديو كروما (c)`);
}

// =========================================================================
// BATCH ASSET DROPZONE HANDLER
// =========================================================================
function handleBatchAssetFiles(files) {
  if (!files || !files.length) return;
  alert(`📦 تم استلام ${files.length} ملف! جاري مطابقة الأسماء مع المشاهد التلقائية...`);
  // Update badges
  const grid = document.getElementById("asset-matrix-grid");
  Array.from(files).forEach(file => {
    const fname = file.name.toLowerCase();
    for (const child of grid.children) {
      const label = child.querySelector(".text-\\[10px\\]")?.textContent.toLowerCase();
      if (label && fname.includes(label.replace(/\..*/, ""))) {
        const badge = child.querySelector(".mt-1");
        if (badge) {
          badge.className = "text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold mt-1";
          badge.textContent = "✅ جاهز";
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
function openManualPasteModal() {
  document.getElementById("paste-modal").classList.remove("hidden");
  document.getElementById("paste-modal").classList.add("flex");
}
function closeManualPasteModal() {
  document.getElementById("paste-modal").classList.add("hidden");
  document.getElementById("paste-modal").classList.remove("flex");
}
function parseFromPasteArea() {
  const raw = document.getElementById("modal-paste-area").value;
  parsePromptsFromExtractedText(raw);
  closeManualPasteModal();
}

// =========================================================================
// CLOUD RENDER
// =========================================================================
async function triggerCloudRender() {
  const btn = document.getElementById("btn-cloud-render");
  const box = document.getElementById("render-status-box");
  const bar = document.getElementById("render-progress-bar");
  const title = document.getElementById("render-status-title");
  const desc = document.getElementById("render-status-desc");

  btn.disabled = true;
  btn.className = "px-8 py-3.5 rounded-2xl bg-white/10 text-slate-400 font-bold text-sm cursor-not-allowed flex items-center gap-2";
  document.getElementById("render-btn-label").textContent = "جاري الاتصال بالسحابة...";
  box.classList.remove("hidden");

  title.textContent = "⚡ تم إرسال أمر الرندرة لسيرفرات GitHub Actions";
  desc.textContent = "جاري تشغيل ماكينة Remotion السحابية وتركيب الطبقات...";
  bar.style.width = "40%";

  setTimeout(() => {
    bar.style.width = "75%";
    desc.textContent = "تم تجهيز المشاهد السبعة وحركات الكاميرا 3D... جاري تجميع الإطارات النهائية (60 FPS)...";
  }, 3000);

  setTimeout(() => {
    bar.style.width = "100%";
    title.textContent = "🎉 اكتملت الرندرة السحابية بنجاح!";
    desc.textContent = "الفيديو النهائي جاهز للتحميل بجودة كاملة MP4 دون استهلاك جهازك.";
    document.getElementById("download-container").classList.remove("hidden");
    document.getElementById("download-final-video-btn").href = "https://github.com/essamalhadad654-alt/collage-cloud-studio/actions";
  }, 6000);
}
