"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { supabase } from "../../../lib/supabase";

type Produto = {
  id: string;
  nome: string;
  categoria: string;
  imagem: string | null;
  tamanhos: string[];
  cores: string[];
  estoque: number;
  ativo: boolean;
};

type Variacao = {
  id?: string;
  produto_id: string;
  tamanho: string;
  cor: string;
  estoque: number;
};

function montarChave(
  produtoId: string,
  tamanho: string,
  cor: string
) {
  return `${produtoId}|||${tamanho}|||${cor}`;
}

export default function EstoqueAdminPage() {
  const [carregando, setCarregando] =
    useState(true);

  const [autorizado, setAutorizado] =
    useState(false);

  const [produtos, setProdutos] =
    useState<Produto[]>([]);

  const [variacoes, setVariacoes] =
    useState<Record<string, number>>({});

  const [busca, setBusca] =
    useState("");

  const [salvandoProduto, setSalvandoProduto] =
    useState<string | null>(null);

  const [mensagem, setMensagem] =
    useState("");

  const [erro, setErro] =
    useState("");

  useEffect(() => {
    iniciar();
  }, []);

  async function iniciar() {
    setCarregando(true);
    setErro("");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      setAutorizado(false);
      setCarregando(false);
      return;
    }

    const { data: admin } = await supabase
      .from("admins")
      .select("user_id")
      .eq(
        "user_id",
        session.user.id
      )
      .maybeSingle();

    if (!admin) {
      setAutorizado(false);
      setCarregando(false);
      return;
    }

    setAutorizado(true);

    await carregarDados();

    setCarregando(false);
  }

  async function carregarDados() {
    const [
      resultadoProdutos,
      resultadoVariacoes,
    ] = await Promise.all([
      supabase
        .from("produtos")
        .select(
          "id,nome,categoria,imagem,tamanhos,cores,estoque,ativo"
        )
        .order("nome", {
          ascending: true,
        }),

      supabase
        .from("produto_variacoes")
        .select(
          "id,produto_id,tamanho,cor,estoque"
        ),
    ]);

    if (resultadoProdutos.error) {
      setErro(
        "Não foi possível carregar os produtos."
      );
      return;
    }

    if (resultadoVariacoes.error) {
      setErro(
        "Não foi possível carregar o estoque por tamanho e cor."
      );
      return;
    }

    const listaProdutos =
      (
        resultadoProdutos.data ??
        []
      ).map((produto) => ({
        ...produto,

        estoque: Number(
          produto.estoque ?? 0
        ),

        tamanhos:
          produto.tamanhos ?? [],

        cores:
          produto.cores ?? [],
      }));

    const mapa: Record<
      string,
      number
    > = {};

    for (
      const variacao of
      resultadoVariacoes.data ?? []
    ) {
      const chave = montarChave(
        variacao.produto_id,
        variacao.tamanho ?? "",
        variacao.cor ?? ""
      );

      mapa[chave] = Number(
        variacao.estoque ?? 0
      );
    }

    setProdutos(listaProdutos);
    setVariacoes(mapa);
  }

  function mostrarMensagem(
    texto: string
  ) {
    setMensagem(texto);

    window.setTimeout(() => {
      setMensagem("");
    }, 3000);
  }

  function alterarEstoque(
    produtoId: string,
    tamanho: string,
    cor: string,
    valor: string
  ) {
    const somenteNumeros =
      valor.replace(/\D/g, "");

    const numero =
      somenteNumeros === ""
        ? 0
        : Number(somenteNumeros);

    const chave = montarChave(
      produtoId,
      tamanho,
      cor
    );

    setVariacoes((atual) => ({
      ...atual,
      [chave]: numero,
    }));
  }

  function combinacoesProduto(
    produto: Produto
  ) {
    const tamanhos =
      produto.tamanhos.length > 0
        ? produto.tamanhos
        : [""];

    const cores =
      produto.cores.length > 0
        ? produto.cores
        : [""];

    const combinacoes: {
      tamanho: string;
      cor: string;
    }[] = [];

    for (const tamanho of tamanhos) {
      for (const cor of cores) {
        combinacoes.push({
          tamanho,
          cor,
        });
      }
    }

    return combinacoes;
  }

  function totalProduto(
    produto: Produto
  ) {
    const combinacoes =
      combinacoesProduto(produto);

    return combinacoes.reduce(
      (total, item) => {
        const chave =
          montarChave(
            produto.id,
            item.tamanho,
            item.cor
          );

        return (
          total +
          Number(
            variacoes[chave] ??
              0
          )
        );
      },
      0
    );
  }

  async function salvarEstoque(
    produto: Produto
  ) {
    setSalvandoProduto(
      produto.id
    );

    const combinacoes =
      combinacoesProduto(produto);

    const registros =
      combinacoes.map(
        (item) => {
          const chave =
            montarChave(
              produto.id,
              item.tamanho,
              item.cor
            );

          return {
            produto_id:
              produto.id,

            tamanho:
              item.tamanho,

            cor:
              item.cor,

            estoque:
              Number(
                variacoes[
                  chave
                ] ?? 0
              ),

            updated_at:
              new Date().toISOString(),
          };
        }
      );

    const { error } =
      await supabase
        .from(
          "produto_variacoes"
        )
        .upsert(
          registros,
          {
            onConflict:
              "produto_id,tamanho,cor",
          }
        );

    if (error) {
      console.error(error);

      mostrarMensagem(
        `Erro ao salvar estoque: ${error.message}`
      );

      setSalvandoProduto(
        null
      );

      return;
    }

    const total =
      registros.reduce(
        (soma, item) =>
          soma +
          Number(
            item.estoque
          ),
        0
      );

    const {
      error:
        erroProduto,
    } = await supabase
      .from("produtos")
      .update({
        estoque: total,
        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        produto.id
      );

    if (erroProduto) {
      console.error(
        erroProduto
      );

      mostrarMensagem(
        "As variações foram salvas, mas não foi possível atualizar o estoque total do produto."
      );

      setSalvandoProduto(
        null
      );

      return;
    }

    setProdutos(
      (atuais) =>
        atuais.map(
          (item) =>
            item.id ===
            produto.id
              ? {
                  ...item,
                  estoque:
                    total,
                }
              : item
        )
    );

    mostrarMensagem(
      `Estoque de "${produto.nome}" atualizado.`
    );

    setSalvandoProduto(
      null
    );
  }

  const produtosFiltrados =
    useMemo(() => {
      const termo =
        busca
          .trim()
          .toLowerCase();

      if (!termo) {
        return produtos;
      }

      return produtos.filter(
        (produto) =>
          produto.nome
            .toLowerCase()
            .includes(
              termo
            ) ||
          produto.categoria
            .toLowerCase()
            .includes(
              termo
            )
      );
    }, [
      produtos,
      busca,
    ]);

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f3f0]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#d4ccc7] border-t-black" />

          <p className="mt-4 text-xs uppercase tracking-[0.18em] text-[#786e68]">
            Carregando estoque
          </p>
        </div>
      </main>
    );
  }

  if (!autorizado) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f3f0] px-5">
        <div className="w-full max-w-md rounded-3xl border border-[#e4dcd6] bg-white p-8 text-center">
          <h1 className="text-2xl font-semibold">
            Acesso restrito
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#756a64]">
            Entre no painel administrativo antes de acessar o controle de estoque.
          </p>

          <Link
            href="/admin"
            className="mt-7 inline-flex rounded-full bg-black px-7 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white"
          >
            Ir para o administrativo
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f3f0] text-[#1c1714]">
      {mensagem && (
        <div className="fixed right-5 top-5 z-[100] max-w-sm rounded-2xl bg-black px-5 py-4 text-sm text-white shadow-xl">
          {mensagem}
        </div>
      )}

      <header className="border-b border-[#e4dcd6] bg-white">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#a67b68]">
              Dona Chic
            </p>

            <h1 className="mt-1 text-2xl font-semibold">
              Estoque por Tamanho e Cor
            </h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin"
              className="rounded-full border border-[#d9d0ca] bg-white px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] transition hover:border-black"
            >
              ← Painel administrativo
            </Link>

            <Link
              href="/produtos"
              target="_blank"
              className="rounded-full bg-black px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-white"
            >
              Ver loja
            </Link>
          </div>
        </div>
      </header>

      <section className="border-b border-[#e4dcd6] bg-[#fbf9f7]">
        <div className="mx-auto max-w-[1500px] px-5 py-6 sm:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                Controle de estoque
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#766b65]">
                Informe quantas unidades existem de cada combinação de tamanho e cor.
                Essas quantidades são exclusivas do administrativo.
              </p>
            </div>

            <div className="w-full lg:w-[360px]">
              <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.15em] text-[#83766f]">
                Buscar produto
              </label>

              <input
                value={busca}
                onChange={(event) =>
                  setBusca(
                    event.target.value
                  )
                }
                placeholder="Nome ou categoria"
                className="h-12 w-full rounded-xl border border-[#dcd3cd] bg-white px-4 text-sm outline-none transition focus:border-black"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8">
        {erro && (
          <div className="mb-6 rounded-2xl border border-[#e5bdb4] bg-[#fff5f2] px-5 py-4 text-sm text-[#994b3c]">
            {erro}
          </div>
        )}

        <div className="mb-6 flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.14em] text-[#81756e]">
            {produtosFiltrados.length}{" "}
            {produtosFiltrados.length ===
            1
              ? "produto"
              : "produtos"}
          </p>
        </div>

        <div className="space-y-6">
          {produtosFiltrados.map(
            (produto) => {
              const combinacoes =
                combinacoesProduto(
                  produto
                );

              const total =
                totalProduto(
                  produto
                );

              return (
                <article
                  key={
                    produto.id
                  }
                  className="overflow-hidden rounded-3xl border border-[#e1d8d2] bg-white shadow-sm"
                >
                  <div className="flex flex-col gap-5 border-b border-[#e8e1dc] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div className="flex items-center gap-4">
                      <div className="h-20 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-[#eee9e5]">
                        {produto.imagem ? (
                          <img
                            src={
                              produto.imagem
                            }
                            alt={
                              produto.nome
                            }
                            className="h-full w-full object-cover object-top"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[9px] text-[#998d86]">
                            Sem foto
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#a27865]">
                          {
                            produto.categoria
                          }
                        </p>

                        <h3 className="mt-1 text-lg font-semibold">
                          {
                            produto.nome
                          }
                        </h3>

                        <p className="mt-1 text-xs text-[#847872]">
                          Estoque total atual:{" "}
                          <strong className="text-black">
                            {total}
                          </strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.1em] ${
                          produto.ativo
                            ? "bg-[#edf6ef] text-[#477052]"
                            : "bg-[#f2eeee] text-[#866e6e]"
                        }`}
                      >
                        {produto.ativo
                          ? "Ativo"
                          : "Inativo"}
                      </span>

                      <button
                        type="button"
                        disabled={
                          salvandoProduto ===
                          produto.id
                        }
                        onClick={() =>
                          salvarEstoque(
                            produto
                          )
                        }
                        className="rounded-full bg-black px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {salvandoProduto ===
                        produto.id
                          ? "Salvando..."
                          : "Salvar estoque"}
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[650px] border-collapse">
                      <thead>
                        <tr className="bg-[#faf8f6] text-left">
                          <th className="border-b border-[#e8e1dc] px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.15em] text-[#7e716a]">
                            Cor
                          </th>

                          <th className="border-b border-[#e8e1dc] px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.15em] text-[#7e716a]">
                            Tamanho
                          </th>

                          <th className="border-b border-[#e8e1dc] px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.15em] text-[#7e716a]">
                            Quantidade
                          </th>

                          <th className="border-b border-[#e8e1dc] px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.15em] text-[#7e716a]">
                            Situação
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {combinacoes.map(
                          (
                            combinacao,
                            indice
                          ) => {
                            const chave =
                              montarChave(
                                produto.id,
                                combinacao.tamanho,
                                combinacao.cor
                              );

                            const quantidade =
                              Number(
                                variacoes[
                                  chave
                                ] ?? 0
                              );

                            return (
                              <tr
                                key={`${chave}-${indice}`}
                                className="border-b border-[#eee8e4] last:border-b-0"
                              >
                                <td className="px-6 py-4 text-sm">
                                  {combinacao.cor ||
                                    "Única"}
                                </td>

                                <td className="px-6 py-4 text-sm">
                                  {combinacao.tamanho ||
                                    "Único"}
                                </td>

                                <td className="px-6 py-4">
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    value={
                                      quantidade
                                    }
                                    onChange={(
                                      event
                                    ) =>
                                      alterarEstoque(
                                        produto.id,
                                        combinacao.tamanho,
                                        combinacao.cor,
                                        event
                                          .target
                                          .value
                                      )
                                    }
                                    className="h-11 w-28 rounded-xl border border-[#d9d0ca] bg-white px-4 text-center text-sm font-semibold outline-none transition focus:border-black"
                                  />
                                </td>

                                <td className="px-6 py-4">
                                  {quantidade >
                                  0 ? (
                                    <span className="rounded-full bg-[#edf6ef] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-[#477052]">
                                      Em estoque
                                    </span>
                                  ) : (
                                    <span className="rounded-full bg-[#fff0ed] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-[#a55040]">
                                      Sem estoque
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          }
                        )}
                      </tbody>
                    </table>
                  </div>
                </article>
              );
            }
          )}
        </div>

        {produtosFiltrados.length ===
          0 && (
          <div className="rounded-3xl border border-[#e1d8d2] bg-white px-6 py-16 text-center">
            <h3 className="text-xl font-semibold">
              Nenhum produto encontrado
            </h3>

            <p className="mt-2 text-sm text-[#81756e]">
              Tente pesquisar por outro nome ou categoria.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}