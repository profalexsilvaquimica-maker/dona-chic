"use client";



import { useEffect, useMemo, useState } from "react";

import {

  Montserrat,

  Playfair_Display,

  Cormorant_Garamond,

} from "next/font/google";



import { supabase } from "../../lib/supabase";



import {

  adicionarAoCarrinho,

  lerCarrinho,

  quantidadeCarrinho,

} from "../../lib/carrinho";



const montserrat = Montserrat({

  subsets: ["latin"],

  weight: ["400", "500", "600", "700"],

});



const playfair = Playfair_Display({

  subsets: ["latin"],

  weight: ["400", "500", "600", "700"],

  style: ["normal", "italic"],

});



const cormorant = Cormorant_Garamond({

  subsets: ["latin"],

  weight: ["400", "500", "600", "700"],

  style: ["normal", "italic"],

});



type Produto = {

  id: string;

  nome: string;

  slug: string | null;

  categoria: string;

  descricao: string | null;

  preco_normal: number;

  preco_chic: number;

  estoque: number;

  ativo: boolean;

  novidade: boolean;

  imagem: string | null;

  imagem_2: string | null;

  imagem_3: string | null;

  riscar_preco_normal: boolean;

  tamanhos: string[];

  cores: string[];

  ordem: number;

};



type Categoria = {

  id: string;

  slug: string;

  nome: string;

  descricao: string | null;

  imagem: string | null;

  ativo: boolean;

  ordem: number;

};



type Variacao = {

  id: string;

  produto_id: string;

  tamanho: string;

  cor: string;

  estoque: number;

};



function SearchIcon() {

  return (

    <svg

      width="18"

      height="18"

      viewBox="0 0 24 24"

      fill="none"

      stroke="currentColor"

      strokeWidth="1.5"

    >

      <circle cx="11" cy="11" r="7" />

      <path d="m20 20-3.5-3.5" />

    </svg>

  );

}



function HeartIcon() {

  return (

    <svg

      width="18"

      height="18"

      viewBox="0 0 24 24"

      fill="none"

      stroke="currentColor"

      strokeWidth="1.5"

    >

      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />

    </svg>

  );

}



function BagIcon() {

  return (

    <svg

      width="18"

      height="18"

      viewBox="0 0 24 24"

      fill="none"

      stroke="currentColor"

      strokeWidth="1.5"

    >

      <path d="M5 8h14l-1 13H6L5 8Z" />

      <path d="M9 8V6a3 3 0 0 1 6 0v2" />

    </svg>

  );

}



function ArrowIcon() {

  return (

    <svg

      width="23"

      height="12"

      viewBox="0 0 23 12"

      fill="none"

    >

      <path

        d="M1 6H20"

        stroke="currentColor"

        strokeWidth="1.3"

        strokeLinecap="round"

      />



      <path

        d="M15 1.5L20 6L15 10.5"

        stroke="currentColor"

        strokeWidth="1.3"

        strokeLinecap="round"

        strokeLinejoin="round"

      />

    </svg>

  );

}



function CloseIcon() {

  return (

    <svg

      width="20"

      height="20"

      viewBox="0 0 24 24"

      fill="none"

      stroke="currentColor"

      strokeWidth="1.5"

    >

      <path d="M6 6l12 12" />

      <path d="M18 6L6 18" />

    </svg>

  );

}





type ProductImageCarouselProps = {
  images: Array<string | null | undefined>;
  alt: string;
  imageClassName: string;
  containerClassName?: string;
  controlsBottomClass?: string;
  onImageClick?: () => void;
};

function ProductImageCarousel({
  images,
  alt,
  imageClassName,
  containerClassName = "",
  controlsBottomClass = "bottom-4",
  onImageClick,
}: ProductImageCarouselProps) {
  const lista = images.filter(
    (imagem): imagem is string => Boolean(imagem)
  );

  const [indice, setIndice] = useState(0);
  const [toqueInicio, setToqueInicio] = useState<number | null>(null);

  useEffect(() => {
    setIndice(0);
  }, [images.join("|")]);

  if (lista.length === 0) {
    return null;
  }

  const anterior = () => {
    setIndice((atual) =>
      atual === 0 ? lista.length - 1 : atual - 1
    );
  };

  const proxima = () => {
    setIndice((atual) =>
      atual === lista.length - 1 ? 0 : atual + 1
    );
  };

  return (
    <div
      className={`relative ${containerClassName}`}
      onTouchStart={(event) =>
        setToqueInicio(event.touches[0]?.clientX ?? null)
      }
      onTouchEnd={(event) => {
        if (toqueInicio === null || lista.length <= 1) {
          return;
        }

        const fim = event.changedTouches[0]?.clientX ?? toqueInicio;
        const diferenca = toqueInicio - fim;

        if (Math.abs(diferenca) >= 40) {
          if (diferenca > 0) {
            proxima();
          } else {
            anterior();
          }
        }

        setToqueInicio(null);
      }}
    >
      <img
        src={lista[indice]}
        alt={`${alt} - foto ${indice + 1}`}
        onClick={onImageClick}
        className={imageClassName}
      />

      {lista.length > 1 && (
        <>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              anterior();
            }}
            aria-label="Foto anterior"
            className="absolute left-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[25px] leading-none text-black shadow-md transition hover:bg-white"
          >
            ‹
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              proxima();
            }}
            aria-label="Próxima foto"
            className="absolute right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[25px] leading-none text-black shadow-md transition hover:bg-white"
          >
            ›
          </button>

          <div
            className={`absolute left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/35 px-3 py-2 backdrop-blur-sm ${controlsBottomClass}`}
          >
            {lista.map((_, itemIndice) => (
              <button
                key={itemIndice}
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setIndice(itemIndice);
                }}
                aria-label={`Ir para foto ${itemIndice + 1}`}
                className={`h-2 w-2 rounded-full border border-white transition ${
                  itemIndice === indice
                    ? "bg-white"
                    : "bg-white/30"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}


function formatarPreco(valor: number) {

  return Number(valor || 0).toLocaleString("pt-BR", {

    style: "currency",

    currency: "BRL",

  });

}



export default function ProdutosPage() {

  const [produtos, setProdutos] = useState<Produto[]>([]);

  const [categorias, setCategorias] = useState<Categoria[]>([]);

  const [variacoes, setVariacoes] = useState<Variacao[]>([]);



  const [categoriaAtiva, setCategoriaAtiva] =

    useState("todos");



  const [busca, setBusca] = useState("");



  const [carregando, setCarregando] =

    useState(true);



  const [erro, setErro] = useState("");



  const [quantidadeSacola, setQuantidadeSacola] =

    useState(0);



  const [produtoAdicionado, setProdutoAdicionado] =

    useState<string | null>(null);



  const [produtoSelecionado, setProdutoSelecionado] =

    useState<Produto | null>(null);



  const [tamanhoSelecionado, setTamanhoSelecionado] =

    useState("");



  const [corSelecionada, setCorSelecionada] =

    useState("");



  const [erroSelecao, setErroSelecao] =

    useState("");



  useEffect(() => {

    const params = new URLSearchParams(

      window.location.search

    );



    const categoria = params.get("categoria");



    if (categoria) {

      setCategoriaAtiva(categoria);

    }



    carregarDados();

    atualizarQuantidadeSacola();



    const atualizar = () => {

      atualizarQuantidadeSacola();

    };



    window.addEventListener(

      "dona-chic-carrinho-atualizado",

      atualizar

    );



    window.addEventListener(

      "storage",

      atualizar

    );



    return () => {

      window.removeEventListener(

        "dona-chic-carrinho-atualizado",

        atualizar

      );



      window.removeEventListener(

        "storage",

        atualizar

      );

    };

  }, []);



  useEffect(() => {

    if (produtoSelecionado) {

      document.body.style.overflow = "hidden";

    } else {

      document.body.style.overflow = "";

    }



    return () => {

      document.body.style.overflow = "";

    };

  }, [produtoSelecionado]);



  function atualizarQuantidadeSacola() {

    const carrinho = lerCarrinho();



    setQuantidadeSacola(

      quantidadeCarrinho(carrinho)

    );

  }



  async function carregarDados() {

    setCarregando(true);

    setErro("");



    const [

      resultadoProdutos,

      resultadoCategorias,

      resultadoVariacoes,

    ] = await Promise.all([

      supabase

        .from("produtos")

        .select("*")

        .eq("ativo", true)

        .order("ordem", {

          ascending: true,

        })

        .order("created_at", {

          ascending: false,

        }),



      supabase

        .from("categorias")

        .select("*")

        .eq("ativo", true)

        .order("ordem", {

          ascending: true,

        }),



      supabase

        .from("produto_variacoes")

        .select(

          "id,produto_id,tamanho,cor,estoque"

        ),

    ]);



    if (resultadoProdutos.error) {

      console.error(resultadoProdutos.error);



      setErro(

        "Não foi possível carregar os produtos."

      );

    }



    if (resultadoCategorias.error) {

      console.error(resultadoCategorias.error);



      setErro(

        "Não foi possível carregar as categorias."

      );

    }



    if (resultadoVariacoes.error) {

      console.error(resultadoVariacoes.error);



      setErro(

        "Não foi possível carregar o estoque dos produtos."

      );

    }



    const listaProdutos = (

      resultadoProdutos.data ?? []

    ).map((produto) => ({

      ...produto,



      preco_normal: Number(

        produto.preco_normal ?? 0

      ),



      preco_chic: Number(

        produto.preco_chic ?? 0

      ),



      estoque: Number(

        produto.estoque ?? 0

      ),



      imagem_2:

        produto.imagem_2 ?? null,



      imagem_3:

        produto.imagem_3 ?? null,



      riscar_preco_normal:

        Boolean(produto.riscar_preco_normal),



      ordem: Number(

        produto.ordem ?? 0

      ),



      tamanhos:

        produto.tamanhos ?? [],



      cores:

        produto.cores ?? [],

    }));



    const listaVariacoes = (

      resultadoVariacoes.data ?? []

    ).map((variacao) => ({

      ...variacao,



      tamanho:

        variacao.tamanho ?? "",



      cor:

        variacao.cor ?? "",



      estoque: Number(

        variacao.estoque ?? 0

      ),

    }));



    setProdutos(listaProdutos);



    setCategorias(

      resultadoCategorias.data ?? []

    );



    setVariacoes(listaVariacoes);



    setCarregando(false);

  }



  function selecionarCategoria(

    slug: string

  ) {

    setCategoriaAtiva(slug);



    const url =

      slug === "todos"

        ? "/produtos"

        : `/produtos?categoria=${encodeURIComponent(

            slug

          )}`;



    window.history.replaceState(

      {},

      "",

      url

    );

  }



  function variacoesDoProduto(

    produtoId: string

  ) {

    return variacoes.filter(

      (variacao) =>

        variacao.produto_id ===

        produtoId

    );

  }



  function produtoTemEstoqueVariacoes(

    produtoId: string

  ) {

    return variacoesDoProduto(

      produtoId

    ).length > 0;

  }



  function estoqueDaCombinacao(

    produtoId: string,

    tamanho: string,

    cor: string

  ) {

    const variacao = variacoes.find(

      (item) =>

        item.produto_id ===

          produtoId &&

        (item.tamanho || "") ===

          (tamanho || "") &&

        (item.cor || "") ===

          (cor || "")

    );



    return Number(

      variacao?.estoque ?? 0

    );

  }



  function tamanhoDisponivel(

    produto: Produto,

    tamanho: string

  ) {

    const possuiVariacoes =

      produtoTemEstoqueVariacoes(

        produto.id

      );



    if (!possuiVariacoes) {

      return produto.estoque > 0;

    }



    if (

      produto.cores.length === 0

    ) {

      return (

        estoqueDaCombinacao(

          produto.id,

          tamanho,

          ""

        ) > 0

      );

    }



    if (corSelecionada) {

      return (

        estoqueDaCombinacao(

          produto.id,

          tamanho,

          corSelecionada

        ) > 0

      );

    }



    return produto.cores.some(

      (cor) =>

        estoqueDaCombinacao(

          produto.id,

          tamanho,

          cor

        ) > 0

    );

  }



  function corDisponivel(

    produto: Produto,

    cor: string

  ) {

    const possuiVariacoes =

      produtoTemEstoqueVariacoes(

        produto.id

      );



    if (!possuiVariacoes) {

      return produto.estoque > 0;

    }



    if (

      produto.tamanhos.length === 0

    ) {

      return (

        estoqueDaCombinacao(

          produto.id,

          "",

          cor

        ) > 0

      );

    }



    if (tamanhoSelecionado) {

      return (

        estoqueDaCombinacao(

          produto.id,

          tamanhoSelecionado,

          cor

        ) > 0

      );

    }



    return produto.tamanhos.some(

      (tamanho) =>

        estoqueDaCombinacao(

          produto.id,

          tamanho,

          cor

        ) > 0

    );

  }



  function estoqueDisponivelProduto(

    produto: Produto

  ) {

    const lista =

      variacoesDoProduto(

        produto.id

      );



    if (lista.length === 0) {

      return produto.estoque;

    }



    return lista.reduce(

      (total, item) =>

        total +

        Number(

          item.estoque ?? 0

        ),

      0

    );

  }



  function abrirSelecaoProduto(

    produto: Produto

  ) {

    const estoqueDisponivel =

      estoqueDisponivelProduto(

        produto

      );



    if (estoqueDisponivel <= 0) {

      return;

    }



    setProdutoSelecionado(produto);



    setTamanhoSelecionado("");



    setCorSelecionada("");



    setErroSelecao("");

  }



  function fecharSelecaoProduto() {

    setProdutoSelecionado(null);



    setTamanhoSelecionado("");



    setCorSelecionada("");



    setErroSelecao("");

  }



  function selecionarTamanho(

    produto: Produto,

    tamanho: string

  ) {

    if (

      !tamanhoDisponivel(

        produto,

        tamanho

      )

    ) {

      return;

    }



    setTamanhoSelecionado(

      tamanho

    );



    setErroSelecao("");



    if (

      corSelecionada &&

      estoqueDaCombinacao(

        produto.id,

        tamanho,

        corSelecionada

      ) <= 0 &&

      produtoTemEstoqueVariacoes(

        produto.id

      )

    ) {

      setCorSelecionada("");

    }

  }



  function selecionarCor(

    produto: Produto,

    cor: string

  ) {

    if (

      !corDisponivel(

        produto,

        cor

      )

    ) {

      return;

    }



    setCorSelecionada(cor);



    setErroSelecao("");



    if (

      tamanhoSelecionado &&

      estoqueDaCombinacao(

        produto.id,

        tamanhoSelecionado,

        cor

      ) <= 0 &&

      produtoTemEstoqueVariacoes(

        produto.id

      )

    ) {

      setTamanhoSelecionado("");

    }

  }



  function confirmarProduto() {

    if (!produtoSelecionado) {

      return;

    }



    if (

      produtoSelecionado.tamanhos.length >

        0 &&

      !tamanhoSelecionado

    ) {

      setErroSelecao(

        "Selecione o tamanho antes de adicionar à sacola."

      );



      return;

    }



    if (

      produtoSelecionado.cores.length >

        0 &&

      !corSelecionada

    ) {

      setErroSelecao(

        "Selecione a cor antes de adicionar à sacola."

      );



      return;

    }



    const tamanhoFinal =

      tamanhoSelecionado || "";



    const corFinal =

      corSelecionada || "";



    const possuiVariacoes =

      produtoTemEstoqueVariacoes(

        produtoSelecionado.id

      );



    let estoqueDisponivel =

      produtoSelecionado.estoque;



    if (possuiVariacoes) {

      estoqueDisponivel =

        estoqueDaCombinacao(

          produtoSelecionado.id,

          tamanhoFinal,

          corFinal

        );



      if (estoqueDisponivel <= 0) {

        setErroSelecao(

          "Essa combinação de tamanho e cor está sem estoque."

        );



        return;

      }

    }



    const carrinho =

      lerCarrinho();



    const itemExistente =

      carrinho.find(

        (item) =>

          item.id ===

            produtoSelecionado.id &&

          (item.tamanho || "") ===

            tamanhoFinal &&

          (item.cor || "") ===

            corFinal

      );



    const quantidadeAtual =

      itemExistente?.quantidade ??

      0;



    if (

      quantidadeAtual >=

      estoqueDisponivel

    ) {

      setErroSelecao(

        estoqueDisponivel === 1

          ? "Existe apenas 1 unidade disponível dessa combinação."

          : `Existem apenas ${estoqueDisponivel} unidades disponíveis dessa combinação.`

      );



      return;

    }



    adicionarAoCarrinho({

      id: produtoSelecionado.id,

      nome: produtoSelecionado.nome,

      imagem:

        produtoSelecionado.imagem,

      preco_normal:

        produtoSelecionado.preco_normal,

      preco_chic:

        produtoSelecionado.preco_chic,



      tamanho:

        tamanhoFinal ||

        undefined,



      cor:

        corFinal ||

        undefined,

    });



    atualizarQuantidadeSacola();



    setProdutoAdicionado(

      produtoSelecionado.id

    );



    const idProduto =

      produtoSelecionado.id;



    fecharSelecaoProduto();



    window.setTimeout(() => {

      setProdutoAdicionado(

        (atual) =>

          atual === idProduto

            ? null

            : atual

      );

    }, 1500);

  }



  const produtosFiltrados =

    useMemo(() => {

      let resultado = [

        ...produtos,

      ];



      if (

        categoriaAtiva ===

        "novidades"

      ) {

        resultado =

          resultado.filter(

            (produto) =>

              produto.novidade

          );

      } else if (

        categoriaAtiva !==

        "todos"

      ) {

        const categoriaSelecionada =

          categorias.find(

            (categoria) =>

              categoria.slug ===

              categoriaAtiva

          );



        if (

          categoriaSelecionada

        ) {

          resultado =

            resultado.filter(

              (produto) =>

                produto.categoria ===

                categoriaSelecionada.nome

            );

        }

      }



      const termo = busca

        .trim()

        .toLowerCase();



      if (termo) {

        resultado =

          resultado.filter(

            (produto) => {

              const nome =

                produto.nome.toLowerCase();



              const categoria =

                produto.categoria.toLowerCase();



              const descricao = (

                produto.descricao ??

                ""

              ).toLowerCase();



              return (

                nome.includes(

                  termo

                ) ||

                categoria.includes(

                  termo

                ) ||

                descricao.includes(

                  termo

                )

              );

            }

          );

      }



      return resultado;

    }, [

      produtos,

      categorias,

      categoriaAtiva,

      busca,

    ]);



  const tituloAtual =

    useMemo(() => {

      if (

        categoriaAtiva ===

        "novidades"

      ) {

        return "Novidades";

      }



      if (

        categoriaAtiva ===

        "todos"

      ) {

        return "Todos os produtos";

      }



      const categoria =

        categorias.find(

          (item) =>

            item.slug ===

            categoriaAtiva

        );



      return (

        categoria?.nome ??

        "Todos os produtos"

      );

    }, [

      categoriaAtiva,

      categorias,

    ]);



  return (

    <>

      <main

        className={`${montserrat.className} min-h-screen bg-[#f5f1ed] text-[#181310]`}

      >

        <div className="bg-black px-5 py-2 text-center text-[9px] uppercase tracking-[0.24em] text-white">

          Dona Chic • Moda fitness & esportiva

        </div>



        <header className="border-b border-[#e5ddd7] bg-[#faf7f3]">

          <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-4 sm:px-8">

            <a

              href="/"

              className={`${cormorant.className} text-[20px] font-semibold`}

            >

              ← Início

            </a>



            <a href="/">

              <div className="flex h-[74px] w-[105px] items-center justify-center bg-black">

                <img

                  src="/logo-dona-chic.webp"

                  alt="Dona Chic"

                  className="h-[68px] w-[96px] object-contain"

                />

              </div>

            </a>



            <a

              href="/sacola"

              className="relative flex items-center gap-2"

            >

              <div className="relative">

                <BagIcon />



                {quantidadeSacola >

                  0 && (

                  <span className="absolute -right-3 -top-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[9px] font-semibold text-white">

                    {quantidadeSacola >

                    99

                      ? "99+"

                      : quantidadeSacola}

                  </span>

                )}

              </div>



              <span

                className={`${cormorant.className} hidden text-[20px] sm:inline`}

              >

                Sacola

              </span>

            </a>

          </div>

        </header>



        <section className="border-b border-[#e1d9d3] bg-[#f5f1ed] px-5 py-12 sm:px-8 lg:py-16">

          <div className="mx-auto max-w-[1500px]">

            <p className="text-[9px] uppercase tracking-[0.28em] text-[#925c47]">

              Dona Chic

            </p>



            <div className="mt-3 flex flex-col justify-between gap-7 lg:flex-row lg:items-end">

              <div>

                <h1

                  className={`${playfair.className} text-[44px] leading-none sm:text-[58px] lg:text-[68px]`}

                >

                  {tituloAtual}

                </h1>



                <p className="mt-4 max-w-[560px] text-[13px] leading-6 text-[#544b46]">

                  Escolha suas peças favoritas e monte combinações para acompanhar

                  seu ritmo dentro e fora do treino.

                </p>

              </div>



              <div className="relative w-full lg:w-[370px]">

                <div className="absolute left-0 top-1/2 -translate-y-1/2">

                  <SearchIcon />

                </div>



                <input

                  value={busca}

                  onChange={(event) =>

                    setBusca(

                      event.target.value

                    )

                  }

                  placeholder="Buscar produto"

                  className="h-[46px] w-full border-b border-[#857770] bg-transparent pl-8 pr-2 text-[14px] outline-none placeholder:text-[#746963]"

                />

              </div>

            </div>

          </div>

        </section>



        <section className="sticky top-0 z-20 border-b border-[#e3dbd5] bg-[#faf8f5]/95 backdrop-blur">

          <div className="mx-auto flex max-w-[1500px] gap-2 overflow-x-auto px-5 py-4 sm:px-8">

            <button

              type="button"

              onClick={() =>

                selecionarCategoria(

                  "todos"

                )

              }

              className={`whitespace-nowrap rounded-full border px-5 py-2.5 text-[9px] font-semibold uppercase tracking-[0.12em] transition ${

                categoriaAtiva ===

                "todos"

                  ? "border-black bg-black text-white"

                  : "border-[#d3c9c2] bg-white text-[#675d58]"

              }`}

            >

              Todos

            </button>



            <button

              type="button"

              onClick={() =>

                selecionarCategoria(

                  "novidades"

                )

              }

              className={`whitespace-nowrap rounded-full border px-5 py-2.5 text-[9px] font-semibold uppercase tracking-[0.12em] transition ${

                categoriaAtiva ===

                "novidades"

                  ? "border-[#b7765c] bg-[#b7765c] text-white"

                  : "border-[#d3c9c2] bg-white text-[#675d58]"

              }`}

            >

              Novidades

            </button>



            {categorias.map(

              (categoria) => (

                <button

                  key={

                    categoria.id

                  }

                  type="button"

                  onClick={() =>

                    selecionarCategoria(

                      categoria.slug

                    )

                  }

                  className={`whitespace-nowrap rounded-full border px-5 py-2.5 text-[9px] font-semibold uppercase tracking-[0.12em] transition ${

                    categoriaAtiva ===

                    categoria.slug

                      ? "border-black bg-black text-white"

                      : "border-[#d3c9c2] bg-white text-[#675d58]"

                  }`}

                >

                  {

                    categoria.nome

                  }

                </button>

              )

            )}

          </div>

        </section>



        <section className="px-4 py-10 sm:px-6 lg:px-8 lg:py-14">

          <div className="mx-auto max-w-[1500px]">

            {carregando && (

              <div className="flex min-h-[350px] items-center justify-center">

                <div className="text-center">

                  <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#d6ccc6] border-t-black" />



                  <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-[#8d817a]">

                    Carregando produtos

                  </p>

                </div>

              </div>

            )}



            {!carregando &&

              erro && (

                <div className="border border-[#e0bcb2] bg-[#fff4f1] px-6 py-8 text-center text-[12px] text-[#984839]">

                  {erro}

                </div>

              )}



            {!carregando &&

              !erro &&

              produtosFiltrados.length ===

                0 && (

                <div className="flex min-h-[360px] items-center justify-center border border-[#e0d9d4] bg-white">

                  <div className="max-w-[500px] px-6 text-center">

                    <p

                      className={`${playfair.className} text-[32px] text-[#2a221e]`}

                    >

                      Nenhum produto encontrado

                    </p>



                    <p className="mt-3 text-[12px] leading-6 text-[#8b7e77]">

                      Ainda não existem produtos disponíveis nesta categoria.

                    </p>

                  </div>

                </div>

              )}



            {!carregando &&

              !erro &&

              produtosFiltrados.length >

                0 && (

                <>

                  <div className="mb-7 flex items-center justify-between">

                    <p className="text-[10px] uppercase tracking-[0.17em] text-[#625953]">

                      {

                        produtosFiltrados.length

                      }{" "}

                      {produtosFiltrados.length ===

                      1

                        ? "produto"

                        : "produtos"}

                    </p>

                  </div>



                  <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-5">

                    {produtosFiltrados.map(

                      (produto) => {

                        const estoqueTotal =

                          estoqueDisponivelProduto(

                            produto

                          );



                        return (

                          <article

                            key={

                              produto.id

                            }

                            className="group min-w-0"

                          >

                            <div className="relative aspect-[3/4] overflow-hidden bg-[#ebe6e2]">

                              {[
                                produto.imagem,
                                produto.imagem_2,
                                produto.imagem_3,
                              ].filter(Boolean).length > 0 ? (

                                <ProductImageCarousel
                                  images={[
                                    produto.imagem,
                                    produto.imagem_2,
                                    produto.imagem_3,
                                  ]}
                                  alt={produto.nome}
                                  containerClassName="h-full w-full"
                                  imageClassName="h-full w-full cursor-pointer object-cover object-top transition duration-500 group-hover:scale-[1.03]"
                                  controlsBottomClass="bottom-16"
                                  onImageClick={() =>
                                    abrirSelecaoProduto(produto)
                                  }
                                />

                              ) : (

                                <button
                                  type="button"
                                  onClick={() =>
                                    abrirSelecaoProduto(
                                      produto
                                    )
                                  }
                                  className="flex h-full w-full items-center justify-center px-5 text-center"
                                >

                                  <div>

                                    <p

                                      className={`${playfair.className} text-[22px] text-[#998c85]`}

                                    >

                                      Dona Chic

                                    </p>



                                    <p className="mt-2 text-[9px] uppercase tracking-[0.18em] text-[#aaa09a]">

                                      Imagem em breve

                                    </p>

                                  </div>

                                </button>

                              )}



                              {produto.novidade && (

                                <span className="absolute left-3 top-3 bg-[#d9a48d] px-3 py-1.5 text-[8px] font-semibold uppercase tracking-[0.13em] text-white">

                                  Novidade

                                </span>

                              )}



                              <button

                                type="button"

                                aria-label="Adicionar aos favoritos"

                                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95"

                              >

                                <HeartIcon />

                              </button>



                              <button

                                type="button"

                                disabled={

                                  estoqueTotal <=

                                  0

                                }

                                onClick={() =>

                                  abrirSelecaoProduto(

                                    produto

                                  )

                                }

                                className={`absolute bottom-3 left-3 right-3 py-3 text-[8px] font-semibold uppercase tracking-[0.14em] text-white transition ${

                                  estoqueTotal <=

                                  0

                                    ? "cursor-not-allowed bg-[#8f8985]"

                                    : produtoAdicionado ===

                                        produto.id

                                      ? "bg-[#9b6a55]"

                                      : "bg-black hover:bg-[#312a27]"

                                }`}

                              >

                                {estoqueTotal <=

                                0

                                  ? "Produto esgotado"

                                  : produtoAdicionado ===

                                      produto.id

                                    ? "Adicionado ✓"

                                    : "Adicionar à sacola"}

                              </button>

                            </div>



                            <div className="pt-3">

                              <p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[#895744]">

                                {

                                  produto.categoria

                                }

                              </p>



                              <h2

                                className={`${playfair.className} mt-1 text-[17px] leading-tight sm:text-[20px]`}

                              >

                                {

                                  produto.nome

                                }

                              </h2>



                              <div className="mt-3 border-t border-[#e4dcd6] pt-3">

                                <div className="flex flex-wrap items-baseline gap-2">

                                  <span className="text-[8px] font-semibold uppercase tracking-[0.1em] text-[#544b46]">

                                    Preço normal

                                  </span>



                                  <span
                                    className={`text-[12px] font-semibold ${
                                      produto.riscar_preco_normal
                                        ? "line-through decoration-1 opacity-60"
                                        : ""
                                    }`}
                                  >

                                    {formatarPreco(

                                      produto.preco_normal

                                    )}

                                  </span>

                                </div>



                                <div className="mt-2 bg-[#f0ddd3] px-3 py-2">

                                  <p className="text-[8px] font-semibold uppercase tracking-[0.1em] text-[#a05d45]">

                                    Preço Chic+ · a partir de 4 peças

                                  </p>



                                  <p

                                    className={`${playfair.className} mt-0.5 text-[22px] font-bold leading-none text-[#8f513a]`}

                                  >

                                    {formatarPreco(

                                      produto.preco_chic

                                    )}

                                  </p>

                                </div>



                                {estoqueTotal >

                                0 ? (

                                  <p className="mt-2 text-[9px] text-[#778076]">

                                    Em estoque

                                  </p>

                                ) : (

                                  <p className="mt-2 text-[9px] text-[#a44d40]">

                                    Produto esgotado

                                  </p>

                                )}

                              </div>

                            </div>

                          </article>

                        );

                      }

                    )}

                  </div>

                </>

              )}

          </div>

        </section>



        <footer className="mt-8 bg-black px-6 py-14 text-white">

          <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-8 md:flex-row md:items-end">

            <div>

              <img

                src="/logo-dona-chic.webp"

                alt="Dona Chic"

                className="h-[110px] w-[135px] object-contain"

              />



              <p className="mt-4 text-[12px] text-white/60">

                Elegância em todos os detalhes.

              </p>

            </div>



            <a

              href="/"

              className={`${cormorant.className} flex items-center gap-4 text-[20px]`}

            >

              Voltar para a loja

              <ArrowIcon />

            </a>

          </div>

        </footer>

      </main>



      {produtoSelecionado && (

        <div

          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 px-4 py-6"

          onMouseDown={(event) => {

            if (

              event.target ===

              event.currentTarget

            ) {

              fecharSelecaoProduto();

            }

          }}

        >

          <div

            className={`${montserrat.className} relative max-h-[90vh] w-full max-w-[760px] overflow-y-auto bg-[#faf8f5] text-[#181310] shadow-2xl`}

          >

            <button

              type="button"

              onClick={

                fecharSelecaoProduto

              }

              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-sm transition hover:bg-[#f0ebe7]"

              aria-label="Fechar"

            >

              <CloseIcon />

            </button>



            <div className="grid md:grid-cols-2">

              {[
                produtoSelecionado.imagem,
                produtoSelecionado.imagem_2,
                produtoSelecionado.imagem_3,
              ].filter(Boolean).length > 0 ? (
                <ProductImageCarousel
                  images={[
                    produtoSelecionado.imagem,
                    produtoSelecionado.imagem_2,
                    produtoSelecionado.imagem_3,
                  ]}
                  alt={produtoSelecionado.nome}
                  containerClassName="min-h-[320px] overflow-hidden bg-[#eee8e4] md:min-h-[520px]"
                  imageClassName="h-full min-h-[320px] w-full object-cover object-top md:min-h-[520px]"
                  controlsBottomClass="bottom-4"
                />
              ) : (
                <div className="flex min-h-[320px] items-center justify-center bg-[#eee8e4] md:min-h-[520px]">
                  <p
                    className={`${playfair.className} text-[32px] text-[#756a64]`}
                  >
                    Dona Chic
                  </p>
                </div>
              )}

              <div className="flex flex-col p-6 sm:p-8">

                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#895744]">

                  {

                    produtoSelecionado.categoria

                  }

                </p>



                <h2

                  className={`${playfair.className} mt-2 pr-10 text-[28px] leading-tight sm:text-[34px]`}

                >

                  {

                    produtoSelecionado.nome

                  }

                </h2>



                <div className="mt-5 border-y border-[#e0d7d1] py-4">

                  <div className="flex items-center justify-between gap-4">

                    <span className="text-[10px] uppercase tracking-[0.12em] text-[#544b46]">

                      Preço normal

                    </span>



                    <span
                      className={`text-[14px] font-semibold ${
                        produtoSelecionado.riscar_preco_normal
                          ? "line-through decoration-1 opacity-60"
                          : ""
                      }`}
                    >

                      {formatarPreco(

                        produtoSelecionado.preco_normal

                      )}

                    </span>

                  </div>



                  <div className="mt-3 flex items-center justify-between gap-4 bg-[#f0ddd3] px-3 py-3">

                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9f6049]">

                      Preço Chic+ · a partir de 4 peças

                    </span>



                    <span

                      className={`${playfair.className} text-[22px] font-bold text-[#8f513a]`}

                    >

                      {formatarPreco(

                        produtoSelecionado.preco_chic

                      )}

                    </span>

                  </div>

                </div>



                {produtoSelecionado

                  .cores.length >

                  0 && (

                  <div className="mt-6">

                    <div className="flex items-center justify-between">

                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em]">

                        Escolha a cor

                      </p>



                      {corSelecionada && (

                        <span className="text-[10px] text-[#625953]">

                          Selecionada:{" "}

                          {

                            corSelecionada

                          }

                        </span>

                      )}

                    </div>



                    <div className="mt-3 flex flex-wrap gap-2">

                      {produtoSelecionado.cores.map(

                        (cor) => {

                          const disponivel =

                            corDisponivel(

                              produtoSelecionado,

                              cor

                            );



                          return (

                            <button

                              key={

                                cor

                              }

                              type="button"

                              disabled={

                                !disponivel

                              }

                              onClick={() =>

                                selecionarCor(

                                  produtoSelecionado,

                                  cor

                                )

                              }

                              className={`border px-4 py-3 text-[11px] font-semibold transition ${

                                !disponivel

                                  ? "cursor-not-allowed border-[#e5dfdb] bg-[#eeeae7] text-[#aaa19b] line-through"

                                  : corSelecionada ===

                                      cor

                                    ? "border-black bg-black text-white"

                                    : "border-[#d8cec8] bg-white text-black hover:border-black"

                              }`}

                            >

                              {cor}

                            </button>

                          );

                        }

                      )}

                    </div>

                  </div>

                )}



                {produtoSelecionado

                  .tamanhos.length >

                  0 && (

                  <div className="mt-6">

                    <div className="flex items-center justify-between">

                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em]">

                        Escolha o tamanho

                      </p>



                      {tamanhoSelecionado && (

                        <span className="text-[10px] text-[#625953]">

                          Selecionado:{" "}

                          {

                            tamanhoSelecionado

                          }

                        </span>

                      )}

                    </div>



                    <div className="mt-3 flex flex-wrap gap-2">

                      {produtoSelecionado.tamanhos.map(

                        (tamanho) => {

                          const disponivel =

                            tamanhoDisponivel(

                              produtoSelecionado,

                              tamanho

                            );



                          return (

                            <button

                              key={

                                tamanho

                              }

                              type="button"

                              disabled={

                                !disponivel

                              }

                              onClick={() =>

                                selecionarTamanho(

                                  produtoSelecionado,

                                  tamanho

                                )

                              }

                              className={`min-w-[48px] border px-4 py-3 text-[11px] font-semibold uppercase transition ${

                                !disponivel

                                  ? "cursor-not-allowed border-[#e5dfdb] bg-[#eeeae7] text-[#aaa19b] line-through"

                                  : tamanhoSelecionado ===

                                      tamanho

                                    ? "border-black bg-black text-white"

                                    : "border-[#d8cec8] bg-white text-black hover:border-black"

                              }`}

                            >

                              {tamanho}

                            </button>

                          );

                        }

                      )}

                    </div>

                  </div>

                )}



                {produtoTemEstoqueVariacoes(

                  produtoSelecionado.id

                ) &&

                  tamanhoSelecionado &&

                  corSelecionada && (

                    <div className="mt-5 rounded-xl bg-[#f2eee9] px-4 py-3">

                      <p className="text-[9px] uppercase tracking-[0.13em] text-[#5e554f]">

                        Disponibilidade

                      </p>



                      <p className="mt-1 text-[11px] font-semibold text-[#433a35]">

                        {estoqueDaCombinacao(

                          produtoSelecionado.id,

                          tamanhoSelecionado,

                          corSelecionada

                        )}{" "}

                        {estoqueDaCombinacao(

                          produtoSelecionado.id,

                          tamanhoSelecionado,

                          corSelecionada

                        ) === 1

                          ? "unidade disponível"

                          : "unidades disponíveis"}

                      </p>

                    </div>

                  )}



                {erroSelecao && (

                  <div className="mt-5 border border-[#e4b8ac] bg-[#fff3ef] px-4 py-3 text-[11px] text-[#9d4838]">

                    {erroSelecao}

                  </div>

                )}



                <button

                  type="button"

                  onClick={

                    confirmarProduto

                  }

                  className="mt-7 w-full bg-black px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#302926]"

                >

                  Adicionar à sacola

                </button>



                <p className="mt-3 text-center text-[9px] leading-4 text-[#665d58]">

                  As opções sem estoque ficam indisponíveis automaticamente.

                </p>

              </div>

            </div>

          </div>

        </div>

      )}

    </>

  );

}