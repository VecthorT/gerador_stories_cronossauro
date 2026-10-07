
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const upload = document.getElementById("upload");
const salvar = document.getElementById("download");
const mensagem = document.getElementById("mensagem");

const areaNome = document.getElementById("areaNome");
const nomePessoa = document.getElementById("nomePessoa");

const template = new Image();

// =====================================
// DESCOBRE O NOME DA PÁGINA
// =====================================

const nomePagina = window.location.pathname
    .split("/")
    .pop()
    .replace(".html", "");

// =====================================
// CAMINHO DA MOLDURA
// =====================================

const caminhoMoldura = `../assets/${nomePagina}.png`;

template.src = caminhoMoldura;

// =====================================
// CONFIGURAÇÕES DA FOTO E DO NOME
// =====================================

// Área na qual a foto será encaixada.
// Valores em pixels, relativos ao canvas.

const areaFoto = {
    x: 0,
    y: -100,
    largura: 700,
    altura: 1500    
};

// Configuração do nome
// Altere estes valores para posicionar o texto.

const configNome = {
    x: canvas.width / 2,
    y: canvas.height - 280,
    tamanho: 48,
    cor: "#FFFFFF",
    fonte: "Anton",
    alinhamento: "center",
    contorno: true,
    corContorno: "#000000",
    espessuraContorno: 3
};

// =====================================
// ESTADOS
// =====================================

let molduraCarregada = false;
let fotoCarregada = false;
let fotoAtual = null;

// Botão começa desativado
salvar.disabled = true;

// =====================================
// CARREGAR MOLDURA
// =====================================

template.onload = function () {
    molduraCarregada = true;

    console.log("Moldura carregada.");

    redesenharArte();
};

template.onerror = function () {
    molduraCarregada = false;

    console.error(
        "Não foi possível carregar a moldura:",
        caminhoMoldura
    );

    mensagem.textContent = "Erro ao carregar a moldura.";
};

// =====================================
// DESENHAR FOTO
// =====================================

function desenharFoto(img) {
    const area = areaFoto;

    // Calcula a proporção para caber inteira
    // dentro da área configurada.

    const proporcao = Math.min(
        area.largura / img.width,
        area.altura / img.height
    );

    const largura = img.width * proporcao;
    const altura = img.height * proporcao;

    // Centraliza a imagem na área

    const x = area.x + (area.largura - largura) / 2;
    const y = area.y + (area.altura - altura) / 2;

    ctx.drawImage(
        img,
        x,
        y,
        largura,
        altura
    );
}

// =====================================
// DESENHAR NOME
// =====================================

function desenharNome() {
    const nome = nomePessoa.value.trim();

    if (!nome) return;

    ctx.save();

    ctx.textAlign = configNome.alinhamento;
    ctx.textBaseline = "middle";

    ctx.font = `${configNome.tamanho}px "${configNome.fonte}"`;

    // Contorno para melhorar a leitura
    if (configNome.contorno) {
        ctx.lineJoin = "round";
        ctx.lineWidth = configNome.espessuraContorno;
        ctx.strokeStyle = configNome.corContorno;

        ctx.strokeText(
            nome,
            configNome.x,
            configNome.y
        );
    }

    // Texto principal
    ctx.fillStyle = configNome.cor;

    ctx.fillText(
        nome,
        configNome.x,
        configNome.y
    );

    ctx.restore();
}

// =====================================
// REDESENHAR TODA A ARTE
// =====================================

function redesenharArte() {
    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    if (!fotoCarregada || !fotoAtual) {
        return;
    }

    // 1. Desenha a foto
    desenharFoto(fotoAtual);

    // 2. Desenha a moldura por cima
    if (molduraCarregada) {
        ctx.drawImage(
            template,
            0,
            0,
            canvas.width,
            canvas.height
        );
    }

    // 3. Desenha o nome por cima da moldura
    desenharNome();
}

// =====================================
// ESCOLHER FOTO
// =====================================

upload.addEventListener("change", function (e) {
    const file = e.target.files[0];

    if (!file) {
        fotoCarregada = false;
        fotoAtual = null;
        salvar.disabled = true;
        areaNome.hidden = true;
        nomePessoa.value = "";
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }

    // Valida se é uma imagem
    if (!file.type.startsWith("image/")) {
        mensagem.textContent = "Selecione um arquivo de imagem.";
        return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = function () {
        fotoAtual = img;
        fotoCarregada = true;

        // Libera o campo de nome
        areaNome.hidden = false;

        // Atualiza a arte
        if (molduraCarregada) {
            redesenharArte();

            salvar.disabled = false;
            mensagem.textContent = "Sua arte está pronta!";
        } else {
            salvar.disabled = true;
            mensagem.textContent = "Aguarde a moldura carregar.";
        }

        URL.revokeObjectURL(url);
    };

    img.onerror = function () {
        fotoCarregada = false;
        fotoAtual = null;

        salvar.disabled = true;
        areaNome.hidden = true;

        mensagem.textContent =
            "Não foi possível carregar essa foto.";

        URL.revokeObjectURL(url);
    };

    img.src = url;
});

// =====================================
// ATUALIZAR NOME EM TEMPO REAL
// =====================================

nomePessoa.addEventListener("input", function () {
    if (!fotoCarregada) return;

    redesenharArte();
});

// =====================================
// SALVAR IMAGEM
// =====================================

salvar.addEventListener("click", async function () {
    if (!fotoCarregada || !molduraCarregada) {
        mensagem.textContent = "Escolha uma foto primeiro.";
        return;
    }

    mensagem.textContent = "Preparando sua imagem...";

    canvas.toBlob(
        async function (blob) {
            if (!blob) {
                mensagem.textContent =
                    "Não foi possível gerar a imagem.";
                return;
            }

            const nomeArquivo =
                `cronossauros-${nomePagina}.png`;

            // Detecta iOS
            const isIOS =
                /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                (
                    navigator.platform === "MacIntel" &&
                    navigator.maxTouchPoints > 1
                );

            // iPhone / iPad
            if (isIOS) {
                await salvarNoIOS(blob, nomeArquivo);
                return;
            }

            // Android / computador
            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");

            link.href = url;
            link.download = nomeArquivo;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            mensagem.textContent =
                "Imagem salva com sucesso!";

            setTimeout(function () {
                URL.revokeObjectURL(url);
            }, 10000);
        },
        "image/png"
    );
});

// =====================================
// SALVAR NO IPHONE / IPAD
// =====================================

async function salvarNoIOS(blob, nomeArquivo) {
    try {
        const arquivo = new File(
            [blob],
            nomeArquivo,
            {
                type: "image/png"
            }
        );

        if (
            navigator.share &&
            navigator.canShare &&
            navigator.canShare({
                files: [arquivo]
            })
        ) {
            mensagem.textContent =
                "Abrindo opções para salvar...";

            await navigator.share({
                files: [arquivo],
                title: "Minha arte Cronossauros",
                text: "Minha arte da corrida!"
            });

            mensagem.textContent =
                "Imagem pronta para salvar!";

            return;
        }

        mostrarImagemParaSalvar(blob);
    } catch (erro) {
        console.log(
            "Compartilhamento cancelado ou indisponível:",
            erro
        );

        if (erro && erro.name === "AbortError") {
            mensagem.textContent =
                "Compartilhamento cancelado.";

            return;
        }

        mostrarImagemParaSalvar(blob);
    }
}

// =====================================
// FALLBACK IOS
// MOSTRA IMAGEM NA TELA
// =====================================

function mostrarImagemParaSalvar(blob) {
    const url = URL.createObjectURL(blob);

    const antigo = document.getElementById("telaSalvarIOS");

    if (antigo) {
        antigo.remove();
    }

    const tela = document.createElement("div");

    tela.id = "telaSalvarIOS";

    tela.innerHTML = `
        <div class="ios-conteudo">

            <button
                id="fecharIOS"
                class="ios-fechar"
            >
                ×
            </button>

            <p class="ios-titulo">
                Sua arte está pronta!
            </p>

            <p class="ios-instrucao">
                Toque e segure a imagem
                e escolha
                <strong>"Salvar em Fotos"</strong>
            </p>

            <img
                src="${url}"
                class="ios-imagem"
                alt="Sua arte"
            >

        </div>
    `;

    document.body.appendChild(tela);

    const fechar = document.getElementById("fecharIOS");

    fechar.addEventListener("click", function () {
        tela.remove();
        URL.revokeObjectURL(url);
    });

    mensagem.textContent =
        "Toque e segure a imagem para salvar.";
}