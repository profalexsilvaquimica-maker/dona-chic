"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Montserrat,
  Playfair_Display,
  Cormorant_Garamond,
} from "next/font/google";
import { supabase } from "../lib/supabase";

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
  tamanhos: string[];
  cores: string[];
  ordem: number;
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

function UserIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.4-4 4.1-6 8-6s6.6 2 8 6" />
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
  const [beneficios, setBeneficios] = useState<Beneficio[]>([]);
  const [config, setConfig] = useState<Record<string, string>>({});
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarSite();
  }, []);

  async function carregarSite() {
    setCarregando(true);

    const [
      resultadoCategorias,
      resultadoProdutos,
      resultadoConfiguracoes,
      resultadoBeneficios,
    ] = await Promise.all([
      supabase
        .from("categorias")
        .select("*")
        .eq("ativo", true)
        .order("ordem", { ascending: true }),

      supabase
        .from("produtos")
        .select("*")
        .eq("ativo", true)
        .order("ordem", { ascending: true })
        .order("created_at", { ascending: false }),

      supabase.from("configuracoes").select("*"),

      supabase
        .from("beneficios")
        .select("*")
        .eq("ativo", true)
        .order("ordem", { ascending: true }),
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

    setCategorias(resultadoCategorias.data ?? []);

    setProdutos(
      (resultadoProdutos.data ?? []).map((produto) => ({
        ...produto,
        preco_normal: Number(produto.preco_normal ?? 0),
        preco_chic: Number(produto.preco_chic ?? 0),
        estoque: Number(produto.estoque ?? 0),
        ordem: Number(produto.ordem ?? 0),
        tamanhos: produto.tamanhos ?? [],
        cores: produto.cores ?? [],
      }))
    );

    const configuracoesObjeto: Record<string, string> = {};

    for (const item of resultadoConfiguracoes.data ?? []) {
      configuracoesObjeto[item.chave] = item.valor ?? "";
    }

    setConfig(configuracoesObjeto);
    setBeneficios(resultadoBeneficios.data ?? []);
    setCarregando(false);
  }

  const novidades = useMemo(() => {
    const produtosNovos = produtos.filter(
      (produto) => produto.novidade
    );

    if (produtosNovos.length >= 4) {
      return produtosNovos.slice(0, 4);
    }

    if (produtosNovos.length > 0) {
      const restantes = produtos.filter(
        (produto) => !produto.novidade
      );

      return [...produtosNovos, ...restantes].slice(0, 4);
    }

    return produtos.slice(0, 4);
  }, [produtos]);

  const beneficiosExibidos =
    beneficios.length > 0 ? beneficios : beneficiosPadrao;

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

  const bannersImagens = Array.from(
    { length: 10 },
    (_, indice) =>
      config[`banner_${indice + 1}_imagem`] || ""
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
    bannersImagens.slice(4).filter(Boolean);

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

  const instagramUrl =
    config.instagram_url || "";

  let menuExtras: MenuExtra[] = [];

  try {
    const dadosMenu = JSON.parse(
      config.menu_extras_json || "[]"
    );

    menuExtras = Array.isArray(dadosMenu)
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
    "@donachicoficial";

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
    <main
      className={`${montserrat.className} min-h-screen bg-[#f4f1ed] text-[#17120f]`}
    >
      {/* =========================================================
          TOPO
      ========================================================= */}

      <div className="bg-black px-4 py-[9px] text-[8px] uppercase tracking-[0.2em] text-white sm:px-5 sm:text-[9px]">
        <div className="mx-auto flex max-w-[1500px] justify-between gap-4">
          <span>{topoEsquerda}</span>

          <span className="hidden md:block">
            {topoCentro}
          </span>

          <span>{topoDireita}</span>
        </div>
      </div>

      {/* =========================================================
          CABEÇALHO
      ========================================================= */}

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
              href="#instagram"
              className={`${cormorant.className} text-[21px] font-semibold text-[#332722] transition hover:text-[#ad7058]`}
            >
              {menuInstagram}
            </a>

            {menuExtras.map((item) => (
              <a
                key={item.id}
                href={item.href || "#"}
                className={`${cormorant.className} text-[19px] font-semibold text-[#332722] transition hover:text-[#ad7058]`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              aria-label="Buscar"
            >
              <SearchIcon />
            </button>

            <a
              href="/admin"
              aria-label="Minha conta"
            >
              <UserIcon />
            </a>

            <button
              type="button"
              aria-label="Favoritos"
            >
              <HeartIcon />
            </button>

            <button
              type="button"
              className="relative"
              aria-label="Sacola"
            >
              <BagIcon />

              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#b97a61] text-[8px] text-white">
                0
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================
          HERO
      ========================================================= */}

      <section className="relative h-[calc(100svh-96px)] min-h-[560px] overflow-hidden bg-black">
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
              className="group mt-7 inline-flex items-center gap-7 rounded-full bg-[#f8f4ef] px-9 py-[12px] text-[#35251e] shadow-lg transition hover:bg-[#d9a58c] hover:text-white"
            >
              <span
                className={`${cormorant.className} text-[21px] font-semibold`}
              >
                {heroBotao}
              </span>

              <ElegantArrow />
            </a>
          </div>
        </div>
      </section>

      {/* =========================================================
          CATEGORIAS
      ========================================================= */}

      <section
        id="estilo"
        className="scroll-mt-0 bg-[#f4f1ed] px-4 py-7 sm:px-5 lg:min-h-[100svh] lg:px-7 lg:py-8"
      >
        <div className="mx-auto flex min-h-full w-full flex-col">
          <div className="shrink-0 lg:flex lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 text-[10px] uppercase tracking-[0.34em] text-[#d1a38f]">
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
              {categorias.map((categoria, index) => {
                const imagem =
                  categoria.imagem ||
                  imagensCategorias[categoria.slug] ||
                  "/hero-dona-chic.webp";

                return (
                  <a
                    key={categoria.id}
                    href={`/produtos?categoria=${encodeURIComponent(
                      categoria.slug
                    )}`}
                    className="group relative min-h-[220px] overflow-hidden bg-black lg:min-h-[280px]"
                  >
                    <img
                      src={imagem}
                      alt=""
                      className="absolute inset-0 h-full w-full scale-110 object-cover blur-xl"
                    />

                    <div className="absolute inset-y-0 left-1/2 w-[48%] -translate-x-1/2 overflow-hidden">
                      <img
                        src={imagem}
                        alt={categoria.nome}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/16 to-transparent" />

                    <div className="absolute inset-0 flex flex-col justify-end p-5 text-white lg:p-6">
                      <span className="mb-2 text-[10px] tracking-[0.25em] text-[#f0c1aa]">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <h3
                        className={`${playfair.className} text-[27px] leading-none lg:text-[30px]`}
                      >
                        {categoria.nome}
                      </h3>

                      <p className="mt-2 text-[12px] font-medium lg:text-[13px]">
                        {categoria.descricao}
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
              })}
            </div>
          )}
        </div>
      </section>

      {/* =========================================================
          NOVA COLEÇÃO
      ========================================================= */}

      <section
        id="colecao"
        className="scroll-mt-0 bg-white px-3 py-7 sm:px-5 lg:min-h-[100svh] lg:px-7 lg:py-7"
      >
        <div className="flex min-h-full w-full flex-col">
          <div className="flex shrink-0 items-end justify-between">
            <div>
              <p className="mb-1 text-[9px] uppercase tracking-[0.28em] text-[#c89a84]">
                Seleção Dona Chic
              </p>

              <h2
                className={`${playfair.className} text-[42px] leading-none text-black sm:text-[50px] lg:text-[54px]`}
              >
                {tituloColecao}
              </h2>
            </div>
          </div>

          {novidades.length === 0 ? (
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
              {novidades.map((produto) => (
                <article
                  key={produto.id}
                  className="group min-w-0 lg:flex lg:flex-col"
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#f5f2ef] lg:min-h-[420px] lg:flex-1">
                    {produto.imagem ? (
                      <img
                        src={produto.imagem}
                        alt={produto.nome}
                        className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
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
                      className="absolute bottom-3 left-3 right-3 bg-black py-[13px] text-[9px] font-semibold uppercase tracking-[0.15em] text-white"
                    >
                      Adicionar à sacola
                    </button>
                  </div>

                  <div className="shrink-0">
                    <h3
                      className={`${playfair.className} mt-2 text-[15px] font-medium leading-[1.15] text-black sm:text-[18px] lg:text-[17px]`}
                    >
                      {produto.nome}
                    </h3>

                    <div className="mt-2 border-t border-[#eee7e2] pt-2">
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <span className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[#655c57]">
                          Preço normal
                        </span>

                        <span className="text-[12px] font-bold text-[#2e2825]">
                          {formatarPreco(
                            produto.preco_normal
                          )}
                        </span>
                      </div>

                      <div className="mt-1.5 bg-[#f3e3da] px-2.5 py-1.5">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[#9f654e]">
                          Preço Chic+
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
              ))}
            </div>
          )}

          <div className="mt-5 shrink-0 text-center">
            <a
              href="/produtos?categoria=novidades"
              className={`${cormorant.className} inline-flex items-center gap-5 bg-black px-8 py-3 text-[18px] font-semibold text-white transition hover:bg-[#a76f59]`}
            >
              Ver novidades
              <ElegantArrow />
            </a>
          </div>
        </div>
      </section>

      {/* =========================================================
          PROMOÇÃO
      ========================================================= */}

      <section
        id="promocoes"
        className="scroll-mt-0 grid bg-black lg:min-h-[100svh] lg:grid-cols-4"
      >
        <div className="flex flex-col justify-center bg-black px-7 py-14 text-white sm:px-10 lg:px-12">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#d6aa97]">
            Quanto mais, melhor
          </p>

          <h2
            className={`${playfair.className} mt-5 text-[40px] leading-[1.02] sm:text-[48px] lg:text-[50px] xl:text-[56px]`}
          >
            {tituloPromocao}
          </h2>

          <p className="mt-5 text-[14px] leading-7 text-white/85">
            Monte seu look fitness e esportivo completo.
          </p>

          <a
            href="/produtos"
            className={`${cormorant.className} mt-8 inline-flex w-fit items-center gap-6 rounded-full bg-white px-8 py-4 text-[21px] font-semibold text-black transition hover:bg-[#d7a58e] hover:text-white`}
          >
            Escolher minhas peças
            <ElegantArrow />
          </a>
        </div>

        {imagensPromocao.map((imagem) => (
          <div
            key={imagem}
            className="min-h-[350px] overflow-hidden lg:min-h-0"
          >
            <img
              src={imagem}
              alt="Dona Chic"
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </section>

      {/* =========================================================
          LIFESTYLE
      ========================================================= */}

      <section className="grid lg:min-h-[100svh] lg:grid-cols-2">
        <div className="relative min-h-[460px] overflow-hidden bg-black">
          <img
            src={imagemLifestyle}
            alt=""
            className="absolute inset-0 h-full w-full scale-110 object-cover opacity-45 blur-lg"
          />

          <img
            src={imagemLifestyle}
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
              Peças fitness e esportivas femininas que combinam com quem vive
              em movimento.
            </p>
          </div>
        </div>
      </section>

      {bannersEditoriais.length > 0 && (
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
                bannersEditoriais.length === 1
                  ? "grid-cols-1"
                  : bannersEditoriais.length === 2
                    ? "md:grid-cols-2"
                    : "md:grid-cols-2 lg:grid-cols-3"
              }`}
            >
              {bannersEditoriais.map(
                (imagem, indice) => (
                  <div
                    key={`${imagem}-${indice}`}
                    className="relative aspect-[16/9] overflow-hidden bg-black"
                  >
                    <img
                      src={imagem}
                      alt={`Destaque Dona Chic ${
                        indice + 1
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

      {/* =========================================================
          BENEFÍCIOS
      ========================================================= */}

      <section className="border-y border-[#e5ddd8] bg-white">
        <div className="grid w-full grid-cols-2 md:grid-cols-5">
          {beneficiosExibidos.map(
            (beneficio, index) => (
              <div
                key={
                  "id" in beneficio
                    ? beneficio.id
                    : `${beneficio.titulo}-${index}`
                }
                className="border-r border-[#e5ddd8] px-4 py-6 text-center sm:px-5 sm:py-7"
              >
                <p
                  className={`${playfair.className} text-[17px] leading-tight text-[#17120f] md:text-[20px]`}
                >
                  {beneficio.titulo}
                </p>

                <p className="mt-2 text-[11px] font-medium leading-5 text-[#8f7f77] md:text-[12px]">
                  {beneficio.descricao}
                </p>
              </div>
            )
          )}
        </div>
      </section>

      {/* =========================================================
          INSTAGRAM
      ========================================================= */}

      <section
        id="instagram"
        className="scroll-mt-0 bg-[#f7f3ee] px-4 pb-0 pt-12 sm:px-6 sm:pt-14"
      >
        <div className="text-center">
          {instagramUrl ? (
            <a
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[#c7a08e] underline-offset-4 hover:underline sm:text-[11px]"
            >
              {instagramUsuario}
            </a>
          ) : (
            <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[#c7a08e] sm:text-[11px]">
              {instagramUsuario}
            </p>
          )}

          <h2
            className={`${playfair.className} mt-4 text-[40px] leading-none text-[#17120f] sm:text-[48px] md:text-[54px]`}
          >
            {instagramTitulo}
          </h2>

          {instagramUrl && (
            <a
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-3 border-b border-[#b98973] pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7d5848]"
            >
              Visitar Instagram
              <SlimArrow />
            </a>
          )}
        </div>

        <div className="mt-10 grid grid-cols-2 md:grid-cols-4">
          {instagramImagens.map((imagem) => (
            <div
              key={imagem}
              className="aspect-square overflow-hidden"
            >
              <img
                src={imagem}
                alt="Instagram Dona Chic"
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================
          NEWSLETTER
      ========================================================= */}

      <section className="bg-[#e8d2c5] px-6 py-12 sm:px-8 sm:py-14">
        <div className="mx-auto flex max-w-[1450px] flex-col justify-between gap-10 md:flex-row md:items-center">
          <div className="max-w-[520px]">
            <h3
              className={`${playfair.className} text-[34px] leading-tight text-[#17120f] sm:text-[42px]`}
            >
              {newsletterTitulo}
            </h3>

            <p className="mt-3 text-[14px] leading-7 text-[#7d695f] sm:text-[16px]">
              {newsletterDescricao}
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
              {newsletterBotao}
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================
          RODAPÉ
      ========================================================= */}

      <footer className="bg-black px-6 py-16 text-white sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-[1450px] gap-12 md:grid-cols-4">
          <div>
            <img
              src="/logo-dona-chic.webp"
              alt="Dona Chic"
              className="h-[125px] w-[145px] object-contain"
            />

            <p className="mt-5 max-w-[220px] text-[14px] leading-6 text-white/70">
              {rodapeFrase}
            </p>
          </div>

          <div>
            <h4
              className={`${playfair.className} text-[28px] text-white`}
            >
              Dona Chic
            </h4>

            <div className="mt-5 space-y-3 text-[15px] text-white/72">
              <p>Sobre nós</p>
              <p>Contato</p>

              <a
                href="/admin"
                className="block"
              >
                Minha conta
              </a>
            </div>
          </div>

          <div>
            <h4
              className={`${playfair.className} text-[28px] text-white`}
            >
              Ajuda
            </h4>

            <div className="mt-5 space-y-3 text-[15px] text-white/72">
              <p>Entrega</p>
              <p>Trocas</p>
              <p>Pagamento</p>
              <p>Perguntas frequentes</p>
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
                  href={instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block hover:text-white"
                >
                  {instagramUsuario}
                </a>
              ) : (
                <p>{instagramUsuario}</p>
              )}

              <p>WhatsApp</p>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-14 max-w-[1450px] border-t border-white/10 pt-6 text-[11px] uppercase tracking-[0.2em] text-white/40">
          © 2026 Dona Chic · Todos os direitos reservados
        </div>
      </footer>

      {/* =========================================================
          WHATSAPP
      ========================================================= */}

      <a
        href="#"
        className="fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#25d366] font-bold text-white shadow-lg"
      >
        W
      </a>
    </main>
  );
}