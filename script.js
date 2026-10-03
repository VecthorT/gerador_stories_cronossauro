const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const upload = document.getElementById("upload");
const salvar = document.getElementById("download");
const mensagem = document.getElementById("mensagem");

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

const caminhoMoldura =
    `../assets/${nomePagina}.png`;

template.src = caminhoMoldura;

console.log("Página:", nomePagina);
console.log("Moldura:", caminhoMoldura);


// =====================================
// ESTADOS
// =====================================

let molduraCarregada = false;
let fotoCarregada = false;


// Botão começa desativado
salvar.disabled = true;


// =====================================
// MOLDURA CARREGADA
// =====================================

molduraCarregada = true;

console.log("Moldura carregada.");

    template.onload = function () {

};


// =====================================
// ERRO AO CARREGAR MOLDURA
// =====================================

template.onerror = function () {

    console.error(
        "Não foi possível carregar a moldura:",
        caminhoMoldura
    );

    mensagem.textContent =
        "Erro ao carregar a moldura.";

};


// =====================================
// ESCOLHER FOTO
// =====================================

upload.addEventListener(
    "change",
    function (e) {

        const file = e.target.files[0];


        if (!file) {

            fotoCarregada = false;

            salvar.disabled = true;

            return;
        }


        const img = new Image();


        img.onload = function () {

            // =====================================
            // LIMPA CANVAS
            // =====================================

            ctx.clearRect(
                0,
                0,
                canvas.width,
                canvas.height
            );


            // =====================================
            // CALCULA PROPORÇÃO
            // =====================================

            const hRatio =
                canvas.width / img.width;

            const vRatio =
                canvas.height / img.height;

            const ratio =
                Math.max(
                    hRatio,
                    vRatio
                );


            const newWidth =
                img.width * ratio;

            const newHeight =
                img.height * ratio;


            // =====================================
            // CENTRALIZA
            // =====================================

            const x =
                (canvas.width - newWidth) / 2;

            const y =
                (canvas.height - newHeight) / 2;


            // =====================================
            // DESENHA FOTO
            // =====================================

            ctx.drawImage(
                img,
                x,
                y,
                newWidth,
                newHeight
            );


            // =====================================
            // DESENHA MOLDURA
            // =====================================

            if (molduraCarregada) {

                ctx.drawImage(
                    template,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );

                fotoCarregada = true;

                salvar.disabled = false;

                mensagem.textContent =
                    "Sua arte está pronta!";

            } else {

                fotoCarregada = false;

                salvar.disabled = true;

                mensagem.textContent =
                    "Aguarde a moldura carregar.";

            }


            // Libera memória da foto
            URL.revokeObjectURL(img.src);

        };


        // =====================================
        // ERRO DA FOTO
        // =====================================

        img.onerror = function () {

            fotoCarregada = false;

            salvar.disabled = true;

            mensagem.textContent =
                "Não foi possível carregar essa foto.";

        };


        // =====================================
        // CARREGA FOTO
        // =====================================

        img.src =
            URL.createObjectURL(file);

    }
);


// =====================================
// SALVAR IMAGEM
// =====================================

salvar.addEventListener(
    "click",
    async function () {

        if (!fotoCarregada) {

            mensagem.textContent =
                "Escolha uma foto primeiro.";

            return;
        }


        mensagem.textContent =
            "Preparando sua imagem...";


        // =====================================
        // TRANSFORMA CANVAS EM BLOB
        // =====================================

        canvas.toBlob(
            async function (blob) {

                if (!blob) {

                    mensagem.textContent =
                        "Não foi possível gerar a imagem.";

                    return;
                }


                // =====================================
                // NOME DO ARQUIVO
                // =====================================

                const nomeArquivo =
                    `cronossauros-${nomePagina}.png`;


                // =====================================
                // DETECTA IOS
                // =====================================

                const isIOS =
                    /iPad|iPhone|iPod/.test(
                        navigator.userAgent
                    ) ||
                    (
                        navigator.platform === "MacIntel" &&
                        navigator.maxTouchPoints > 1
                    );


                // =====================================
                // IPHONE / IPAD
                // =====================================

                if (isIOS) {

                    await salvarNoIOS(
                        blob,
                        nomeArquivo
                    );

                    return;
                }


                // =====================================
                // ANDROID / COMPUTADOR
                // =====================================

                const url =
                    URL.createObjectURL(blob);


                const link =
                    document.createElement("a");


                link.href = url;

                link.download =
                    nomeArquivo;


                document.body.appendChild(link);

                link.click();

                document.body.removeChild(link);


                mensagem.textContent =
                    "Imagem salva com sucesso!";


                setTimeout(
                    function () {

                        URL.revokeObjectURL(url);

                    },
                    10000
                );

            },
            "image/png"
        );

    }
);


// =====================================
// SALVAR NO IPHONE / IPAD
// =====================================

async function salvarNoIOS(
    blob,
    nomeArquivo
) {

    try {

        // =====================================
        // CRIA ARQUIVO REAL
        // =====================================

        const arquivo =
            new File(
                [blob],
                nomeArquivo,
                {
                    type: "image/png"
                }
            );


        // =====================================
        // VERIFICA COMPARTILHAMENTO
        // =====================================

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

                title:
                    "Minha arte Cronossauros",

                text:
                    "Minha arte da corrida!"

            });


            mensagem.textContent =
                "Imagem pronta para salvar!";


            return;
        }


        // =====================================
        // FALLBACK IOS
        // =====================================

        mostrarImagemParaSalvar(blob);

    }

    catch (erro) {

        console.log(
            "Compartilhamento cancelado ou indisponível:",
            erro
        );


        // Se o usuário apenas fechou o menu
        if (
            erro &&
            erro.name === "AbortError"
        ) {

            mensagem.textContent =
                "Compartilhamento cancelado.";

            return;
        }


        // Qualquer outro erro
        mostrarImagemParaSalvar(blob);

    }

}


// =====================================
// FALLBACK
// MOSTRA IMAGEM NA TELA
// =====================================

function mostrarImagemParaSalvar(blob) {

    const url =
        URL.createObjectURL(blob);


    // Remove tela anterior
    const antigo =
        document.getElementById(
            "telaSalvarIOS"
        );


    if (antigo) {

        antigo.remove();

    }


    // =====================================
    // CRIA TELA
    // =====================================

    const tela =
        document.createElement("div");


    tela.id =
        "telaSalvarIOS";


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
                <strong>
                    "Salvar em Fotos"
                </strong>

            </p>


            <img
                src="${url}"
                class="ios-imagem"
                alt="Sua arte"
            >

        </div>

    `;


    document.body.appendChild(tela);


    // =====================================
    // FECHAR
    // =====================================

    const fechar =
        document.getElementById(
            "fecharIOS"
        );


    fechar.addEventListener(
        "click",
        function () {

            tela.remove();

            URL.revokeObjectURL(url);

        }
    );


    mensagem.textContent =
        "Toque e segure a imagem para salvar.";

}
