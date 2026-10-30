/* ==========================================
   A TOCA DO MAL - SISTEMA DE VOTAÇÃO
   ATLÉTICA FUNDAÇÃO SANTO ANDRÉ
========================================== */

const VOTACAO_API =
  "https://script.google.com/macros/s/AKfycbxmYrRCB0f36xYhblmJnRnWaJxo5EuggZHBApUgXhhHcEsHTSVLgIB9U6tovIu_HgEQ/exec";

const areaVotacao = document.getElementById("area-votacao");


// ==========================================
// ESTILOS DA VOTAÇÃO
// ==========================================

const estiloVotacao = document.createElement("style");

estiloVotacao.textContent = `
  #area-votacao {
    width: 100%;
    margin-top: 30px;
  }

  .votacao-aviso {
    text-align: center;
    padding: 22px;
    border: 1px solid rgba(180, 255, 90, .25);
    background: rgba(180, 255, 90, .04);
    color: #c6d6b7;
    margin-bottom: 25px;
    line-height: 1.6;
  }

  .votacao-aviso strong {
    color: #b7ff65;
  }

  .votacao-lista {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
    gap: 22px;
  }

  .votacao-card {
    background: #10140f;
    border: 1px solid rgba(180, 255, 90, .16);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .votacao-foto {
    width: 100%;
    aspect-ratio: 4 / 5;
    background: #080a08;
    overflow: hidden;
  }

  .votacao-foto img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .votacao-foto-vazia {
    height: 100%;
    display: grid;
    place-items: center;
    color: #8b987f;
    font-size: 12px;
    letter-spacing: 2px;
  }

  .votacao-conteudo {
    padding: 20px;
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .votacao-conteudo h3 {
    color: #c3ff75;
    margin: 0 0 8px;
    font-size: 23px;
    overflow-wrap: anywhere;
  }

  .votacao-nome {
    color: #ddd;
    font-size: 13px;
    margin: 0 0 12px;
  }

  .votacao-descricao {
    color: #9ca397;
    font-size: 13px;
    line-height: 1.6;
    margin-bottom: 18px;
    overflow-wrap: anywhere;
  }

  .votacao-contagem {
    color: #c3ff75;
    font-family: 'Special Elite', monospace;
    font-size: 14px;
    margin-top: auto;
    margin-bottom: 15px;
  }

  .botao-votar {
    width: 100%;
    padding: 14px 18px;
    border: 1px solid #b7ff65;
    background: #b7ff65;
    color: #090b08;
    font-weight: 700;
    font-family: 'DM Sans', sans-serif;
    letter-spacing: 1px;
    cursor: pointer;
    transition: .2s;
  }

  .botao-votar:hover:not(:disabled) {
    background: transparent;
    color: #b7ff65;
  }

  .botao-votar:disabled {
    opacity: .55;
    cursor: not-allowed;
  }

  .botao-votar.ja-votou {
    background: transparent;
    color: #b7ff65;
    border-color: #b7ff65;
  }

  .votacao-status {
    min-height: 24px;
    margin: 18px 0;
    text-align: center;
    font-size: 14px;
    line-height: 1.5;
  }

  .votacao-status.erro {
    color: #ff7777;
  }

  .votacao-status.sucesso {
    color: #b7ff65;
  }

  .ranking-popular {
    margin-top: 45px;
    padding: 24px;
    border: 1px solid rgba(180, 255, 90, .2);
    background: rgba(180, 255, 90, .025);
  }

  .ranking-popular h3 {
    color: #c3ff75;
    margin: 0 0 20px;
    font-family: 'Creepster', cursive;
    font-size: 30px;
    font-weight: normal;
  }

  .ranking-item {
    display: flex;
    justify-content: space-between;
    gap: 15px;
    padding: 13px 0;
    border-bottom: 1px solid rgba(255,255,255,.08);
    color: #eee;
  }

  .ranking-item:last-child {
    border-bottom: 0;
  }

  .ranking-posicao {
    color: #b7ff65;
    margin-right: 10px;
  }

  .ranking-votos {
    color: #b7ff65;
    white-space: nowrap;
  }

  @media (max-width: 600px) {
    .votacao-lista {
      grid-template-columns: 1fr;
    }

    .votacao-card {
      max-width: 100%;
    }
  }
`;

document.head.appendChild(estiloVotacao);


// ==========================================
// IDENTIFICAÇÃO DO NAVEGADOR
// ==========================================

function obterIdNavegador() {
  const chave = "toca_do_mal_id_votacao";

  try {
    let id = localStorage.getItem(chave);

    if (id && /^[A-Za-z0-9_-]{20,120}$/.test(id)) {
      return id;
    }

    if (window.crypto && crypto.getRandomValues) {
      const bytes = new Uint8Array(24);
      crypto.getRandomValues(bytes);

      id = Array.from(bytes)
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");

    } else {
      id = "toca" + Date.now() +
        Math.random().toString(36).slice(2) +
        Math.random().toString(36).slice(2);
    }

    localStorage.setItem(chave, id);

    return id;

  } catch (erro) {
    return "toca" + Date.now() +
      Math.random().toString(36).slice(2) +
      Math.random().toString(36).slice(2);
  }
}

const ID_NAVEGADOR = obterIdNavegador();


// ==========================================
// CONSULTA JSONP AO APPS SCRIPT
// ==========================================

function consultarAPI(parametros) {
  return new Promise((resolve, reject) => {

    const callback =
      "tocaVoto_" + Math.random().toString(36).slice(2);

    const script = document.createElement("script");

    let finalizado = false;

    const timeout = setTimeout(() => {
      terminar(new Error("Tempo de resposta esgotado."));
    }, 15000);

    function terminar(erro, dados) {
      if (finalizado) return;

      finalizado = true;

      clearTimeout(timeout);

      delete window[callback];

      script.remove();

      if (erro) {
        reject(erro);
      } else {
        resolve(dados);
      }
    }

    window[callback] = dados => {
      terminar(null, dados);
    };

    script.onerror = () => {
      terminar(new Error("Não foi possível conectar ao servidor."));
    };

    const query = new URLSearchParams({
      ...parametros,
      callback,
      t: Date.now()
    });

    script.src = VOTACAO_API + "?" + query.toString();

    document.body.appendChild(script);
  });
}


// ==========================================
// VERIFICAR SITUAÇÃO DO ELEITOR
// ==========================================

async function verificarSituacao() {
  return consultarAPI({
    acao: "statusVoto",
    id: ID_NAVEGADOR
  });
}


// ==========================================
// CARREGAR RANKING
// ==========================================

async function carregarRanking() {
  const resposta = await consultarAPI({
    acao: "ranking"
  });

  if (!resposta || resposta.ok !== true) {
    throw new Error("Não foi possível carregar o ranking.");
  }

  return resposta.ranking || [];
}


// ==========================================
// EXIBIR RANKING
// ==========================================

function exibirRanking(ranking) {

  const antigo = areaVotacao.querySelector(".ranking-popular");

  if (antigo) antigo.remove();

  const bloco = document.createElement("div");

  bloco.className = "ranking-popular";

  const titulo = document.createElement("h3");

  titulo.textContent = "RANKING POPULAR";

  bloco.appendChild(titulo);

  if (!ranking.length) {

    const vazio = document.createElement("p");

    vazio.textContent = "Ainda não existem votos registrados.";

    bloco.appendChild(vazio);

  } else {

    ranking.forEach((item, indice) => {

      const linha = document.createElement("div");

      linha.className = "ranking-item";

      const nome = document.createElement("span");

      nome.innerHTML =
        '<span class="ranking-posicao">' +
        (indice + 1) +
        'º</span>';

      nome.appendChild(
        document.createTextNode(item.fantasia)
      );

      const votos = document.createElement("strong");

      votos.className = "ranking-votos";

      votos.textContent =
        item.votos + (item.votos === 1 ? " voto" : " votos");

      linha.appendChild(nome);
      linha.appendChild(votos);

      bloco.appendChild(linha);

    });
  }

  areaVotacao.appendChild(bloco);
}


// ==========================================
// MENSAGEM DE STATUS
// ==========================================

function mensagemVotacao(texto, tipo = "") {

  let elemento = areaVotacao.querySelector(".votacao-status");

  if (!elemento) {
    elemento = document.createElement("p");
    elemento.className = "votacao-status";

    const aviso = areaVotacao.querySelector(".votacao-aviso");

    if (aviso) {
      aviso.after(elemento);
    } else {
      areaVotacao.prepend(elemento);
    }
  }

  elemento.textContent = texto;
  elemento.className = "votacao-status " + tipo;
}


// ==========================================
// ENVIAR VOTO
// ==========================================

async function enviarVoto(linha, botao) {

  botao.disabled = true;
  botao.textContent = "REGISTRANDO VOTO...";

  mensagemVotacao("Enviando seu voto para a toca...");

  try {

    const situacao = await verificarSituacao();

    if (!situacao.ok) {
      throw new Error(
        situacao.mensagem || "Não foi possível verificar a votação."
      );
    }

    if (!situacao.votacaoAberta) {
      throw new Error("A votação está encerrada no momento.");
    }

    if (situacao.jaVotou) {
      botao.textContent = "VOCÊ JÁ VOTOU";
      botao.classList.add("ja-votou");

      mensagemVotacao(
        "Este navegador já registrou um voto.",
        "erro"
      );

      return;
    }

    await fetch(VOTACAO_API, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify({
        acao: "votar",
        id: ID_NAVEGADOR,
        linha: linha
      })
    });

    // O POST no-cors não permite ler a resposta.
    // Por isso verificamos novamente o status do voto.

    let confirmado = false;

    for (let tentativa = 0; tentativa < 5; tentativa++) {

      await new Promise(resolve => setTimeout(resolve, 1000));

      const verificacao = await verificarSituacao();

      if (verificacao.jaVotou) {
        confirmado = true;
        break;
      }
    }

    if (!confirmado) {
      throw new Error(
        "Não conseguimos confirmar seu voto. Atualize a página e verifique novamente."
      );
    }

    botao.textContent = "VOTO REGISTRADO";
    botao.classList.add("ja-votou");

    mensagemVotacao(
      "Seu voto foi registrado com sucesso! A toca agradece sua escolha.",
      "sucesso"
    );

    await atualizarVotacao();

  } catch (erro) {

    console.error("Erro na votação:", erro);

    mensagemVotacao(
      erro.message || "Não foi possível registrar seu voto.",
      "erro"
    );

    botao.disabled = false;
    botao.textContent = "TENTAR NOVAMENTE";

  }

}


// ==========================================
// ATUALIZAR VOTAÇÃO
// ==========================================

async function atualizarVotacao() {

  try {

    const [habitantes, situacao, ranking] = await Promise.all([

      consultarAPI({
        acao: "habitantes"
      }),

      verificarSituacao(),

      carregarRanking()

    ]);

    if (!habitantes || habitantes.ok !== true) {
      throw new Error("Não foi possível carregar os habitantes.");
    }

    const criaturas = habitantes.habitantes || [];

    areaVotacao.innerHTML = "";

    const aviso = document.createElement("div");

    aviso.className = "votacao-aviso";

    if (!situacao.votacaoAberta) {

      aviso.innerHTML =
        "<strong>VOTAÇÃO ENCERRADA</strong><br>" +
        "A passagem está fechada. Aguarde a próxima abertura.";

    } else if (situacao.jaVotou) {

      aviso.innerHTML =
        "<strong>SEU VOTO JÁ FOI REGISTRADO</strong><br>" +
        "Você já participou da escolha popular neste navegador.";

    } else {

      aviso.innerHTML =
        "<strong>A VOTAÇÃO ESTÁ ABERTA!</strong><br>" +
        "Escolha sua criatura favorita. Você tem direito a um voto por navegador.";

    }

    areaVotacao.appendChild(aviso);


    const lista = document.createElement("div");

    lista.className = "votacao-lista";

    if (!criaturas.length) {

      const vazio = document.createElement("p");

      vazio.className = "hint";

      vazio.textContent =
        "Ainda não existem criaturas aprovadas para votação.";

      areaVotacao.appendChild(vazio);

    }


    criaturas.forEach(criatura => {

      const card = document.createElement("article");

      card.className = "votacao-card";


      const fotoContainer = document.createElement("div");

      fotoContainer.className = "votacao-foto";


      if (criatura.fotoUrl) {

        const imagem = document.createElement("img");

        imagem.src = criatura.fotoUrl;

        imagem.alt = "Fantasia " + criatura.fantasia;

        imagem.loading = "lazy";

        imagem.onerror = () => {

          imagem.remove();

          const indisponivel = document.createElement("div");

          indisponivel.className = "votacao-foto-vazia";

          indisponivel.textContent = "FOTOGRAFIA INDISPONÍVEL";

          fotoContainer.appendChild(indisponivel);

        };

        fotoContainer.appendChild(imagem);

      } else {

        const indisponivel = document.createElement("div");

        indisponivel.className = "votacao-foto-vazia";

        indisponivel.textContent = "FOTOGRAFIA INDISPONÍVEL";

        fotoContainer.appendChild(indisponivel);

      }


      const conteudo = document.createElement("div");

      conteudo.className = "votacao-conteudo";


      const fantasia = document.createElement("h3");

      fantasia.textContent = criatura.fantasia;


      const nome = document.createElement("p");

      nome.className = "votacao-nome";

      nome.textContent = criatura.nome;


      const descricao = document.createElement("p");

      descricao.className = "votacao-descricao";

      descricao.textContent = criatura.inspiracao;


      const contagem = document.createElement("p");

      contagem.className = "votacao-contagem";

      contagem.textContent =
        (criatura.votos || 0) +
        ((criatura.votos || 0) === 1 ? " VOTO" : " VOTOS");


      const botao = document.createElement("button");

      botao.className = "botao-votar";

      botao.type = "button";

      botao.textContent = "VOTAR NESTA CRIATURA";


      if (!situacao.votacaoAberta || situacao.jaVotou) {

        botao.disabled = true;

        if (situacao.jaVotou) {

          botao.textContent = "VOCÊ JÁ VOTOU";

          botao.classList.add("ja-votou");

        } else {

          botao.textContent = "VOTAÇÃO ENCERRADA";

        }

      } else {

        botao.addEventListener("click", () => {

          enviarVoto(criatura.linha, botao);

        });

      }


      conteudo.appendChild(fantasia);
      conteudo.appendChild(nome);
      conteudo.appendChild(descricao);
      conteudo.appendChild(contagem);
      conteudo.appendChild(botao);

      card.appendChild(fotoContainer);
      card.appendChild(conteudo);

      lista.appendChild(card);

    });


    if (criaturas.length) {
      areaVotacao.appendChild(lista);
    }

    exibirRanking(ranking);

  } catch (erro) {

    console.error("Erro ao carregar votação:", erro);

    areaVotacao.innerHTML =
      '<p class="votacao-status erro">' +
      "Não foi possível carregar a votação. Atualize a página ou tente novamente mais tarde." +
      "</p>";

  }

}


// ==========================================
// INICIALIZAÇÃO
// ==========================================

if (areaVotacao) {
  atualizarVotacao();
}
