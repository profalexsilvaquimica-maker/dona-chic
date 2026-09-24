"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Montserrat,
  Playfair_Display,
  Cormorant_Garamond,
} from "next/font/google";
import { supabase } from "../../lib/supabase";

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
    <svg width="23" height="12" viewBox="0 0 23 12" fill="none">
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

function formatarPreco(valor: number) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  const [categoriaAtiva, setCategoriaAtiva] = useState("todos");
  const [busca, setBusca] = useState("");

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const categoria = params.get("categoria");

    if (categoria) {
      setCategoriaAtiva(categoria);
    }

    carregarDados();
  }, []);

  async function carregarDados() {
    setCarregando(true);
    setErro("");

    const [resultadoProdutos, resultadoCategorias] = await Promise.all([
      supabase
        .from("produtos")
        .select("*")
        .eq("ativo", true)
        .order("ordem", { ascending: true })
        .order("created_at", { ascending: false }),

      supabase
        .from("categorias")
        .select("*")
        .eq("ativo", true)
        .order("ordem", { ascending: true }),
    ]);

    if (resultadoProdutos.error) {
      console.error(resultadoProdutos.error);
      setErro("Não foi possível carregar os produtos.");
    }

    if (resultadoCategorias.error) {
      console.error(resultadoCategorias.error);
      setErro("Não foi possível carregar as categorias.");
    }

    const listaProdutos = (resultadoProdutos.data ?? []).map((produto) => ({
      ...produto,
      preco_normal: Number(produto.preco_normal ?? 0),
      preco_chic: Number(produto.preco_chic ?? 0),
      estoque: Number(produto.estoque ?? 0),
      ordem: Number(produto.ordem ?? 0),
      tamanhos: produto.tamanhos ?? [],
      cores: produto.cores ?? [],
    }));

    setProdutos(listaProdutos);
    setCategorias(resultadoCategorias.data ?? []);

    setCarregando(false);
  }

  function selecionarCategoria(slug: string) {
    setCategoriaAtiva(slug);

    const url =
      slug === "todos"
        ? "/produtos"
        : `/produtos?categoria=${encodeURIComponent(slug)}`;

    window.history.replaceState({}, "", url);
  }

  const produtosFiltrados = useMemo(() => {
    let resultado = [...produtos];

    if (categoriaAtiva === "novidades") {
      resultado = resultado.filter((produto) => produto.novidade);
    } else if (categoriaAtiva !== "todos") {
      const categoriaSelecionada = categorias.find(
        (categoria) => categoria.slug === categoriaAtiva
      );

      if (categoriaSelecionada) {
        resultado = resultado.filter(
          (produto) => produto.categoria === categoriaSelecionada.nome
        );
      }
    }

    const termo = busca.trim().toLowerCase();

    if (termo) {
      resultado = resultado.filter((produto) => {
        const nome = produto.nome.toLowerCase();
        const categoria = produto.categoria.toLowerCase();
        const descricao = (produto.descricao ?? "").toLowerCase();

        return (
          nome.includes(termo) ||
          categoria.includes(termo) ||
          descricao.includes(termo)
        );
      });
    }

    return resultado;
  }, [produtos, categorias, categoriaAtiva, busca]);

  const tituloAtual = useMemo(() => {
    if (categoriaAtiva === "novidades") {
      return "Novidades";
    }

    if (categoriaAtiva === "todos") {
      return "Todos os produtos";
    }

    const categoria = categorias.find(
      (item) => item.slug === categoriaAtiva
    );

    return categoria?.nome ?? "Todos os produtos";
  }, [categoriaAtiva, categorias]);

  return (
    <main
      className={`${montserrat.className} min-h-screen bg-[#f5f1ed] text-[#181310]`}
    >
      {/* =========================================================
          TOPO
      ========================================================= */}

      <div className="bg-black px-5 py-2 text-center text-[9px] uppercase tracking-[0.24em] text-white">
        Dona Chic • Moda fitness & esportiva
      </div>

      {/* =========================================================
          CABEÇALHO
      ========================================================= */}

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

          <button className="flex items-center gap-2">
            <BagIcon />
            <span
              className={`${cormorant.className} hidden text-[20px] sm:inline`}
            >
              Sacola
            </span>
          </button>
        </div>
      </header>

      {/* =========================================================
          CABEÇALHO DA PÁGINA
      ========================================================= */}

      <section className="border-b border-[#e1d9d3] bg-[#f5f1ed] px-5 py-12 sm:px-8 lg:py-16">
        <div className="mx-auto max-w-[1500px]">
          <p className="text-[9px] uppercase tracking-[0.28em] text-[#b27a61]">
            Dona Chic
          </p>

          <div className="mt-3 flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
            <div>
              <h1
                className={`${playfair.className} text-[44px] leading-none sm:text-[58px] lg:text-[68px]`}
              >
                {tituloAtual}
              </h1>

              <p className="mt-4 max-w-[560px] text-[13px] leading-6 text-[#776b65]">
                Escolha suas peças favoritas e monte combinações para acompanhar
                seu ritmo dentro e fora do treino.
              </p>
            </div>

            <div className="relative w-full lg:w-[370px]">
              <SearchIcon />

              <input
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                placeholder="Buscar produto"
                className="absolute -top-[14px] left-0 h-[46px] w-full border-b border-[#857770] bg-transparent pl-8 pr-2 text-[14px] outline-none placeholder:text-[#94877f]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FILTROS
      ========================================================= */}

      <section className="sticky top-0 z-20 border-b border-[#e3dbd5] bg-[#faf8f5]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] gap-2 overflow-x-auto px-5 py-4 sm:px-8">
          <button
            type="button"
            onClick={() => selecionarCategoria("todos")}
            className={`whitespace-nowrap rounded-full border px-5 py-2.5 text-[9px] font-semibold uppercase tracking-[0.12em] transition ${
              categoriaAtiva === "todos"
                ? "border-black bg-black text-white"
                : "border-[#d3c9c2] bg-white text-[#675d58]"
            }`}
          >
            Todos
          </button>

          <button
            type="button"
            onClick={() => selecionarCategoria("novidades")}
            className={`whitespace-nowrap rounded-full border px-5 py-2.5 text-[9px] font-semibold uppercase tracking-[0.12em] transition ${
              categoriaAtiva === "novidades"
                ? "border-[#b7765c] bg-[#b7765c] text-white"
                : "border-[#d3c9c2] bg-white text-[#675d58]"
            }`}
          >
            Novidades
          </button>

          {categorias.map((categoria) => (
            <button
              key={categoria.id}
              type="button"
              onClick={() => selecionarCategoria(categoria.slug)}
              className={`whitespace-nowrap rounded-full border px-5 py-2.5 text-[9px] font-semibold uppercase tracking-[0.12em] transition ${
                categoriaAtiva === categoria.slug
                  ? "border-black bg-black text-white"
                  : "border-[#d3c9c2] bg-white text-[#675d58]"
              }`}
            >
              {categoria.nome}
            </button>
          ))}
        </div>
      </section>

      {/* =========================================================
          PRODUTOS
      ========================================================= */}

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

          {!carregando && erro && (
            <div className="border border-[#e0bcb2] bg-[#fff4f1] px-6 py-8 text-center text-[12px] text-[#984839]">
              {erro}
            </div>
          )}

          {!carregando && !erro && produtosFiltrados.length === 0 && (
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

          {!carregando && !erro && produtosFiltrados.length > 0 && (
            <>
              <div className="mb-7 flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-[0.17em] text-[#8b7f78]">
                  {produtosFiltrados.length}{" "}
                  {produtosFiltrados.length === 1
                    ? "produto"
                    : "produtos"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-5">
                {produtosFiltrados.map((produto) => (
                  <article key={produto.id} className="group min-w-0">
                    <div className="relative aspect-[3/4] overflow-hidden bg-[#ebe6e2]">
                      {produto.imagem ? (
                        <img
                          src={produto.imagem}
                          alt={produto.nome}
                          className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center px-5 text-center">
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
                        </div>
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
                        className="absolute bottom-3 left-3 right-3 bg-black py-3 text-[8px] font-semibold uppercase tracking-[0.14em] text-white"
                      >
                        Adicionar à sacola
                      </button>
                    </div>

                    <div className="pt-3">
                      <p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[#a67863]">
                        {produto.categoria}
                      </p>

                      <h2
                        className={`${playfair.className} mt-1 text-[17px] leading-tight sm:text-[20px]`}
                      >
                        {produto.nome}
                      </h2>

                      <div className="mt-3 border-t border-[#e4dcd6] pt-3">
                        <div className="flex flex-wrap items-baseline gap-2">
                          <span className="text-[8px] font-semibold uppercase tracking-[0.1em] text-[#776b65]">
                            Preço normal
                          </span>

                          <span className="text-[12px] font-semibold">
                            {formatarPreco(produto.preco_normal)}
                          </span>
                        </div>

                        <div className="mt-2 bg-[#f0ddd3] px-3 py-2">
                          <p className="text-[8px] font-semibold uppercase tracking-[0.1em] text-[#a05d45]">
                            Preço Chic+
                          </p>

                          <p
                            className={`${playfair.className} mt-0.5 text-[22px] font-bold leading-none text-[#8f513a]`}
                          >
                            {formatarPreco(produto.preco_chic)}
                          </p>
                        </div>

                        {produto.estoque > 0 ? (
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
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* =========================================================
          RODAPÉ
      ========================================================= */}

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
  );
}