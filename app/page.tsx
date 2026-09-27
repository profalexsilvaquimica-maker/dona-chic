"use client";



import { useEffect, useMemo, useState } from "react";



import {

  Montserrat,

  Playfair_Display,

  Cormorant_Garamond,

} from "next/font/google";



import { supabase } from "../lib/supabase";



import {

  adicionarAoCarrinho,

  lerCarrinho,

  quantidadeCarrinho,

} from "../lib/carrinho";



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



type Categoria = {

  id: string;

  slug: string;

  nome: string;

  descricao: string | null;

  imagem: string | null;

  ativo: boolean;

  ordem: number;

};



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



type Variacao = {

  id: string;

  produto_id: string;

  tamanho: string;

  cor: string;

  estoque: number;

};



type Beneficio = {

  id: string;

  titulo: string;

  descricao: string | null;

  ordem: number;

  ativo: boolean;

};



type MenuExtra = {

  id: string;

  label: string;

  href: string;

};



const imagensCategorias: Record<string, string> = {

  conjuntos:

    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=90",



  "top-cropped":

    "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=90",



  shorts:

    "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=1200&q=90",



  "camisas-blusas":

    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=90",



  macacoes:

    "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=90",



  casacos:

    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=90",

};



const beneficiosPadrao = [

  {

    titulo: "Compra segura",

    descricao: "Seus dados protegidos",

  },

  {

    titulo: "Envio nacional",

    descricao: "Para todo o Brasil",

  },

  {

    titulo: "Pix e cartões",

    descricao: "Pagamento facilitado",

  },

  {

    titulo: "Troca fácil",

    descricao: "Compra sem preocupação",

  },

  {

    titulo: "Atendimento",

    descricao: "Suporte próximo",

  },

];



function SearchIcon() {

  return (

    <svg

      width="17"

      height="17"

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

      width="17"

      height="17"

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



function WhatsAppIcon() {

  return (

    <svg

      width="26"

      height="26"

      viewBox="0 0 32 32"

      fill="none"

      aria-hidden="true"

    >

      <path

        d="M16 4.2C9.5 4.2 4.2 9.3 4.2 15.7c0 2.3.7 4.6 2 6.5L4.4 27.8l5.8-1.8c1.8 1 3.8 1.5 5.8 1.5 6.5 0 11.8-5.1 11.8-11.5S22.5 4.2 16 4.2Z"

        stroke="currentColor"

        strokeWidth="2.1"

        strokeLinejoin="round"

      />

      <path

        d="M11.2 10.2c.4-.5.8-.5 1.1-.5h.8c.2 0 .5.1.7.6l1 2.3c.2.4.1.7-.1 1l-.7.9c-.2.2-.3.4-.1.7.8 1.5 2 2.7 3.5 3.6.3.2.5.1.7-.1l1-1.2c.3-.3.6-.4 1-.2l2.2 1c.5.2.6.5.6.8 0 .4-.2 1.8-1.2 2.7-.9.8-2.1 1.2-3.5.9-2-.4-4.4-1.5-6.4-3.4-2.4-2.3-3.9-5.2-4.1-7-.1-.9.1-1.5.5-2.1Z"

        fill="currentColor"

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



function ElegantArrow() {

  return (

    <svg width="44" height="24" viewBox="0 0 44 24" fill="none">

      <path

        d="M2 18C13 7 27 6 38 11"

        stroke="currentColor"

        strokeWidth="1.5"

        strokeLinecap="round"

      />

      <path

        d="M33 5L40 11L33 17"

        stroke="currentColor"

        strokeWidth="1.5"

        strokeLinecap="round"

        strokeLinejoin="round"

      />

    </svg>

  );

}



function SlimArrow() {

  return (

    <svg width="22" height="12" viewBox="0 0 22 12" fill="none">

      <path

        d="M1 6H19"

        stroke="currentColor"

        strokeWidth="1.3"

        strokeLinecap="round"

      />

      <path

        d="M14 1.5L19 6L14 10.5"

        stroke="currentColor"

        strokeWidth="1.3"

        strokeLinecap="round"

        strokeLinejoin="round"

      />

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



function parcelamento(valor: number) {

  const parcela = Number(valor || 0) / 6;



  return `6x de ${parcela.toLocaleString("pt-BR", {

    style: "currency",

    currency: "BRL",

  })}`;

}



export default function Home() {

  const [categorias, setCategorias] = useState<Categoria[]>([]);

  const [produtos, setProdutos] = useState<Produto[]>([]);

  const [variacoes, setVariacoes] = useState<Variacao[]>([]);

  const [beneficios, setBeneficios] = useState<Beneficio[]>([]);

  const [config, setConfig] = useState<Record<string, string>>({});

  const [carregando, setCarregando] = useState(true);



  const [quantidadeSacola, setQuantidadeSacola] = useState(0);



  const [produtoSelecionado, setProdutoSelecionado] =

    useState<Produto | null>(null);



  const [produtoAdicionado, setProdutoAdicionado] =

    useState<string | null>(null);



  const [tamanhoSelecionado, setTamanhoSelecionado] =

    useState("");



  const [corSelecionada, setCorSelecionada] =

    useState("");



  const [erroSelecao, setErroSelecao] =

    useState("");



  useEffect(() => {

    carregarSite();

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



  async function carregarSite() {

    setCarregando(true);



    const [

      resultadoCategorias,

      resultadoProdutos,

      resultadoVariacoes,

      resultadoConfiguracoes,

      resultadoBeneficios,

    ] = await Promise.all([

      supabase

        .from("categorias")

        .select("*")

        .eq("ativo", true)

        .order("ordem", {

          ascending: true,

        }),



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

        .from("produto_variacoes")

        .select(

          "id,produto_id,tamanho,cor,estoque"

        ),



      supabase

        .from("configuracoes")

        .select("*"),



      supabase

        .from("beneficios")

        .select("*")

        .eq("ativo", true)

        .order("ordem", {

          ascending: true,

        }),

    ]);



    if (resultadoCategorias.error) {

      console.error(

        "Erro ao carregar categorias:",

        resultadoCategorias.error

      );

    }



    if (resultadoProdutos.error) {

      console.error(

        "Erro ao carregar produtos:",

        resultadoProdutos.error

      );

    }



    if (resultadoVariacoes.error) {

      console.error(

        "Erro ao carregar estoque:",

        resultadoVariacoes.error

      );

    }



    if (resultadoConfiguracoes.error) {

      console.error(

        "Erro ao carregar configurações:",

        resultadoConfiguracoes.error

      );

    }



    if (resultadoBeneficios.error) {

      console.error(

        "Erro ao carregar benefícios:",

        resultadoBeneficios.error

      );

    }



    setCategorias(

      resultadoCategorias.data ?? []

    );



    setProdutos(

      (

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

      }))

    );



    setVariacoes(

      (

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

      }))

    );



    const configuracoesObjeto: Record<string, string> = {};



    for (

      const item of

      resultadoConfiguracoes.data ?? []

    ) {

      configuracoesObjeto[

        item.chave

      ] = item.valor ?? "";

    }



    setConfig(

      configuracoesObjeto

    );



    setBeneficios(

      resultadoBeneficios.data ?? []

    );



    setCarregando(false);

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



  function produtoTemVariacoes(

    produtoId: string

  ) {

    return (

      variacoesDoProduto(

        produtoId

      ).length > 0

    );

  }



  function estoqueDaCombinacao(

    produtoId: string,

    tamanho: string,

    cor: string

  ) {

    const variacao =

      variacoes.find(

        (item) =>

          item.produto_id ===

            produtoId &&

          (item.tamanho ||

            "") ===

            (tamanho ||

              "") &&

          (item.cor || "") ===

            (cor || "")

      );



    return Number(

      variacao?.estoque ?? 0

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



  function tamanhoDisponivel(

    produto: Produto,

    tamanho: string

  ) {

    if (

      !produtoTemVariacoes(

        produto.id

      )

    ) {

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

    if (

      !produtoTemVariacoes(

        produto.id

      )

    ) {

      return produto.estoque > 0;

    }



    if (

      produto.tamanhos.length ===

      0

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



  function abrirSelecaoProduto(

    produto: Produto

  ) {

    if (

      estoqueDisponivelProduto(

        produto

      ) <= 0

    ) {

      return;

    }



    setProdutoSelecionado(

      produto

    );



    setTamanhoSelecionado("");

    setCorSelecionada("");

    setErroSelecao("");

  }



  function fecharSelecaoProduto() {

    setProdutoSelecionado(

      null

    );



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

      produtoTemVariacoes(

        produto.id

      ) &&

      estoqueDaCombinacao(

        produto.id,

        tamanho,

        corSelecionada

      ) <= 0

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

      produtoTemVariacoes(

        produto.id

      ) &&

      estoqueDaCombinacao(

        produto.id,

        tamanhoSelecionado,

        cor

      ) <= 0

    ) {

      setTamanhoSelecionado("");

    }

  }



  function confirmarProduto() {

    if (!produtoSelecionado) {

      return;

    }



    if (

      produtoSelecionado

        .tamanhos.length > 0 &&

      !tamanhoSelecionado

    ) {

      setErroSelecao(

        "Selecione o tamanho antes de adicionar à sacola."

      );



      return;

    }



    if (

      produtoSelecionado

        .cores.length > 0 &&

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



    let estoqueDisponivel =

      produtoSelecionado.estoque;



    if (

      produtoTemVariacoes(

        produtoSelecionado.id

      )

    ) {

      estoqueDisponivel =

        estoqueDaCombinacao(

          produtoSelecionado.id,

          tamanhoFinal,

          corFinal

        );

    }



    if (

      estoqueDisponivel <= 0

    ) {

      setErroSelecao(

        "Essa combinação está sem estoque."

      );



      return;

    }



    const carrinho =

      lerCarrinho();



    const itemExistente =

      carrinho.find(

        (item) =>

          item.id ===

            produtoSelecionado.id &&

          (item.tamanho ||

            "") ===

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

      id:

        produtoSelecionado.id,



      nome:

        produtoSelecionado.nome,



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



  const novidades = useMemo(() => {

    const produtosNovos =

      produtos.filter(

        (produto) =>

          produto.novidade

      );



    if (

      produtosNovos.length >= 4

    ) {

      return produtosNovos.slice(

        0,

        4

      );

    }



    if (

      produtosNovos.length > 0

    ) {

      const restantes =

        produtos.filter(

          (produto) =>

            !produto.novidade

        );



      return [

        ...produtosNovos,

        ...restantes,

      ].slice(0, 4);

    }



    return produtos.slice(0, 4);

  }, [produtos]);



  const beneficiosExibidos =

    beneficios.length > 0

      ? beneficios

      : beneficiosPadrao;



  const heroTitulo =

    config.hero_titulo ||

    "O estilo que acompanha o seu ritmo.";



  const heroDescricao =

    config.hero_descricao ||

    "Conforto, movimento e estilo para treinar, praticar esportes e viver o seu dia.";



  const heroBotao =

    config.hero_botao ||

    "Explore a coleção";



  const heroImagem =

    config.hero_imagem ||

    "/hero-dona-chic.webp";



  const bannersImagens =

    Array.from(

      { length: 10 },

      (_, indice) =>

        config[

          `banner_${indice + 1}_imagem`

        ] || ""

    );



  const imagensPromocao = [

    bannersImagens[0] ||

      "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=1000&q=88",



    bannersImagens[1] ||

      "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=1000&q=88",



    bannersImagens[2] ||

      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1000&q=88",

  ];



  const imagemLifestyle =

    bannersImagens[3] ||

    "/hero-dona-chic.webp";



  const bannersEditoriais =

    bannersImagens

      .slice(4)

      .filter(Boolean);



  const instagramImagens = [

    config.instagram_imagem_1 ||

      "https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=700&q=85",



    config.instagram_imagem_2 ||

      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=700&q=85",



    config.instagram_imagem_3 ||

      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=700&q=85",



    config.instagram_imagem_4 ||

      "https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?auto=format&fit=crop&w=700&q=85",

  ];



  const topoEsquerda =

    config.topo_esquerda ||

    "Fitness & Sport";



  const topoCentro =

    config.topo_centro ||

    "Entrega para todo o Brasil";



  const topoDireita =

    config.topo_direita ||

    "Compre pelo WhatsApp";



  const menuNovidades =

    config.menu_novidades ||

    "Novidades";



  const menuEstilo =

    config.menu_estilo ||

    "Encontre seu estilo";



  const menuPromocao =

    config.menu_promocao ||

    "Compre +4 Peças";



  const menuInstagram =

    config.menu_instagram ||

    "Instagram";



  const instagramUrlSalvo = (config.instagram_url || "").trim();

  const instagramUrl = (() => {
    if (!instagramUrlSalvo) {
      return "https://www.instagram.com/_donachicoficial/";
    }

    if (/^https?:\/\//i.test(instagramUrlSalvo)) {
      return instagramUrlSalvo;
    }

    const usuario = instagramUrlSalvo
      .replace(/^@/, "")
      .replace(/^instagram\.com\//i, "")
      .replace(/^www\.instagram\.com\//i, "")
      .replace(/^\/+|\/+$/g, "");

    return `https://www.instagram.com/${usuario}/`;
  })();



  const whatsappUrl =

    "https://wa.me/5591980660825?text=Ol%C3%A1%20Dona%20Chic!%20Gostaria%20de%20mais%20informa%C3%A7%C3%B5es.";



  let menuExtras: MenuExtra[] = [];



  try {

    const dadosMenu =

      JSON.parse(

        config.menu_extras_json ||

          "[]"

      );



    menuExtras =

      Array.isArray(dadosMenu)

        ? dadosMenu

        : [];

  } catch {

    menuExtras = [];

  }



  const tituloEstilo =

    config.titulo_estilo ||

    "Seu estilo • Seu movimento";



  const tituloColecao =

    config.titulo_colecao ||

    "Nova coleção";



  const tituloPromocao =

    config.titulo_promocao ||

    "Quanto mais peças você escolhe, melhor fica sua compra.";



  const instagramUsuario =

    config.instagram_usuario ||

    "@_donachicoficial";



  const instagramTitulo =

    config.instagram_titulo ||

    "Dona Chic no Instagram";



  const newsletterTitulo =

    config.newsletter_titulo ||

    "Entre para o nosso universo.";



  const newsletterDescricao =

    config.newsletter_descricao ||

    "Novidades, lançamentos e condições especiais para você.";



  const newsletterBotao =

    config.newsletter_botao ||

    "Quero novidades";



  const rodapeFrase =

    config.rodape_frase ||

    "Elegância em todos os detalhes.";



  return (

    <>

      <main

        className={`${montserrat.className} min-h-screen bg-[#f4f1ed] text-[#17120f]`}

      >

        <div className="bg-black px-4 py-[9px] text-[8px] uppercase tracking-[0.2em] text-white sm:px-5 sm:text-[9px]">

          <div className="mx-auto flex max-w-[1500px] justify-between gap-4">

            <span>

              {topoEsquerda}

            </span>



            <span className="hidden md:block">

              {topoCentro}

            </span>



            <a

              href={whatsappUrl}

              target="_blank"

              rel="noreferrer"

              className="transition hover:text-[#d9a48d]"

            >

              {topoDireita}

            </a>

          </div>

        </div>



        <header className="border-b border-[#e9e0da] bg-[#faf7f2]">

          <div className="mx-auto flex max-w-[1500px] items-center justify-between px-4 py-3 sm:px-6 lg:px-10">

            <a href="/">

              <div className="flex h-[64px] w-[88px] items-center justify-center bg-black sm:h-[76px] sm:w-[105px]">

                <img

                  src="/logo-dona-chic.webp"

                  alt="Dona Chic"

                  className="h-[58px] w-[80px] object-contain sm:h-[70px] sm:w-[95px]"

                />

              </div>

            </a>



            <nav className="hidden flex-wrap items-center justify-center gap-x-7 gap-y-2 lg:flex">

              <a

                href="#colecao"

                className={`${cormorant.className} text-[21px] font-semibold text-[#332722] transition hover:text-[#ad7058]`}

              >

                {menuNovidades}

              </a>



              <a

                href="#estilo"

                className={`${cormorant.className} text-[21px] font-semibold text-[#332722] transition hover:text-[#ad7058]`}

              >

                {menuEstilo}

              </a>



              <a

                href="#promocoes"

                className={`${cormorant.className} rounded-full border border-[#caa18e] px-7 py-[9px] text-[20px] font-semibold text-[#9d624b] transition hover:bg-[#af725a] hover:text-white`}

              >

                {menuPromocao}

              </a>



              <a

                href={instagramUrl}

                target="_blank"

                rel="noreferrer"

                className={`${cormorant.className} text-[21px] font-semibold text-[#332722] transition hover:text-[#ad7058]`}

              >

                {menuInstagram}

              </a>



              {menuExtras.map(

                (item) => (

                  <a

                    key={item.id}

                    href={

                      item.href ||

                      "#"

                    }

                    className={`${cormorant.className} text-[19px] font-semibold text-[#332722] transition hover:text-[#ad7058]`}

                  >

                    {item.label}

                  </a>

                )

              )}

            </nav>



            <div className="flex items-center gap-3 sm:gap-4">

              <button

                type="button"

                aria-label="Buscar"

              >

                <SearchIcon />

              </button>




              <button

                type="button"

                aria-label="Favoritos"

              >

                <HeartIcon />

              </button>



              <a

                href="/sacola"

                className="relative"

                aria-label="Sacola"

              >

                <BagIcon />



                {quantidadeSacola >

                  0 && (

                  <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#b97a61] px-1 text-[8px] text-white">

                    {quantidadeSacola >

                    99

                      ? "99+"

                      : quantidadeSacola}

                  </span>

                )}

              </a>

            </div>

          </div>

        </header>



        <section className="relative h-[calc(100svh-134px)] min-h-[500px] overflow-hidden bg-black">

          <img

            src={heroImagem}

            alt=""

            className="absolute inset-0 h-full w-full scale-110 object-cover opacity-55 blur-xl"

          />



          <img

            src={heroImagem}

            alt="Dona Chic Fitness"

            className="absolute inset-0 h-full w-full object-contain"

          />



          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/28 to-transparent" />



          <div className="relative mx-auto flex h-full max-w-[1500px] items-center px-5 sm:px-7 lg:px-[108px]">

            <div className="max-w-[650px] text-white">

              <p className="mb-5 text-[10px] uppercase tracking-[0.3em] text-[#d9aa95]">

                Dona Chic · 2026

              </p>



              <h1

                className={`${playfair.className} text-[42px] leading-[1.02] sm:text-[50px] md:text-[58px] lg:text-[66px]`}

              >

                {heroTitulo}

              </h1>



              <p className="mt-5 max-w-[520px] text-[13px] leading-6 text-white/90">

                {heroDescricao}

              </p>



              <a

                href="/produtos"

                className="group mt-7 inline-flex items-center justify-center rounded-full bg-[#f8f4ef] px-9 py-[12px] text-center text-[#35251e] shadow-lg transition hover:bg-[#d9a58c] hover:text-white"

              >

                <span

                  className={`${cormorant.className} text-[21px] font-semibold`}

                >

                  {heroBotao}

                </span>

              </a>

            </div>

          </div>

        </section>



        <section

          id="estilo"

          className="scroll-mt-0 bg-[#f4f1ed] px-4 py-7 sm:px-5 lg:h-[100svh] lg:overflow-hidden lg:px-7 lg:py-6"

        >

          <div className="mx-auto flex min-h-full w-full flex-col">

            <div className="shrink-0 lg:flex lg:items-end lg:justify-between">

              <div>

                <p className="mb-2 text-[10px] uppercase tracking-[0.34em] text-[#a56f59]">

                  Moda fitness & esportiva

                </p>



                <h2

                  className={`${playfair.className} text-[36px] font-bold uppercase leading-[0.95] tracking-[-0.03em] sm:text-[48px] lg:text-[58px] xl:text-[64px]`}

                >

                  {tituloEstilo}

                </h2>

              </div>



              <a

                href="/produtos"

                className="mt-5 flex w-fit items-center gap-4 border-b border-[#cfc7c0] pb-2 text-[10px] uppercase tracking-[0.18em] lg:mt-0 lg:text-[11px]"

              >

                Ver todas as coleções

                <SlimArrow />

              </a>

            </div>



            {carregando ? (

              <div className="flex flex-1 items-center justify-center py-20">

                <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#d8ccc5] border-t-black" />

              </div>

            ) : (

              <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:min-h-0 lg:flex-1 lg:grid-cols-3">

                {categorias.map(

                  (

                    categoria,

                    index

                  ) => {

                    const imagem =

                      categoria.imagem ||

                      imagensCategorias[

                        categoria.slug

                      ] ||

                      "/hero-dona-chic.webp";



                    return (

                      <a

                        key={

                          categoria.id

                        }

                        href={`/produtos?categoria=${encodeURIComponent(

                          categoria.slug

                        )}`}

                        className="group relative min-h-[220px] overflow-hidden bg-black lg:min-h-[220px]"

                      >

                        <img

                          src={

                            imagem

                          }

                          alt=""

                          className="absolute inset-0 h-full w-full scale-110 object-cover blur-xl"

                        />



                        <div className="absolute inset-y-0 left-1/2 w-[48%] -translate-x-1/2 overflow-hidden">

                          <img

                            src={

                              imagem

                            }

                            alt={

                              categoria.nome

                            }

                            className="h-full w-full object-cover object-center"

                          />

                        </div>



                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/16 to-transparent" />



                        <div className="absolute inset-0 flex flex-col justify-end p-5 text-white lg:p-6">

                          <span className="mb-2 text-[10px] tracking-[0.25em] text-[#f0c1aa]">

                            {String(

                              index +

                                1

                            ).padStart(

                              2,

                              "0"

                            )}

                          </span>



                          <h3

                            className={`${playfair.className} text-[27px] leading-none lg:text-[30px]`}

                          >

                            {

                              categoria.nome

                            }

                          </h3>



                          <p className="mt-2 text-[12px] font-medium lg:text-[13px]">

                            {

                              categoria.descricao

                            }

                          </p>



                          <div className="mt-3 flex items-center gap-3">

                            <span className="text-[10px] font-semibold uppercase tracking-[0.17em]">

                              Descobrir

                            </span>



                            <SlimArrow />

                          </div>

                        </div>

                      </a>

                    );

                  }

                )}

              </div>

            )}

          </div>

        </section>



        <section

          id="colecao"

          className="scroll-mt-0 bg-white px-3 py-7 sm:px-5 lg:h-[100svh] lg:overflow-hidden lg:px-7 lg:py-4"

        >

          <div className="flex min-h-full w-full flex-col">

            <div className="flex shrink-0 items-end justify-between">

              <div>

                <p className="mb-1 text-[9px] uppercase tracking-[0.28em] text-[#9f654e]">

                  Seleção Dona Chic

                </p>



                <h2

                  className={`${playfair.className} text-[42px] leading-none text-black sm:text-[50px] lg:text-[54px]`}

                >

                  {tituloColecao}

                </h2>

              </div>

            </div>



            {novidades.length ===

            0 ? (

              <div className="mt-8 flex min-h-[420px] flex-1 items-center justify-center border border-[#e6ded8] bg-[#faf8f6]">

                <div className="text-center">

                  <p

                    className={`${playfair.className} text-[30px] text-[#2d2622]`}

                  >

                    Novidades em breve

                  </p>



                  <p className="mt-3 text-[12px] text-[#8c8079]">

                    Cadastre produtos no painel administrativo.

                  </p>

                </div>

              </div>

            ) : (

              <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-2 lg:flex-1 lg:grid-cols-4 lg:gap-x-4">

                {novidades.map(

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

                        className="group min-w-0 h-full lg:flex lg:flex-col"

                      >

                        <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#f5f2ef] lg:h-[270px] lg:min-h-0 lg:flex-none lg:aspect-auto">

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
                              imageClassName="h-full w-full cursor-pointer object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
                              controlsBottomClass="bottom-16"
                              onImageClick={() =>
                                abrirSelecaoProduto(produto)
                              }
                            />

                          ) : (

                            <div className="flex h-full items-center justify-center">

                              <p

                                className={`${playfair.className} text-[24px] text-[#a0928a]`}

                              >

                                Dona Chic

                              </p>

                            </div>

                          )}



                          {produto.novidade && (

                            <span className="absolute left-3 top-3 bg-[#d4a18a] px-3 py-1.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-white">

                              Novidade

                            </span>

                          )}



                          <button

                            type="button"

                            aria-label="Adicionar aos favoritos"

                            className="absolute right-3 top-3 flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white/95 text-black shadow-sm"

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

                            className={`absolute bottom-3 left-3 right-3 py-[13px] text-[9px] font-semibold uppercase tracking-[0.15em] text-white ${

                              estoqueTotal <=

                              0

                                ? "cursor-not-allowed bg-[#89837f]"

                                : produtoAdicionado ===

                                    produto.id

                                  ? "bg-[#9b6a55]"

                                  : "bg-black"

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



                        <div className="flex flex-1 flex-col shrink-0">

                          <h3

                            className={`${playfair.className} mt-2 min-h-[48px] text-[15px] font-medium leading-[1.15] text-black sm:min-h-[52px] sm:text-[18px] lg:min-h-[52px] lg:text-[17px]`}

                          >

                            {

                              produto.nome

                            }

                          </h3>



                          <div className="mt-2 border-t border-[#eee7e2] pt-2">

                            <div className="flex flex-wrap items-baseline gap-x-2">

                              <span className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[#655c57]">

                                Preço normal

                              </span>



                              <span
                                  className={`text-[12px] font-bold text-[#2e2825] ${
                                    (
                                      produto as Produto & {
                                        riscar_preco_normal?: boolean;
                                      }
                                    ).riscar_preco_normal
                                      ? "line-through decoration-1 opacity-60"
                                      : ""
                                  }`}
                                >

                                  {formatarPreco(

                                    produto.preco_normal

                                  )}

                                </span>

                            </div>



                            <div className="mt-1.5 bg-[#f3e3da] px-2.5 py-1.5">

                              <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[#9f654e]">

                                Preço Chic+ · a partir de 4 peças

                              </p>



                              <p

                                className={`${playfair.className} text-[20px] font-bold leading-none text-[#8f513a]`}

                              >

                                {formatarPreco(

                                  produto.preco_chic

                                )}

                              </p>

                            </div>



                            <div className="mt-1.5 flex items-center gap-2">

                              <span className="rounded-full border border-[#d9cec7] px-2 py-[2px] text-[7px] font-semibold uppercase tracking-[0.08em] text-[#645a55]">

                                Parcelamento

                              </span>



                              <p className="text-[10px] font-semibold text-[#4d4540]">

                                {parcelamento(

                                  produto.preco_chic

                                )}

                              </p>

                            </div>

                          </div>

                        </div>

                      </article>

                    );

                  }

                )}

              </div>

            )}



            <div className="mt-5 shrink-0 text-center">

              <a

                href="/produtos?categoria=novidades"

                className={`${cormorant.className} inline-flex items-center justify-center rounded-full bg-black px-8 py-3 text-center text-[18px] font-semibold text-white transition hover:bg-[#a76f59]`}

              >

                Ver novidades

              </a>

            </div>

          </div>

        </section>



        <section

          id="promocoes"

          className="scroll-mt-0 grid bg-black lg:h-[100svh] lg:overflow-hidden lg:grid-cols-4"

        >

          <div className="flex flex-col justify-center bg-black px-7 py-10 text-white sm:px-10 lg:px-10 lg:py-8">

            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#d6aa97]">

              Quanto mais, melhor

            </p>



            <h2

              className={`${playfair.className} mt-5 text-[40px] leading-[1.02] sm:text-[46px] lg:text-[44px] xl:text-[48px]`}

            >

              {tituloPromocao}

            </h2>



            <p className="mt-5 text-[14px] leading-7 text-white/85">

              Monte seu look fitness e esportivo completo.

            </p>



            <a

              href="/produtos"

              className={`${cormorant.className} mt-8 inline-flex w-fit items-center justify-center rounded-full bg-white px-8 py-4 text-center text-[21px] font-semibold text-black transition hover:bg-[#d7a58e] hover:text-white`}

            >

              Escolher minhas peças

            </a>

          </div>



          {imagensPromocao.map(

            (imagem) => (

              <div

                key={imagem}

                className="min-h-[350px] overflow-hidden lg:min-h-0"

              >

                <img

                  src={

                    imagem

                  }

                  alt="Dona Chic"

                  className="h-full w-full object-cover"

                />

              </div>

            )

          )}

        </section>



        <section className="grid lg:min-h-[560px] lg:grid-cols-2">

          <div className="relative min-h-[460px] overflow-hidden bg-black">

            <img

              src={

                imagemLifestyle

              }

              alt=""

              className="absolute inset-0 h-full w-full scale-110 object-cover opacity-45 blur-lg"

            />



            <img

              src={

                imagemLifestyle

              }

              alt="Dona Chic"

              className="absolute inset-0 h-full w-full object-contain"

            />

          </div>



          <div className="flex items-center bg-[#e7d3c8] px-7 py-14 sm:px-10 lg:px-20">

            <div className="max-w-[650px]">

              <h2

                className={`${playfair.className} text-[46px] leading-[0.98] text-[#120d0c] sm:text-[56px] lg:text-[62px] xl:text-[68px]`}

              >

                Feita para o seu

                <br />

                ritmo.

                <br />



                <span className="italic text-[#c89883]">

                  Dentro e fora do

                  <br />

                  treino.

                </span>

              </h2>



              <p className="mt-8 max-w-[540px] text-[17px] leading-8 text-[#5f524b]">

                Peças fitness e esportivas femininas que combinam com quem vive em movimento.

              </p>

            </div>

          </div>

        </section>



        {bannersEditoriais.length >

          0 && (

          <section className="bg-[#f4f1ed] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">

            <div className="mx-auto max-w-[1500px]">

              <div className="mb-6 flex items-end justify-between gap-4">

                <div>

                  <p className="text-[9px] uppercase tracking-[0.28em] text-[#c89a84]">

                    Dona Chic

                  </p>



                  <h2

                    className={`${playfair.className} mt-2 text-[36px] leading-none sm:text-[44px]`}

                  >

                    Destaques

                  </h2>

                </div>

              </div>



              <div

                className={`grid gap-3 ${

                  bannersEditoriais.length ===

                  1

                    ? "grid-cols-1"

                    : bannersEditoriais.length ===

                        2

                      ? "md:grid-cols-2"

                      : "md:grid-cols-2 lg:grid-cols-3"

                }`}

              >

                {bannersEditoriais.map(

                  (

                    imagem,

                    indice

                  ) => (

                    <div

                      key={`${imagem}-${indice}`}

                      className="relative aspect-[16/9] overflow-hidden bg-black"

                    >

                      <img

                        src={

                          imagem

                        }

                        alt={`Destaque Dona Chic ${

                          indice +

                          1

                        }`}

                        className="h-full w-full object-cover"

                      />



                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                    </div>

                  )

                )}

              </div>

            </div>

          </section>

        )}



        <section className="border-y border-[#e5ddd8] bg-white">

          <div className="grid w-full grid-cols-2 lg:grid-cols-5">

            {beneficiosExibidos.map(

              (

                beneficio,

                index

              ) => (

                <div

                  key={

                    "id" in

                    beneficio

                      ? beneficio.id

                      : `${beneficio.titulo}-${index}`

                  }

                  className="border-r border-[#e5ddd8] px-4 py-6 text-center sm:px-5 sm:py-7"

                >

                  <p

                    className={`${playfair.className} text-[17px] leading-tight text-[#17120f] md:text-[20px]`}

                  >

                    {

                      beneficio.titulo

                    }

                  </p>



                  <p className="mt-2 text-[11px] font-medium leading-5 text-[#8f7f77] md:text-[12px]">

                    {

                      beneficio.descricao

                    }

                  </p>

                </div>

              )

            )}

          </div>

        </section>



        <section

          id="instagram"

          className="scroll-mt-0 flex flex-col justify-center bg-[#f7f3ee] px-4 pb-4 pt-4 sm:px-6 sm:pt-5 lg:h-[430px]"

        >

          <div className="text-center">

            {instagramUrl ? (

              <a

                href={

                  instagramUrl

                }

                target="_blank"

                rel="noreferrer"

                className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[#9f654e] underline-offset-4 hover:underline sm:text-[11px]"

              >

                {

                  instagramUsuario

                }

              </a>

            ) : (

              <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[#9f654e] sm:text-[11px]">

                {

                  instagramUsuario

                }

              </p>

            )}



            <h2

              className={`${playfair.className} mt-4 text-[40px] leading-none text-[#17120f] sm:text-[48px] md:text-[54px]`}

            >

              {

                instagramTitulo

              }

            </h2>



            {instagramUrl && (

              <a

                href={

                  instagramUrl

                }

                target="_blank"

                rel="noreferrer"

                className="mt-5 inline-flex items-center gap-3 border-b border-[#b98973] pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7d5848]"

              >

                Visitar Instagram

                <SlimArrow />

              </a>

            )}

          </div>



          <div className="mt-5 grid grid-cols-2 md:grid-cols-4">

            {instagramImagens.map(

              (imagem) => (

                <a

                  key={

                    imagem

                  }

                  href={instagramUrl}

                  target="_blank"

                  rel="noreferrer"

                  className="aspect-square overflow-hidden md:h-[205px] md:aspect-auto"

                  aria-label="Abrir Instagram da Dona Chic"

                >

                  <img

                    src={

                      imagem

                    }

                    alt="Instagram Dona Chic"

                    className="h-full w-full object-cover transition duration-300 hover:scale-[1.03]"

                  />

                </a>

              )

            )}

          </div>

        </section>



        <section className="bg-[#e8d2c5] px-6 py-12 sm:px-8 sm:py-14">

          <div className="mx-auto flex max-w-[1450px] flex-col justify-between gap-10 md:flex-row md:items-center">

            <div className="max-w-[520px]">

              <h3

                className={`${playfair.className} text-[34px] leading-tight text-[#17120f] sm:text-[42px]`}

              >

                {

                  newsletterTitulo

                }

              </h3>



              <p className="mt-3 text-[14px] leading-7 text-[#7d695f] sm:text-[16px]">

                {

                  newsletterDescricao

                }

              </p>

            </div>



            <div className="flex w-full max-w-[560px] items-center gap-4 border-b border-[#806f66] pb-2">

              <input

                type="email"

                placeholder="Seu melhor e-mail"

                className="flex-1 bg-transparent py-3 text-[15px] text-[#4e413c] outline-none placeholder:text-[#8d7c74]"

              />



              <button

                type="button"

                className={`${cormorant.className} text-[24px] font-semibold text-[#17120f]`}

              >

                {

                  newsletterBotao

                }

              </button>

            </div>

          </div>

        </section>



        <footer className="bg-black px-6 py-16 text-white sm:px-8 sm:py-20">

          <div className="mx-auto grid max-w-[1450px] gap-12 md:grid-cols-4">

            <div>

              <img

                src="/logo-dona-chic.webp"

                alt="Dona Chic"

                className="h-[125px] w-[145px] object-contain"

              />



              <p className="mt-5 max-w-[220px] text-[14px] leading-6 text-white/70">

                {

                  rodapeFrase

                }

              </p>

            </div>



            <div>

              <h4

                className={`${playfair.className} text-[28px] text-white`}

              >

                Dona Chic

              </h4>



              <div className="mt-5 space-y-3 text-[15px] text-white/72">

                <p>

                  Sobre nós

                </p>



                <p>

                  Contato

                </p>


              </div>

            </div>



            <div>

              <h4

                className={`${playfair.className} text-[28px] text-white`}

              >

                Ajuda

              </h4>



              <div className="mt-5 space-y-3 text-[15px] text-white/72">

                <p>

                  Entrega

                </p>



                <p>

                  Trocas

                </p>



                <p>

                  Pagamento

                </p>



                <p>

                  Perguntas frequentes

                </p>

              </div>

            </div>



            <div>

              <h4

                className={`${playfair.className} text-[28px] text-white`}

              >

                Siga a Dona Chic

              </h4>



              <div className="mt-5 space-y-3 text-[15px] text-white/72">

                {instagramUrl ? (

                  <a

                    href={

                      instagramUrl

                    }

                    target="_blank"

                    rel="noreferrer"

                    className="block"

                  >

                    {

                      instagramUsuario

                    }

                  </a>

                ) : (

                  <p>

                    {

                      instagramUsuario

                    }

                  </p>

                )}



                <a

                  href={whatsappUrl}

                  target="_blank"

                  rel="noreferrer"

                  className="block transition hover:text-[#d9a48d]"

                >

                  WhatsApp

                </a>

              </div>

            </div>

          </div>



          <div className="mx-auto mt-14 max-w-[1450px] border-t border-white/10 pt-6 text-[11px] uppercase tracking-[0.2em] text-white/40">

            © 2026 Dona Chic · Todos os direitos reservados

          </div>

        </footer>



        <a

          href={whatsappUrl}

          target="_blank"

          rel="noreferrer"

          aria-label="Falar com a Dona Chic pelo WhatsApp"

          className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-lg transition hover:scale-105 hover:shadow-xl"

        >

          <WhatsAppIcon />

        </a>

      </main>



      {produtoSelecionado && (

        <div

          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 px-4 py-6"

          onMouseDown={(

            event

          ) => {

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

                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#a67863]">

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

                    <span className="text-[10px] uppercase tracking-[0.12em] text-[#776b65]">

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

                        <span className="text-[10px] text-[#8a7e77]">

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

                        <span className="text-[10px] text-[#8a7e77]">

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

                              {

                                tamanho

                              }

                            </button>

                          );

                        }

                      )}

                    </div>

                  </div>

                )}



                {produtoTemVariacoes(

                  produtoSelecionado.id

                ) &&

                  tamanhoSelecionado &&

                  corSelecionada && (

                    <div className="mt-5 rounded-xl bg-[#f2eee9] px-4 py-3">

                      <p className="text-[9px] uppercase tracking-[0.13em] text-[#80736c]">

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

                    {

                      erroSelecao

                    }

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



                <p className="mt-3 text-center text-[9px] leading-4 text-[#91857e]">

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