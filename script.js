const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const upload = document.getElementById("upload");
const salvar = document.getElementById("download");
const mensagem = document.getElementById("mensagem");

const template = new Image();
const nomePagina = window.location.pathname
    .split("/")
    .pop()
    .replace(".html", "");

const caminhoMoldura =
    `../assets/${nomePagina}.png`;

template.src = caminhoMoldura;

console.log("Página:", nomePagina);
console.log("Moldura:", caminhoMoldura);


// Botão começa desativado
salvar.disabled = true;


// Quando a moldura carregar
template.onload = function () {

    console.log("Moldura carregada.");

};


// Erro ao carregar moldura
template.onerror = function () {

    console.error("Não foi possível carregar a moldura.");

    mensagem.textContent =
        "Erro ao carregar a moldura.";

};


// Escolher imagem
upload.addEventListener("change", function (e) {

    const file = e.target.files[0];

    if (!file) {

        salvar.disabled = true;

        return;

    }


    const img = new Image();

    img.onload = function () {

        // Limpa o canvas
        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        // Calcula proporção
        const hRatio = canvas.width / img.width;
        const vRatio = canvas.height / img.height;

        const ratio = Math.max(
            hRatio,
            vRatio
        );


        const newWidth =
            img.width * ratio;

        const newHeight =
            img.height * ratio;


        // Centraliza
        const x =
            (canvas.width - newWidth) / 2;

        const y =
            (canvas.height - newHeight) / 2;


        // Desenha foto
        ctx.drawImage(
            img,
            x,
            y,
            newWidth,
            newHeight
        );


        // Desenha moldura
        if (template.complete) {

            ctx.drawImage(
                template,
                0,
                0,
                canvas.width,
                canvas.height
            );

            salvar.disabled = false;

            mensagem.textContent =
                "Sua arte está pronta!";

        }

    };


    img.onerror = function () {

        mensagem.textContent =
            "Não foi possível carregar essa foto.";

    };


    img.src = URL.createObjectURL(file);

});


// =====================================
// SALVAR IMAGEM
// =====================================

salvar.addEventListener("click", function () {

    // Converte Canvas para Blob
    canvas.toBlob(function (blob) {

        if (!blob) {

            mensagem.textContent =
                "Não foi possível gerar a imagem.";

            return;

        }


        // Cria URL temporária
        const url =
            URL.createObjectURL(blob);


        // Detecta iPhone / iPad
        const isIOS =
            /iPad|iPhone|iPod/.test(navigator.userAgent) ||
            (navigator.platform === "MacIntel" &&
             navigator.maxTouchPoints > 1);


        if (isIOS) {

            /*
             * Safari no iPhone não lida bem
             * com download automático.
             *
             * Abrimos a imagem em uma nova aba.
             */

            const novaAba =
                window.open();

            if (novaAba) {

                novaAba.document.write(`

                    <!DOCTYPE html>

                    <html>

                    <head>

                        <meta
                            name="viewport"
                            content="width=device-width,
                            initial-scale=1.0">

                        <title>
                            Sua arte
                        </title>

                        <style>

                            body {

                                margin: 0;

                                background: #111;

                                display: flex;

                                flex-direction: column;

                                align-items: center;

                                justify-content: center;

                                min-height: 100vh;

                                font-family: Arial;

                                color: white;

                                text-align: center;

                                padding: 20px;

                                box-sizing: border-box;

                            }

                            img {

                                max-width: 100%;

                                max-height: 80vh;

                            }

                            p {

                                color: #ffc400;

                                font-weight: bold;

                            }

                        </style>

                    </head>

                    <body>

                        <p>
                            Toque e segure a imagem
                            para salvar na Fotos
                        </p>

                        <img src="${url}">

                    </body>

                    </html>

                `);

                novaAba.document.close();

            } else {

                mensagem.textContent =
                    "Permita a abertura da nova aba para salvar a imagem.";

            }

        } else {

            // Chrome / Edge / Firefox / Android

            const link =
                document.createElement("a");

            link.href = url;

            link.download =
                "cronossauros.png";


            document.body.appendChild(link);

            link.click();

            document.body.removeChild(link);


            mensagem.textContent =
                "Imagem salva com sucesso!";

        }


        // Libera memória depois
        setTimeout(function () {

            URL.revokeObjectURL(url);

        }, 10000);


    }, "image/png");

});