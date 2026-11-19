const selectionObject = document.getElementById("insertObjectButton");
const viewPort = document.getElementById("viewportGame");
const exportBtn = document.getElementById("exportBtn");
const docsBtn = document.getElementById("docsBtn");
const docsModal = document.getElementById("docsModal");
const closeDocsBtn = document.getElementById("closeDocsBtn");

// Menu File & Import/Export
const fileMenuBtn = document.getElementById("fileMenuBtn");
const fileDropdownContent = document.getElementById("fileDropdownContent");
const menuNewProj = document.getElementById("menuNewProj");
const menuImportProj = document.getElementById("menuImportProj");
const menuExportProj = document.getElementById("menuExportProj");
const menuImportAsset = document.getElementById("menuImportAsset");
const menuExportHtml = document.getElementById("menuExportHtml");
const importProjectInput = document.getElementById("importProjectInput");
const importAssetsInput = document.getElementById("importAssetsInput");
const quickImportBtn = document.getElementById("quickImportBtn");
const importedFilesList = document.getElementById("importedFilesList");

// Modal de Configuração de API
const apiConfigBtn = document.getElementById("apiConfigBtn");
const apiModal = document.getElementById("apiModal");
const closeApiBtn = document.getElementById("closeApiBtn");
const apiBaseUrlInput = document.getElementById("apiBaseUrlInput");
const apiTokenInput = document.getElementById("apiTokenInput");
const apiTimeoutInput = document.getElementById("apiTimeoutInput");
const apiMethodInput = document.getElementById("apiMethodInput");
const apiHeadersInput = document.getElementById("apiHeadersInput");
const saveApiBtn = document.getElementById("saveApiBtn");

const pageSelect = document.getElementById("pageSelect");
const addPageBtn = document.getElementById("addPageBtn");
const renamePageBtn = document.getElementById("renamePageBtn");
const delPageBtn = document.getElementById("delPageBtn");

const noSelectionMsg = document.getElementById("noSelectionMsg");
const propFields = document.getElementById("propFields");
const propName = document.getElementById("propName");
const propTextLabel = document.getElementById("propTextLabel");
const propText = document.getElementById("propText");
const propSrcGroup = document.getElementById("propSrcGroup");
const propSrcLabel = document.getElementById("propSrcLabel");
const propSrc = document.getElementById("propSrc");
const propMediaFile = document.getElementById("propMediaFile");
const propParent = document.getElementById("propParent");
const propX = document.getElementById("propX");
const propY = document.getElementById("propY");
const propWidth = document.getElementById("propWidth");
const propHeight = document.getElementById("propHeight");
const propRotation = document.getElementById("propRotation");
const propRadius = document.getElementById("propRadius");
const valRadius = document.getElementById("valRadius");
const propBorderWidth = document.getElementById("propBorderWidth");
const propBorderColor = document.getElementById("propBorderColor");
const propFontSize = document.getElementById("propFontSize");
const propVisibleCheck = document.getElementById("propVisibleCheck");
const propBg = document.getElementById("propBg");
const propColor = document.getElementById("propColor");
const deleteBtn = document.getElementById("deleteBtn");

const explorerList = document.getElementById("explorerList");
const objectCount = document.getElementById("objectCount");

const tabPy = document.getElementById("tabPy");
const tabCss = document.getElementById("tabCss");
const tabConsole = document.getElementById("tabConsole");

const pyContainer = document.getElementById("pyContainer");
const cssContainer = document.getElementById("cssContainer");
const consoleContainer = document.getElementById("consoleContainer");

const pyCode = document.getElementById("pyCode");
const pyHighlight = document.getElementById("pyHighlight");
const cssCode = document.getElementById("cssCode");
const cssHighlight = document.getElementById("cssHighlight");

const pyMiniStatus = document.getElementById("pyMiniStatus");
const pyConsoleOutput = document.getElementById("pyConsoleOutput");
const clearConsoleBtn = document.getElementById("clearConsoleBtn");
const runPyBtn = document.getElementById("runPyBtn");
const stopPyBtn = document.getElementById("stopPyBtn");
const codeEditorPanel = document.getElementById("codeEditorPanel");
const toggleMaximizeBtn = document.getElementById("toggleMaximizeBtn");

let paginas = [
    {
        id: "pagina_1",
        nome: "pagina_1",
        html: "",
        py: `import time

# Verifica o dispositivo atual
if page.device.is_mobile:
    print("Modo Mobile detectado!")
else:
    print("Modo Desktop detectado!")
`,
        css: `/* Importação externa de fontes sem resetar estilos */\n@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');`
    }
];

let apiConfig = {
    baseUrl: "",
    token: "",
    timeout: 5000,
    method: "POST",
    headers: '{"Content-Type": "application/json"}'
};

let arquivosImportados = [];
let arquivoArrastadoAtual = null;
let paginaAtualIndex = 0;
let elementoSelecionado = null;
let contadorId = 1;
let modoExecucao = false;
let editorMaximizado = false;

// ==========================================
// 1. CORREÇÃO DE SCROLL DO EDITOR DE CÓDIGO
// ==========================================
function sincronizarScroll(textarea, preHighlight) {
    preHighlight.scrollTop = textarea.scrollTop;
    preHighlight.scrollLeft = textarea.scrollLeft;
}

pyCode.addEventListener("scroll", () => sincronizarScroll(pyCode, pyHighlight));
cssCode.addEventListener("scroll", () => sincronizarScroll(cssCode, cssHighlight));

function habilitarTabNoEditor(textarea, callbackHighlight) {
    textarea.addEventListener("keydown", (e) => {
        if (e.key === "Tab") {
            e.preventDefault();
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            textarea.value = textarea.value.substring(0, start) + "    " + textarea.value.substring(end);
            textarea.selectionStart = textarea.selectionEnd = start + 4;
            callbackHighlight();
        }
    });
}

habilitarTabNoEditor(pyCode, () => {
    pyHighlight.innerHTML = colorirPython(pyCode.value);
    paginas[paginaAtualIndex].py = pyCode.value;
    sincronizarScroll(pyCode, pyHighlight);
});

habilitarTabNoEditor(cssCode, () => {
    cssHighlight.innerHTML = colorirCSS(cssCode.value);
    aplicarCssNoPalco();
    paginas[paginaAtualIndex].css = cssCode.value;
    sincronizarScroll(cssCode, cssHighlight);
});

// ==========================================
// 2. MENU FILE (NOVO, IMPORTAR, EXPORTAR)
// ==========================================
fileMenuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    fileDropdownContent.style.display = fileDropdownContent.style.display === "none" ? "flex" : "none";
});

window.addEventListener("click", () => {
    fileDropdownContent.style.display = "none";
});

menuNewProj.addEventListener("click", () => {
    if (!confirm("Criar um novo projeto? Alterações não salvas serão perdidas.")) return;
    paginas = [{ id: "pagina_1", nome: "pagina_1", html: "", py: "# Novo projeto q.studio\n", css: "/* CSS */\n" }];
    arquivosImportados = [];
    renderizarArquivosImportados();
    carregarPagina(0);
    registrarConsole("Novo projeto iniciado.", "sistema");
});

menuExportProj.addEventListener("click", () => {
    salvarEstadoPaginaAtual();
    const dadosProjeto = {
        versao: "2.6",
        paginas,
        apiConfig,
        arquivosImportados
    };
    const blob = new Blob([JSON.stringify(dadosProjeto, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "projeto-qstudio.json";
    link.click();
    registrarConsole("Projeto salvo (.json) com sucesso!", "sistema");
});

menuImportProj.addEventListener("click", () => importProjectInput.click());

importProjectInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            const dados = JSON.parse(ev.target.result);
            if (dados.paginas && Array.isArray(dados.paginas)) {
                paginas = dados.paginas;
                if (dados.apiConfig) {
                    apiConfig = dados.apiConfig;
                    carregarInputsApi();
                }
                if (dados.arquivosImportados) {
                    arquivosImportados = dados.arquivosImportados;
                    renderizarArquivosImportados();
                }
                carregarPagina(0);
                registrarConsole(`Projeto "${file.name}" importado!`, "sistema");
            }
        } catch (err) {
            alert("Erro ao ler arquivo de projeto: " + err.message);
        }
    };
    reader.readAsText(file);
    importProjectInput.value = "";
});

menuExportHtml.addEventListener("click", () => exportBtn.click());

// ==========================================
// 3. IMPORTAÇÃO DE ARQUIVOS (PNG, MP4, MP3, JS, PY) E DRAG-AND-DROP
// ==========================================
menuImportAsset.addEventListener("click", () => importAssetsInput.click());
quickImportBtn.addEventListener("click", () => importAssetsInput.click());

importAssetsInput.addEventListener("change", (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
        const ext = file.name.split(".").pop().toLowerCase();
        const isText = ext === "py" || ext === "js";
        const reader = new FileReader();

        reader.onload = (ev) => {
            arquivosImportados.push({
                id: "asset_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
                name: file.name,
                ext: ext,
                dataUrl: isText ? null : ev.target.result,
                textContent: isText ? ev.target.result : null
            });
            renderizarArquivosImportados();
            registrarConsole(`Arquivo importado: ${file.name}`, "sistema");
        };

        if (isText) reader.readAsText(file);
        else reader.readAsDataURL(file);
    });
    importAssetsInput.value = "";
});

function obterIconeArquivo(ext) {
    if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) return "🖼️";
    if (["mp4", "webm"].includes(ext)) return "🎬";
    if (["mp3", "wav", "ogg"].includes(ext)) return "🎵";
    if (ext === "py") return "🐍";
    if (ext === "js") return "📜";
    return "📄";
}

function renderizarArquivosImportados() {
    importedFilesList.innerHTML = "";
    arquivosImportados.forEach((item, idx) => {
        const li = document.createElement("li");
        li.className = "imported-item";
        const isMedia = ["png", "jpg", "jpeg", "gif", "webp", "mp4", "webm", "mp3", "wav", "ogg"].includes(item.ext);
        li.draggable = isMedia;
        li.title = isMedia ? "Arraste para o palco para adicionar" : "Clique para abrir no editor";

        const icone = obterIconeArquivo(item.ext);
        li.innerHTML = `
            <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${icone} ${item.name}</span>
            <div style="display:flex; align-items:center; gap:4px;">
                <span class="fileBadge">${item.ext.toUpperCase()}</span>
                <button class="miniBtn" style="padding:0 4px; background:#fee2e2; color:#000;" title="Remover">✕</button>
            </div>
        `;

        li.querySelector("button").addEventListener("click", (e) => {
            e.stopPropagation();
            arquivosImportados.splice(idx, 1);
            renderizarArquivosImportados();
        });

        if (isMedia) {
            li.addEventListener("dragstart", (e) => {
                arquivoArrastadoAtual = item;
                e.dataTransfer.setData("text/plain", item.id);
            });
        } else {
            li.addEventListener("click", () => {
                ativarAba("py");
                pyCode.value += `\n# --- Importado de ${item.name} ---\n` + item.textContent;
                pyHighlight.innerHTML = colorirPython(pyCode.value);
                paginas[paginaAtualIndex].py = pyCode.value;
                registrarConsole(`Script "${item.name}" inserido no editor.`, "sistema");
            });
        }

        importedFilesList.appendChild(li);
    });
}

// ==========================================
// 4. JANELA DE CONFIGURAÇÃO DE API NA BARTOOLS
// ==========================================
function carregarInputsApi() {
    apiBaseUrlInput.value = apiConfig.baseUrl || "";
    apiTokenInput.value = apiConfig.token || "";
    apiTimeoutInput.value = apiConfig.timeout || 5000;
    apiMethodInput.value = apiConfig.method || "POST";
    apiHeadersInput.value = apiConfig.headers || '{"Content-Type": "application/json"}';
}

apiConfigBtn.addEventListener("click", () => {
    carregarInputsApi();
    apiModal.style.display = "flex";
});

closeApiBtn.addEventListener("click", () => apiModal.style.display = "none");

saveApiBtn.addEventListener("click", () => {
    apiConfig.baseUrl = apiBaseUrlInput.value.trim();
    apiConfig.token = apiTokenInput.value.trim();
    apiConfig.timeout = parseInt(apiTimeoutInput.value) || 5000;
    apiConfig.method = apiMethodInput.value;
    apiConfig.headers = apiHeadersInput.value.trim();
    apiModal.style.display = "none";
    registrarConsole("Configurações de API atualizadas!", "sistema");
});

// ==========================================
// 5. EDITOR, CONSOLE E GERENCIAMENTO DE PÁGINAS
// ==========================================
toggleMaximizeBtn.addEventListener("click", () => {
    editorMaximizado = !editorMaximizado;
    if (editorMaximizado) {
        codeEditorPanel.classList.add("maximized");
        toggleMaximizeBtn.textContent = "🗗";
        toggleMaximizeBtn.title = "Restaurar Editor";
    } else {
        codeEditorPanel.classList.remove("maximized");
        toggleMaximizeBtn.textContent = "🗖";
        toggleMaximizeBtn.title = "Maximizar Editor";
    }
});

function registrarConsole(texto, tipo = "info") {
    const linha = document.createElement("div");
    linha.style.color = tipo === "erro" ? "#f87171" : tipo === "sistema" ? "#38bdf8" : "#4ade80";
    linha.textContent = texto;
    pyConsoleOutput.appendChild(linha);
    pyConsoleOutput.scrollTop = pyConsoleOutput.scrollHeight;
    pyMiniStatus.style.color = linha.style.color;
    pyMiniStatus.textContent = texto;
}

clearConsoleBtn.addEventListener("click", () => {
    pyConsoleOutput.innerHTML = "";
    registrarConsole("Console limpo.", "sistema");
});

function salvarEstadoPaginaAtual() {
    const doc = viewPort.contentDocument;
    if (!doc || !doc.body) return;
    const clone = doc.body.cloneNode(true);
    clone.querySelectorAll(".q-selected").forEach(el => el.classList.remove("q-selected"));
    clone.querySelectorAll(".resize-handle, .rotate-handle").forEach(el => el.remove());
    paginas[paginaAtualIndex].html = clone.innerHTML;
    paginas[paginaAtualIndex].py = pyCode.value;
    paginas[paginaAtualIndex].css = cssCode.value;
}

function atualizarSeletorPaginas() {
    pageSelect.innerHTML = "";
    paginas.forEach((pag, idx) => {
        const opt = document.createElement("option");
        opt.value = idx;
        opt.textContent = pag.nome;
        if (idx === paginaAtualIndex) opt.selected = true;
        pageSelect.appendChild(opt);
    });
}

function atualizarOpcoesParentesco() {
    const doc = viewPort.contentDocument;
    if (!doc || !propParent) return;
    propParent.innerHTML = '<option value="">Nenhum (Raiz da Página)</option>';
    const els = doc.querySelectorAll(".q-element");
    els.forEach(el => {
        if (el === elementoSelecionado) return;
        const nome = el.dataset.qName || el.id;
        const opt = document.createElement("option");
        opt.value = nome;
        opt.textContent = `${nome} <${el.tagName.toLowerCase()}>`;
        if (elementoSelecionado && elementoSelecionado.parentElement === el) {
            opt.selected = true;
        }
        propParent.appendChild(opt);
    });
}

function carregarPagina(index, manterModoExecucao = false) {
    if (index < 0 || index >= paginas.length) return;
    paginaAtualIndex = index;
    elementoSelecionado = null;
    noSelectionMsg.style.display = "block";
    propFields.style.display = "none";

    const pag = paginas[paginaAtualIndex];
    pyCode.value = pag.py;
    cssCode.value = pag.css;
    pyHighlight.innerHTML = colorirPython(pyCode.value);
    cssHighlight.innerHTML = colorirCSS(cssCode.value);
    atualizarSeletorPaginas();

    viewPort.srcdoc = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    margin: 0;
                    width: 100vw;
                    height: 100vh;
                    overflow: hidden;
                    font-family: sans-serif;
                    background-image: radial-gradient(#cbd5e1 1px, transparent 1px);
                    background-size: 20px 20px;
                }
                .q-element {
                    position: absolute;
                    cursor: grab;
                    user-select: none;
                    -webkit-user-drag: none;
                    box-sizing: border-box;
                }
                .q-element:active { cursor: grabbing; }
                .q-selected {
                    outline: 2px dashed #2563eb !important;
                    outline-offset: 2px;
                }
                .q-selected .resize-handle { display: block !important; }
                .resize-handle {
                    display: none;
                    position: absolute;
                    right: -6px;
                    bottom: -6px;
                    width: 12px;
                    height: 12px;
                    background-color: #000000;
                    border: 2px solid #ffffff;
                    cursor: se-resize;
                    z-index: 10;
                }
                .q-selected .rotate-handle { display: block !important; }
                .rotate-handle {
                    display: none;
                    position: absolute;
                    top: -26px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 14px;
                    height: 14px;
                    background-color: #ffffff;
                    border: 2px solid #000000;
                    border-radius: 50%;
                    cursor: grab;
                    z-index: 10;
                }
                ${forcarImportantNoCSS(cssCode.value)}
            </style>
        </head>
        <body>
            ${pag.html}
        </body>
        </html>
    `;

    viewPort.addEventListener("load", () => {
        configurarEventosPalco();
        atualizarExplorador();
        if (manterModoExecucao) executarScriptPaginaAtual();
    }, { once: true });
}

pageSelect.addEventListener("change", () => {
    salvarEstadoPaginaAtual();
    if (modoExecucao) pararExecucao();
    carregarPagina(Number(pageSelect.value));
});

addPageBtn.addEventListener("click", () => {
    salvarEstadoPaginaAtual();
    if (modoExecucao) pararExecucao();
    const novoNum = paginas.length + 1;
    let nomeBase = `pagina_${novoNum}`;
    while (paginas.some(p => p.nome === nomeBase)) nomeBase += "_nova";
    paginas.push({ id: nomeBase, nome: nomeBase, html: "", py: `# Código da ${nomeBase}\n`, css: `/* CSS */\n` });
    carregarPagina(paginas.length - 1);
});

renamePageBtn.addEventListener("click", () => {
    const atual = paginas[paginaAtualIndex];
    const novoNome = prompt("Digite o novo nome da página:", atual.nome);
    if (!novoNome) return;
    const limpo = novoNome.trim().replace(/[^a-zA-Z0-9_-]/g, "_");
    if (!limpo) return;
    atual.nome = limpo;
    atual.id = limpo;
    atualizarSeletorPaginas();
});

delPageBtn.addEventListener("click", () => {
    if (paginas.length <= 1) return alert("Mínimo de 1 página.");
    paginas.splice(paginaAtualIndex, 1);
    carregarPagina(Math.max(0, paginaAtualIndex - 1));
});

docsBtn.addEventListener("click", () => docsModal.style.display = "flex");
closeDocsBtn.addEventListener("click", () => docsModal.style.display = "none");

function ativarAba(aba) {
    [tabPy, tabCss, tabConsole].forEach(t => t.classList.remove("active"));
    pyContainer.style.display = "none";
    cssContainer.style.display = "none";
    consoleContainer.style.display = "none";
    if (aba === "py") { tabPy.classList.add("active"); pyContainer.style.display = "flex"; }
    else if (aba === "css") { tabCss.classList.add("active"); cssContainer.style.display = "flex"; }
    else { tabConsole.classList.add("active"); consoleContainer.style.display = "flex"; }
}

tabPy.addEventListener("click", () => ativarAba("py"));
tabCss.addEventListener("click", () => ativarAba("css"));
tabConsole.addEventListener("click", () => ativarAba("console"));

function colorirPython(codigo) {
    let html = codigo.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const tokens = [];
    html = html.replace(/(#.*$)|(".*?"|'.*?')/gm, (m, com, str) => {
        const id = `__TOK_${tokens.length}__`;
        tokens.push(com ? `<span class="tok-com">${com}</span>` : `<span class="tok-str">${str}</span>`);
        return id;
    });
    html = html.replace(/\b(def|if|elif|else|for|while|return|True|False|None|and|or|not|in|import)\b/g, '<span class="tok-kw">$1</span>');
    html = html.replace(/\b(page|time|device)\b/g, '<span class="tok-page">$1</span>');
    html = html.replace(/\b(print|create|addStyle|on_click|on_keydown|linkgo|fetch|play|pause|int|str|float|len|sleep|abs|round|min|max)\b/g, '<span class="tok-fn">$1</span>');
    tokens.forEach((tok, i) => html = html.replace(`__TOK_${i}__`, tok));
    return html + (codigo.endsWith("\n") ? " " : "");
}

function colorirCSS(codigo) {
    let html = codigo.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    html = html.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="tok-com">$1</span>');
    html = html.replace(/(@import\s+url\([^)]+\);?)/g, '<span class="tok-kw">$1</span>');
    html = html.replace(/([.#]?[a-zA-Z0-9_-]+)\s*(?=\{)/g, '<span class="tok-sel">$1</span>');
    html = html.replace(/([a-zA-Z-]+)\s*(?=:)/g, '<span class="tok-prop">$1</span>');
    return html + (codigo.endsWith("\n") ? " " : "");
}

function forcarImportantNoCSS(cssBruto) {
    const semComentarios = cssBruto.replace(/\/\*[\s\S]*?\*\//g, "");
    const imports = [];
    const semImports = semComentarios.replace(/@import\s+[^;]+;/gi, (m) => {
        imports.push(m);
        return "";
    });
    const regras = semImports.replace(/([a-zA-Z-]+)\s*:\s*([^;{}]+)(;?)/g, (m, prop, valor) => {
        const v = valor.trim();
        if (!v || v.toLowerCase().includes("!important")) return m;
        return `${prop}: ${v} !important;`;
    });
    return imports.join("\n") + "\n" + regras;
}

function aplicarCssNoPalco() {
    const doc = viewPort.contentDocument;
    if (!doc) return;
    let st = doc.getElementById("userCustomCss");
    if (!st) { st = doc.createElement("style"); st.id = "userCustomCss"; doc.head.appendChild(st); }
    st.textContent = forcarImportantNoCSS(cssCode.value);
}

pyCode.addEventListener("input", () => {
    pyHighlight.innerHTML = colorirPython(pyCode.value);
    paginas[paginaAtualIndex].py = pyCode.value;
    sincronizarScroll(pyCode, pyHighlight);
});

cssCode.addEventListener("input", () => {
    cssHighlight.innerHTML = colorirCSS(cssCode.value);
    aplicarCssNoPalco();
    paginas[paginaAtualIndex].css = cssCode.value;
    sincronizarScroll(cssCode, cssHighlight);
});

function extrairAnguloRotacao(transformStr) {
    if (!transformStr) return 0;
    const match = transformStr.match(/rotate\(\s*(-?\d+(?:\.\d+)?)deg\s*\)/i);
    return match ? Math.round(parseFloat(match[1])) : 0;
}

function instanciarElementoDOM(doc, tipo, nomeCustom = null, customSrc = null, posX = 40, posY = 40) {
    const tagReal = (tipo === "frame") ? "div" : tipo;
    const novoEl = doc.createElement(tagReal);

    let nomeObj = nomeCustom;
    if (!nomeObj) {
        const prefixo = tipo === "button" ? "botao" : tipo;
        nomeObj = `${prefixo}_${contadorId++}`;
        while (doc.querySelector(`[data-q-name="${nomeObj}"]`)) {
            nomeObj = `${prefixo}_${contadorId++}`;
        }
    }

    novoEl.classList.add("q-element");
    novoEl.id = nomeObj;
    novoEl.dataset.qName = nomeObj;
    novoEl.dataset.qType = tipo;
    novoEl.style.left = posX + "px";
    novoEl.style.top = posY + "px";

    if (tipo === "img") {
        novoEl.src = customSrc || "No_Image_Available.png";
        novoEl.style.width = "140px";
    } else if (tipo === "video") {
        novoEl.src = customSrc || "https://www.w3schools.com/html/mov_bbb.mp4";
        novoEl.controls = true;
        novoEl.style.width = "240px";
        novoEl.style.height = "140px";
        novoEl.style.backgroundColor = "#000000";
    } else if (tipo === "audio") {
        novoEl.src = customSrc || "https://www.w3schools.com/html/horse.mp3";
        novoEl.controls = true;
        novoEl.style.width = "260px";
        novoEl.style.height = "50px";
    } else if (tipo === "textarea") {
        novoEl.placeholder = "Escreva...";
        novoEl.style.width = "180px";
        novoEl.style.height = "80px";
    } else if (tipo === "select") {
        novoEl.innerHTML = '<option>Opção 1</option>';
        novoEl.style.width = "140px";
    } else if (tipo === "input") {
        novoEl.placeholder = "Digite...";
        novoEl.style.width = "160px";
    } else if (tipo === "button") {
        novoEl.textContent = "Botão";
        novoEl.style.width = "120px";
    } else if (tipo === "iframe") {
        novoEl.src = customSrc || "https://example.com";
        novoEl.style.width = "300px";
        novoEl.style.height = "200px";
        novoEl.style.border = "2px solid #000000";
        novoEl.style.backgroundColor = "#ffffff";
    } else if (tipo === "frame") {
        novoEl.style.width = "200px";
        novoEl.style.height = "150px";
        novoEl.style.backgroundColor = "#dbeafe";
        novoEl.style.border = "2px solid #000000";
    } else if (tipo === "div") {
        novoEl.style.width = "180px";
        novoEl.style.height = "120px";
        novoEl.style.border = "1px dashed #64748b";
    } else {
        novoEl.textContent = "Texto";
        novoEl.style.width = "150px";
    }

    doc.body.appendChild(novoEl);
    return novoEl;
}

function configurarEventosPalco() {
    const doc = viewPort.contentDocument;
    if (!doc || !doc.body) return;
    let arrastando = null, redimensionando = null, rotacionando = null;
    let offsetX = 0, offsetY = 0, startW = 0, startH = 0, startX = 0, startY = 0, cx = 0, cy = 0;

    doc.body.addEventListener("dragover", (e) => {
        e.preventDefault();
    });

    doc.body.addEventListener("drop", (e) => {
        e.preventDefault();
        if (!arquivoArrastadoAtual) return;

        const item = arquivoArrastadoAtual;
        arquivoArrastadoAtual = null;

        let tipoElemento = "img";
        if (["mp4", "webm"].includes(item.ext)) tipoElemento = "video";
        else if (["mp3", "wav", "ogg"].includes(item.ext)) tipoElemento = "audio";

        const nomeLimpo = item.name.split(".")[0].replace(/[^a-zA-Z0-9_]/g, "_") + "_" + (contadorId++);
        const novoEl = instanciarElementoDOM(doc, tipoElemento, nomeLimpo, item.dataUrl, Math.round(e.clientX), Math.round(e.clientY));
        
        salvarEstadoPaginaAtual();
        selecionarElemento(novoEl);
        registrarConsole(`Ativo "${item.name}" adicionado ao palco!`, "sistema");
    });

    // Funções unificadas de ação para Mouse e Touch
    const iniciarAcao = (e, clientX, clientY, target) => {
        if (modoExecucao) return;

        if (target.classList.contains("rotate-handle")) {
            e.preventDefault();
            e.stopPropagation();
            rotacionando = target.parentElement;
            const r = rotacionando.getBoundingClientRect();
            cx = r.left + r.width / 2;
            cy = r.top + r.height / 2;
            return;
        }

        if (target.classList.contains("resize-handle")) {
            e.preventDefault();
            e.stopPropagation();
            redimensionando = target.parentElement;
            startW = redimensionando.offsetWidth;
            startH = redimensionando.offsetHeight;
            startX = clientX;
            startY = clientY;
            return;
        }

        const alvo = target.closest(".q-element");
        if (alvo) {
            e.preventDefault();
            e.stopPropagation();
            arrastando = alvo;
            offsetX = clientX - arrastando.offsetLeft;
            offsetY = clientY - arrastando.offsetTop;
            selecionarElemento(arrastando);
        } else {
            desmarcarElemento();
        }
    };

    const moverAcao = (clientX, clientY) => {
        if (modoExecucao) return;

        if (rotacionando) {
            const rad = Math.atan2(clientY - cy, clientX - cx);
            let deg = Math.round(rad * (180 / Math.PI) + 90);
            rotacionando.style.setProperty("transform", `rotate(${deg}deg)`, "important");
            if (elementoSelecionado === rotacionando) {
                propRotation.value = deg;
            }
            return;
        }

        if (redimensionando) {
            const nw = Math.max(20, startW + (clientX - startX));
            const nh = Math.max(20, startH + (clientY - startY));
            redimensionando.style.setProperty("width", nw + "px", "important");
            redimensionando.style.setProperty("height", nh + "px", "important");
            if (elementoSelecionado === redimensionando) {
                propWidth.value = nw;
                propHeight.value = nh;
            }
            return;
        }

        if (arrastando) {
            const novoX = Math.round(clientX - offsetX);
            const novoY = Math.round(clientY - offsetY);
            arrastando.style.setProperty("left", novoX + "px", "important");
            arrastando.style.setProperty("top", novoY + "px", "important");
            if (elementoSelecionado === arrastando) {
                propX.value = novoX;
                propY.value = novoY;
            }
        }
    };

    const fimAcao = () => {
        if (arrastando || redimensionando || rotacionando) {
            arrastando = null;
            redimensionando = null;
            rotacionando = null;
            salvarEstadoPaginaAtual();
        }
    };

    // Eventos de Mouse
    doc.addEventListener("mousedown", (e) => iniciarAcao(e, e.clientX, e.clientY, e.target));
    doc.addEventListener("mousemove", (e) => moverAcao(e.clientX, e.clientY));
    doc.addEventListener("mouseup", fimAcao);
    window.addEventListener("mouseup", fimAcao);

    // Eventos de Toque (Mobile / Tablet)
    doc.addEventListener("touchstart", (e) => {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            iniciarAcao(e, touch.clientX, touch.clientY, e.target);
        }
    }, { passive: false });

    doc.addEventListener("touchmove", (e) => {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            moverAcao(touch.clientX, touch.clientY);
        }
    }, { passive: false });

    doc.addEventListener("touchend", fimAcao);
    window.addEventListener("touchend", fimAcao);
}

selectionObject.addEventListener("change", () => {
    const tipo = selectionObject.value;
    if (!tipo) return;
    const doc = viewPort.contentDocument;
    const novoEl = instanciarElementoDOM(doc, tipo);
    salvarEstadoPaginaAtual();
    selecionarElemento(novoEl);
    selectionObject.value = "";
});

function selecionarElemento(el) {
    if (elementoSelecionado) elementoSelecionado.classList.remove("q-selected");
    elementoSelecionado = el;
    el.classList.add("q-selected");
    noSelectionMsg.style.display = "none";
    propFields.style.display = "flex";

    const doc = viewPort.contentDocument;
    if (!el.querySelector(".resize-handle")) {
        const r = doc.createElement("div"); r.className = "resize-handle"; el.appendChild(r);
    }
    if (!el.querySelector(".rotate-handle")) {
        const rot = doc.createElement("div"); rot.className = "rotate-handle"; el.appendChild(rot);
    }

    const tag = el.tagName.toLowerCase();
    const isMediaOrIframe = tag === "img" || tag === "video" || tag === "audio" || tag === "iframe";
    propName.value = el.dataset.qName || el.id;
    propSrcGroup.style.display = isMediaOrIframe ? "block" : "none";

    if (isMediaOrIframe) {
        propTextLabel.textContent = tag === "iframe" ? "Título do Iframe:" : "Descrição:";
        propText.value = el.alt || el.title || "";
        propSrc.value = (el.src && el.src.startsWith("data:")) ? "[Arquivo Local]" : (el.src || "");
    } else if (tag === "input" || tag === "textarea") {
        propTextLabel.textContent = "Placeholder:"; propText.value = el.placeholder || "";
    } else {
        propTextLabel.textContent = "Texto:"; propText.value = el.textContent || "";
    }

    atualizarOpcoesParentesco();

    propX.value = parseInt(el.style.left) || el.offsetLeft || 0;
    propY.value = parseInt(el.style.top) || el.offsetTop || 0;
    propRotation.value = extrairAnguloRotacao(el.style.transform);

    propWidth.value = parseInt(el.style.width) || el.offsetWidth;
    propHeight.value = parseInt(el.style.height) || "";
    propRadius.value = parseInt(el.style.borderRadius) || 0;
    valRadius.textContent = propRadius.value;
    propBorderWidth.value = parseInt(el.style.borderWidth) || 0;
    propBorderColor.value = rgbParaHex(el.style.borderColor || "#000000");
    propFontSize.value = parseInt(el.style.fontSize) || "";
    propVisibleCheck.checked = el.style.display !== "none";
    propBg.value = rgbParaHex(el.style.backgroundColor || "#ffffff");
    propColor.value = rgbParaHex(el.style.color || "#000000");
    atualizarExplorador();
}

function desmarcarElemento() {
    if (elementoSelecionado) { elementoSelecionado.classList.remove("q-selected"); elementoSelecionado = null; }
    noSelectionMsg.style.display = "block";
    propFields.style.display = "none";
    atualizarExplorador();
}

propParent.addEventListener("change", () => {
    if (!elementoSelecionado) return;
    const doc = viewPort.contentDocument;
    const nomePai = propParent.value;
    if (!nomePai) {
        doc.body.appendChild(elementoSelecionado);
    } else {
        const paiEl = doc.querySelector(`[data-q-name="${nomePai}"]`) || doc.getElementById(nomePai);
        if (paiEl && paiEl !== elementoSelecionado && !elementoSelecionado.contains(paiEl)) {
            paiEl.appendChild(elementoSelecionado);
        }
    }
    salvarEstadoPaginaAtual();
    atualizarExplorador();
});

propName.addEventListener("change", () => {
    if (!elementoSelecionado) return;
    const limpo = propName.value.trim().replace(/[^a-zA-Z0-9_]/g, "_");
    elementoSelecionado.dataset.qName = limpo;
    elementoSelecionado.id = limpo;
    salvarEstadoPaginaAtual();
    atualizarExplorador();
});

propText.addEventListener("input", () => {
    if (!elementoSelecionado) return;
    const tag = elementoSelecionado.tagName.toLowerCase();
    if (tag === "input" || tag === "textarea") elementoSelecionado.placeholder = propText.value;
    else if (tag === "img") elementoSelecionado.alt = propText.value;
    else if (tag === "iframe") elementoSelecionado.title = propText.value;
    else {
        const handles = Array.from(elementoSelecionado.querySelectorAll(".resize-handle, .rotate-handle"));
        elementoSelecionado.textContent = propText.value;
        handles.forEach(h => elementoSelecionado.appendChild(h));
    }
    salvarEstadoPaginaAtual();
});

propSrc.addEventListener("change", () => {
    if (!elementoSelecionado || !propSrc.value || propSrc.value === "[Arquivo Local]") return;
    elementoSelecionado.src = propSrc.value;
    salvarEstadoPaginaAtual();
});

propMediaFile.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file || !elementoSelecionado) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        elementoSelecionado.src = ev.target.result;
        propSrc.value = "[Arquivo Local]";
        salvarEstadoPaginaAtual();
    };
    reader.readAsDataURL(file);
});

propX.addEventListener("input", () => {
    if (!elementoSelecionado) return;
    elementoSelecionado.style.setProperty("left", (parseInt(propX.value) || 0) + "px", "important");
    salvarEstadoPaginaAtual();
});

propY.addEventListener("input", () => {
    if (!elementoSelecionado) return;
    elementoSelecionado.style.setProperty("top", (parseInt(propY.value) || 0) + "px", "important");
    salvarEstadoPaginaAtual();
});

propRotation.addEventListener("input", () => {
    if (!elementoSelecionado) return;
    const deg = parseInt(propRotation.value) || 0;
    elementoSelecionado.style.setProperty("transform", `rotate(${deg}deg)`, "important");
    salvarEstadoPaginaAtual();
});

propWidth.addEventListener("input", () => {
    if (!elementoSelecionado) return;
    const w = parseInt(propWidth.value);
    if (w > 0) elementoSelecionado.style.setProperty("width", w + "px", "important");
    salvarEstadoPaginaAtual();
});

propHeight.addEventListener("input", () => {
    if (!elementoSelecionado) return;
    const h = parseInt(propHeight.value);
    if (!propHeight.value) elementoSelecionado.style.removeProperty("height");
    else if (h > 0) elementoSelecionado.style.setProperty("height", h + "px", "important");
    salvarEstadoPaginaAtual();
});

propRadius.addEventListener("input", () => {
    if (!elementoSelecionado) return;
    valRadius.textContent = propRadius.value;
    elementoSelecionado.style.setProperty("border-radius", propRadius.value + "px", "important");
    salvarEstadoPaginaAtual();
});

propBorderWidth.addEventListener("input", () => {
    if (!elementoSelecionado) return;
    elementoSelecionado.style.setProperty("border-width", propBorderWidth.value + "px", "important");
    elementoSelecionado.style.setProperty("border-style", "solid", "important");
    salvarEstadoPaginaAtual();
});

propBorderColor.addEventListener("input", () => {
    if (!elementoSelecionado) return;
    elementoSelecionado.style.setProperty("border-color", propBorderColor.value, "important");
    salvarEstadoPaginaAtual();
});

propFontSize.addEventListener("input", () => {
    if (!elementoSelecionado) return;
    const fs = propFontSize.value;
    if (!fs) elementoSelecionado.style.removeProperty("font-size");
    else elementoSelecionado.style.setProperty("font-size", fs + "px", "important");
    salvarEstadoPaginaAtual();
});

propVisibleCheck.addEventListener("change", () => {
    if (!elementoSelecionado) return;
    elementoSelecionado.style.setProperty("display", propVisibleCheck.checked ? "" : "none", "important");
    salvarEstadoPaginaAtual();
});

propBg.addEventListener("input", () => {
    if (!elementoSelecionado) return;
    elementoSelecionado.style.setProperty("background-color", propBg.value, "important");
    salvarEstadoPaginaAtual();
});

propColor.addEventListener("input", () => {
    if (!elementoSelecionado) return;
    elementoSelecionado.style.setProperty("color", propColor.value, "important");
    salvarEstadoPaginaAtual();
});

deleteBtn.addEventListener("click", () => {
    if (elementoSelecionado) { elementoSelecionado.remove(); salvarEstadoPaginaAtual(); desmarcarElemento(); }
});

function atualizarExplorador() {
    const doc = viewPort.contentDocument;
    if (!doc) return;
    const els = Array.from(doc.querySelectorAll(".q-element"));
    explorerList.innerHTML = "";
    objectCount.textContent = `${els.length} itens`;
    els.forEach(el => {
        const li = document.createElement("li");
        li.className = "explorer-item" + (el === elementoSelecionado ? " active" : "");
        const temPai = el.parentElement && el.parentElement.classList.contains("q-element");
        const prefixo = temPai ? "↳ " : "◈ ";
        li.textContent = `${prefixo}${el.dataset.qName || el.id} <${el.dataset.qType || el.tagName.toLowerCase()}>`;
        li.addEventListener("click", () => selecionarElemento(el));
        explorerList.appendChild(li);
    });
}

// ==========================================
// MOTOR PYTHON (WRAPPER, CREATE, ADDSTYLE, DEVICE, API)
// ==========================================
function criarWrapperObjeto(el, doc) {
    return new Proxy({
        _el: el,
        get text() { return (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') ? el.value : el.textContent; },
        set text(v) { if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.value = v; else el.textContent = v; },
        get value() { return el.value !== undefined ? el.value : el.textContent; },
        set value(v) { el.value = v; },
        get src() { return el.src || ''; },
        set src(v) { el.src = v; },
        get x() { return parseInt(el.style.left) || 0; },
        set x(v) { el.style.setProperty('left', v + 'px', 'important'); },
        get y() { return parseInt(el.style.top) || 0; },
        set y(v) { el.style.setProperty('top', v + 'px', 'important'); },
        get width() { return parseInt(el.style.width) || el.offsetWidth; },
        set width(v) { el.style.setProperty('width', v + 'px', 'important'); },
        get height() { return parseInt(el.style.height) || el.offsetHeight; },
        set height(v) { el.style.setProperty('height', v + 'px', 'important'); },
        get bg() { return el.style.backgroundColor || ''; },
        set bg(v) { el.style.setProperty('background-color', v, 'important'); },
        get color() { return el.style.color || ''; },
        set color(v) { el.style.setProperty('color', v, 'important'); },
        get visible() { return el.style.display !== 'none'; },
        set visible(v) { el.style.setProperty('display', v ? '' : 'none', 'important'); },
        get transform() { return el.style.transform || ''; },
        set transform(v) { el.style.setProperty('transform', v, 'important'); },
        get rotation() { return extrairAnguloRotacao(el.style.transform); },
        set rotation(v) { el.style.setProperty('transform', `rotate(${v}deg)`, 'important'); },
        get parent() { return el.parentElement; },
        set parent(alvo) {
            if (!alvo) {
                doc.body.appendChild(el);
            } else if (alvo._el) {
                alvo._el.appendChild(el);
            } else if (typeof alvo === "string") {
                const p = doc.querySelector(`[data-q-name="${alvo}"]`) || doc.getElementById(alvo);
                if (p) p.appendChild(el);
            }
        },
        addStyle(cssString) {
            if (!cssString) return;
            const regras = cssString.split(";").map(r => r.trim()).filter(Boolean);
            regras.forEach(regra => {
                const idx = regra.indexOf(":");
                if (idx !== -1) {
                    const prop = regra.slice(0, idx).trim();
                    const val = regra.slice(idx + 1).replace(/!important/gi, "").trim();
                    el.style.setProperty(prop, val, "important");
                }
            });
        },
        play() { if (el.play) el.play(); },
        pause() { if (el.pause) el.pause(); },
        remove() { el.remove(); },
        on_click(fn) {
            el.addEventListener('click', async (e) => {
                e.preventDefault();
                try { await fn(); } catch(err) { registrarConsole(err.message, "erro"); }
            });
            el.addEventListener('touchend', async (e) => {
                e.preventDefault();
                try { await fn(); } catch(err) { registrarConsole(err.message, "erro"); }
            });
        }
    }, {
        get(t, p) { return p in t ? t[p] : el[p]; },
        set(t, p, v) { if (p in t) t[p] = v; else el[p] = v; return true; }
    });
}

function transpilarPythonParaJS(codigoPy) {
    const linhas = codigoPy.split("\n");
    const saidaJS = [];
    const pilha = [0];

    for (let raw of linhas) {
        let linha = raw.trim();
        if (!linha || linha.startsWith("#")) continue;
        if (linha.startsWith("import ") || linha.startsWith("from ")) continue;

        const indent = raw.match(/^ */)[0].length;
        while (indent < pilha[pilha.length - 1]) { pilha.pop(); saidaJS.push("}"); }

        linha = linha.replace(/\bTrue\b/g, "true").replace(/\bFalse\b/g, "false").replace(/\bNone\b/g, "null").replace(/\band\b/g, "&&").replace(/\bor\b/g, "||").replace(/\bnot\b/g, "!");
        linha = linha.replace(/\btime\.sleep\(/g, "await time.sleep(");

        if (linha.startsWith("def ") && linha.endsWith(":")) {
            const sig = linha.slice(4, -1).trim();
            saidaJS.push(`async function ${sig} {`);
            pilha.push(indent + 4);
        } else if (linha.startsWith("if ") && linha.endsWith(":")) {
            saidaJS.push(`if (${linha.slice(3, -1).trim()}) {`);
            pilha.push(indent + 4);
        } else if (linha === "else:") {
            saidaJS.push("} else {");
        } else {
            saidaJS.push(`${linha};`);
        }
    }
    while (pilha.length > 1) { pilha.pop(); saidaJS.push("}"); }
    return saidaJS.join("\n");
}

function executarScriptPaginaAtual() {
    modoExecucao = true;
    const doc = viewPort.contentDocument;

    const deviceInfo = {
        get is_mobile() {
            return /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
        },
        get is_tablet() {
            return /iPad|Tablet/i.test(navigator.userAgent) || (window.innerWidth > 768 && window.innerWidth <= 1024);
        },
        get is_desktop() {
            return !this.is_mobile && !this.is_tablet;
        },
        get width() { return doc.documentElement.clientWidth || window.innerWidth; },
        get height() { return doc.documentElement.clientHeight || window.innerHeight; }
    };

    const pageProxy = new Proxy({
        device: deviceInfo,
        create(tipo, nome = null) {
            const novoEl = instanciarElementoDOM(doc, tipo, nome);
            atualizarExplorador();
            return criarWrapperObjeto(novoEl, doc);
        },
        async fetch(endpoint, payload = {}) {
            registrarConsole(`[API] ${apiConfig.method} ${endpoint}...`, "sistema");
            try {
                let parsedHeaders = { "Content-Type": "application/json" };
                try { parsedHeaders = JSON.parse(apiConfig.headers); } catch(e) {}
                if (apiConfig.token) {
                    parsedHeaders["Authorization"] = `Bearer ${apiConfig.token}`;
                }

                const controller = new AbortController();
                const idTimeout = setTimeout(() => controller.abort(), apiConfig.timeout);

                const options = {
                    method: apiConfig.method || "POST",
                    headers: parsedHeaders,
                    signal: controller.signal
                };
                if (options.method !== "GET") {
                    options.body = JSON.stringify(payload);
                }

                const response = await fetch((apiConfig.baseUrl || "") + endpoint, options);
                clearTimeout(idTimeout);
                return await response.json();
            } catch (err) {
                registrarConsole(`[API Erro] ${err.message}`, "erro");
                return null;
            }
        }
    }, {
        get(target, prop) {
            const nome = String(prop);
            if (nome in target) return target[nome];
            if (nome === "linkgo") {
                return (dest) => {
                    if (dest.startsWith("http")) window.open(dest, "_blank");
                    else {
                        const idx = paginas.findIndex(p => p.nome === dest);
                        if (idx !== -1) carregarPagina(idx, true);
                    }
                };
            }
            if (nome === "on_keydown") {
                return (fn) => {
                    doc.addEventListener("keydown", async (e) => { try { await fn(e.key); } catch(err) { registrarConsole(err.message, "erro"); } });
                };
            }
            const alvo = doc.querySelector(`[data-q-name="${nome}"]`) || doc.getElementById(nome);
            if (!alvo) throw new Error(`Objeto '${nome}' não encontrado.`);
            return criarWrapperObjeto(alvo, doc);
        }
    });

    const builtins = {
        abs: Math.abs, round: Math.round, min: Math.min, max: Math.max,
        int: (v) => parseInt(v, 10) || 0,
        str: (v) => String(v),
        float: (v) => parseFloat(v) || 0,
        len: (v) => (v && v.length !== undefined ? v.length : 0),
        json_encode: (v) => JSON.stringify(v),
        json_decode: (v) => JSON.parse(v),
        random: () => Math.random()
    };

    try {
        const code = transpilarPythonParaJS(pyCode.value);
        const execArgs = ["page", "time", "print", ...Object.keys(builtins)];
        const execVals = [pageProxy, { sleep: (s) => new Promise(r => setTimeout(r, s * 1000)) }, (...a) => registrarConsole(a.join(" ")), ...Object.values(builtins)];
        
        const exec = new Function(...execArgs, `return (async () => { ${code} })();`);
        exec(...execVals);
        registrarConsole(`▶ [v2.6] Executando com sucesso.`, "sistema");
    } catch (err) {
        registrarConsole(err.message, "erro");
    }
}

function pararExecucao() {
    modoExecucao = false;
    carregarPagina(paginaAtualIndex, false);
}

runPyBtn.addEventListener("click", () => { salvarEstadoPaginaAtual(); executarScriptPaginaAtual(); });
stopPyBtn.addEventListener("click", pararExecucao);

// ==========================================
// 6. EXPORTAÇÃO HTML COM ESCALA PROPORCIONAL AO VIEWPORT
// ==========================================
exportBtn.addEventListener("click", () => {
    salvarEstadoPaginaAtual();
    let blocosHTML = "";
    let cssExport = "";
    let scriptsJS = "";

    paginas.forEach((pag, idx) => {
        const tmp = document.createElement("div");
        tmp.innerHTML = pag.html;
        tmp.querySelectorAll(".q-element").forEach(el => {
            el.classList.remove("q-element", "q-selected");
            el.style.cursor = "";
        });
        tmp.querySelectorAll(".resize-handle, .rotate-handle").forEach(el => el.remove());

        blocosHTML += `<div id="qpage_${pag.nome}" class="q-page" style="display: ${idx === 0 ? 'block' : 'none'};">${tmp.innerHTML.trim()}</div>\n`;
        cssExport += `/* CSS - ${pag.nome} */\n${forcarImportantNoCSS(pag.css)}\n`;
        scriptsJS += `"${pag.nome}": async function(page, time, print) {\n${transpilarPythonParaJS(pag.py)}\n},\n`;
    });

    const vpWidth = viewPort.clientWidth || 1024;
    const vpHeight = viewPort.clientHeight || 768;

    const htmlFinal = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>Projeto q.studio v2.6</title>
<style>
body {
    margin: 0;
    padding: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background-color: #000000;
    font-family: sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
}
#gameContainer {
    position: relative;
    width: ${vpWidth}px;
    height: ${vpHeight}px;
    background-color: #ffffff;
    overflow: hidden;
    transform-origin: center center;
}
.q-page {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}
.q-page * {
    position: absolute;
    box-sizing: border-box;
}
${cssExport}
</style>
</head>
<body>
<div id="gameContainer">
    ${blocosHTML}
</div>
<script>
// Sistema de Escala Proporcional ao Viewport de Criação (Suporte a Mobile/PC)
function ajustarEscala() {
    const container = document.getElementById('gameContainer');
    const baseW = ${vpWidth};
    const baseH = ${vpHeight};
    const scaleX = window.innerWidth / baseW;
    const scaleY = window.innerHeight / baseH;
    const scale = Math.min(scaleX, scaleY);
    container.style.transform = 'scale(' + scale + ')';
}
window.addEventListener('resize', ajustarEscala);
window.addEventListener('load', ajustarEscala);
window.addEventListener('orientationchange', () => setTimeout(ajustarEscala, 200));

const apiConfig = ${JSON.stringify(apiConfig)};
function irParaPagina(dest) {
    document.querySelectorAll('.q-page').forEach(p => p.style.display = 'none');
    const alvo = document.getElementById('qpage_' + dest);
    if (alvo) { alvo.style.display = 'block'; iniciarScript(dest); }
}
const scripts = { ${scriptsJS} };
const deviceInfo = {
    get is_mobile() { return /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768; },
    get is_tablet() { return /iPad|Tablet/i.test(navigator.userAgent) || (window.innerWidth > 768 && window.innerWidth <= 1024); },
    get is_desktop() { return !this.is_mobile && !this.is_tablet; },
    get width() { return ${vpWidth}; },
    get height() { return ${vpHeight}; }
};
function criarWrapperExport(el, container) {
    return new Proxy({
        _el: el,
        get text() { return (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') ? el.value : el.textContent; },
        set text(v) { if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.value = v; else el.textContent = v; },
        get x() { return parseInt(el.style.left) || 0; },
        set x(v) { el.style.setProperty('left', v + 'px', 'important'); },
        get y() { return parseInt(el.style.top) || 0; },
        set y(v) { el.style.setProperty('top', v + 'px', 'important'); },
        get width() { return parseInt(el.style.width) || el.offsetWidth; },
        set width(v) { el.style.setProperty('width', v + 'px', 'important'); },
        get height() { return parseInt(el.style.height) || el.offsetHeight; },
        set height(v) { el.style.setProperty('height', v + 'px', 'important'); },
        get rotation() { const m = (el.style.transform || '').match(/rotate\\(\\s*(-?\\d+(?:\\.\\d+)?)deg\\s*\\)/i); return m ? parseFloat(m[1]) : 0; },
        set rotation(v) { el.style.setProperty('transform', 'rotate(' + v + 'deg)', 'important'); },
        get parent() { return el.parentElement; },
        set parent(alvo) { if (alvo && alvo._el) alvo._el.appendChild(el); else if (typeof alvo === 'string') { const p = container.querySelector('[data-q-name="' + alvo + '"]') || container.querySelector('#' + alvo); if (p) p.appendChild(el); } },
        addStyle(css) { css.split(';').map(r=>r.trim()).filter(Boolean).forEach(r => { const i = r.indexOf(':'); if (i!==-1) el.style.setProperty(r.slice(0,i).trim(), r.slice(i+1).trim(), 'important'); }); },
        on_click(fn) { 
            el.addEventListener('click', (e) => { e.preventDefault(); fn(); });
            el.addEventListener('touchend', (e) => { e.preventDefault(); fn(); });
        },
        play() { if(el.play) el.play(); },
        pause() { if(el.pause) el.pause(); }
    }, {
        get(t, p) { return p in t ? t[p] : el[p]; },
        set(t, p, v) { if (p in t) t[p] = v; else el[p] = v; return true; }
    });
}
function criarProxy(container) {
    return new Proxy({
        device: deviceInfo,
        create(tipo, nome) {
            const tag = tipo === 'frame' ? 'div' : tipo;
            const el = document.createElement(tag);
            if (nome) { el.id = nome; el.dataset.qName = nome; }
            el.style.position = 'absolute';
            if (tipo === 'frame') { el.style.width = '200px'; el.style.height = '150px'; el.style.backgroundColor = '#dbeafe'; }
            container.appendChild(el);
            return criarWrapperExport(el, container);
        },
        async fetch(endpoint, payload = {}) {
            let h = { "Content-Type": "application/json" };
            try { h = JSON.parse(apiConfig.headers); } catch(e) {}
            if (apiConfig.token) h["Authorization"] = "Bearer " + apiConfig.token;
            const opt = { method: apiConfig.method || "POST", headers: h };
            if (opt.method !== "GET") opt.body = JSON.stringify(payload);
            const r = await fetch((apiConfig.baseUrl || "") + endpoint, opt);
            return await r.json();
        }
    }, {
        get(target, prop) {
            const nome = String(prop);
            if (nome in target) return target[nome];
            if (nome === 'linkgo') return (dest) => dest.startsWith('http') ? window.open(dest, '_blank') : irParaPagina(dest);
            if (nome === 'on_keydown') return (fn) => document.addEventListener('keydown', (e) => fn(e.key));
            const el = container.querySelector('[data-q-name="' + nome + '"]') || container.querySelector('#' + nome);
            if (!el) return null;
            return criarWrapperExport(el, container);
        }
    });
}
function iniciarScript(nome) {
    const cont = document.getElementById('qpage_' + nome);
    if (!cont || !scripts[nome]) return;
    scripts[nome](criarProxy(cont), { sleep: s => new Promise(r => setTimeout(r, s*1000)) }, console.log);
}
iniciarScript("${paginas[0].nome}");
</script>
</body>
</html>`;

    const blob = new Blob([htmlFinal], { type: "text/html" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "projeto-qstudio.html";
    link.click();
});

function rgbParaHex(rgb) {
    if (!rgb || rgb.startsWith("#")) return rgb || "#000000";
    const m = rgb.match(/\d+/g);
    return m ? "#" + m.slice(0, 3).map(x => Number(x).toString(16).padStart(2, "0")).join("") : "#000000";
}

carregarPagina(0);