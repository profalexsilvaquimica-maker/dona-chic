"use client";



import Link from "next/link";

import { useEffect, useMemo, useState } from "react";



import {

  alterarQuantidade,

  ItemCarrinho,

  lerCarrinho,

  limparCarrinho,

  quantidadeCarrinho,

  removerDoCarrinho,

} from "@/lib/carrinho";



import { supabase } from "@/lib/supabase";



type Variacao = {

  produto_id: string;

  tamanho: string;

  cor: string;

  estoque: number;

};



type ProdutoEstoque = {

  id: string;

  estoque: number;

  imagem: string | null;

  imagem_2: string | null;

  imagem_3: string | null;

};





type SacolaImageCarouselProps = {
  images: Array<string | null | undefined>;
  alt: string;
};

function SacolaImageCarousel({ images, alt }: SacolaImageCarouselProps) {
  const lista = images.filter(
    (imagem): imagem is string => Boolean(imagem)
  );

  const [indice, setIndice] = useState(0);
  const [toqueInicio, setToqueInicio] = useState<number | null>(null);

  useEffect(() => {
    setIndice(0);
  }, [images.join("|")]);

  if (lista.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center px-3 text-center text-xs text-[#6f625b]">
        Sem imagem
      </div>
    );
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
      className="relative h-full w-full"
      onTouchStart={(event) =>
        setToqueInicio(event.touches[0]?.clientX ?? null)
      }
      onTouchEnd={(event) => {
        if (toqueInicio === null || lista.length <= 1) {
          return;
        }

        const fim = event.changedTouches[0]?.clientX ?? toqueInicio;
        const diferenca = toqueInicio - fim;

        if (Math.abs(diferenca) >= 35) {
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
        className="h-full w-full object-cover object-top"
      />

      {lista.length > 1 && (
        <>
          <button
            type="button"
            onClick={anterior}
            aria-label="Foto anterior"
            className="absolute left-1 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[20px] leading-none text-black shadow"
          >
            {"\u2039"}
          </button>

          <button
            type="button"
            onClick={proxima}
            aria-label="Proxima foto"
            className="absolute right-1 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[20px] leading-none text-black shadow"
          >
            {"\u203A"}
          </button>

          <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/35 px-2 py-1.5">
            {lista.map((_, itemIndice) => (
              <button
                key={itemIndice}
                type="button"
                onClick={() => setIndice(itemIndice)}
                aria-label={`Ir para foto ${itemIndice + 1}`}
                className={`h-1.5 w-1.5 rounded-full border border-white ${
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


function formatarMoeda(valor: number) {

  return new Intl.NumberFormat("pt-BR", {

    style: "currency",

    currency: "BRL",

  }).format(valor);

}



export default function SacolaPage() {

  const [itens, setItens] = useState<ItemCarrinho[]>([]);

  const [carregado, setCarregado] = useState(false);



  const [variacoes, setVariacoes] = useState<Variacao[]>([]);

  const [produtosEstoque, setProdutosEstoque] = useState<

    ProdutoEstoque[]

  >([]);



  const [mensagem, setMensagem] = useState("");



  useEffect(() => {

    const carrinhoInicial = lerCarrinho();



    setItens(carrinhoInicial);



    carregarEstoques();



    setCarregado(true);



    const atualizarCarrinho = () => {

      setItens(lerCarrinho());

    };



    window.addEventListener(

      "dona-chic-carrinho-atualizado",

      atualizarCarrinho

    );



    window.addEventListener(

      "storage",

      atualizarCarrinho

    );



    return () => {

      window.removeEventListener(

        "dona-chic-carrinho-atualizado",

        atualizarCarrinho

      );



      window.removeEventListener(

        "storage",

        atualizarCarrinho

      );

    };

  }, []);



  async function carregarEstoques() {

    const [

      resultadoVariacoes,

      resultadoProdutos,

    ] = await Promise.all([

      supabase

        .from("produto_variacoes")

        .select(

          "produto_id,tamanho,cor,estoque"

        ),



      supabase

        .from("produtos")

        .select("id,estoque,imagem,imagem_2,imagem_3"),

    ]);



    if (!resultadoVariacoes.error) {

      setVariacoes(

        (

          resultadoVariacoes.data ?? []

        ).map((item) => ({

          produto_id: item.produto_id,

          tamanho: item.tamanho ?? "",

          cor: item.cor ?? "",

          estoque: Number(

            item.estoque ?? 0

          ),

        }))

      );

    }



    if (!resultadoProdutos.error) {

      setProdutosEstoque(

        (

          resultadoProdutos.data ?? []

        ).map((item) => ({

          id: item.id,

          estoque: Number(

            item.estoque ?? 0

          ),

          imagem: item.imagem ?? null,

          imagem_2: item.imagem_2 ?? null,

          imagem_3: item.imagem_3 ?? null,

        }))

      );

    }

  }



  function mostrarMensagem(texto: string) {

    setMensagem(texto);



    window.setTimeout(() => {

      setMensagem("");

    }, 3000);

  }



  function estoqueDisponivel(

    item: ItemCarrinho

  ) {

    const variacoesProduto =

      variacoes.filter(

        (variacao) =>

          variacao.produto_id ===

          item.id

      );



    if (variacoesProduto.length > 0) {

      const variacao =

        variacoesProduto.find(

          (registro) =>

            (registro.tamanho ||

              "") ===

              (item.tamanho ||

                "") &&

            (registro.cor || "") ===

              (item.cor || "")

        );



      return Number(

        variacao?.estoque ?? 0

      );

    }



    const produto =

      produtosEstoque.find(

        (produto) =>

          produto.id === item.id

      );



    return Number(

      produto?.estoque ?? 0

    );

  }



  const quantidadeTotal = useMemo(

    () => quantidadeCarrinho(itens),

    [itens]

  );



  const chicAtivo =

    quantidadeTotal >= 4;



  const subtotalNormal = useMemo(

    () =>

      itens.reduce(

        (total, item) =>

          total +

          Number(

            item.preco_normal || 0

          ) *

            item.quantidade,

        0

      ),

    [itens]

  );



  const subtotal = useMemo(

    () =>

      itens.reduce(

        (total, item) => {

          const precoNormal =

            Number(

              item.preco_normal || 0

            );



          const precoChic =

            Number(

              item.preco_chic || 0

            );



          const precoAplicado =

            chicAtivo &&

            precoChic > 0

              ? precoChic

              : precoNormal;



          return (

            total +

            precoAplicado *

              item.quantidade

          );

        },

        0

      ),

    [itens, chicAtivo]

  );



  const economiaChic =

    chicAtivo

      ? Math.max(

          0,

          subtotalNormal -

            subtotal

        )

      : 0;



  function diminuirQuantidade(

    item: ItemCarrinho

  ) {

    const novaQuantidade =

      item.quantidade - 1;



    const atualizado =

      alterarQuantidade(

        item.id,

        novaQuantidade,

        item.tamanho,

        item.cor

      );



    setItens(atualizado);

  }



  function aumentarQuantidade(

    item: ItemCarrinho

  ) {

    const estoque =

      estoqueDisponivel(item);



    if (

      item.quantidade >= estoque

    ) {

      mostrarMensagem(

        estoque === 1

          ? "Existe apenas 1 unidade disponível dessa combinação."

          : `Existem apenas ${estoque} unidades disponíveis dessa combinação.`

      );



      return;

    }



    const novaQuantidade =

      item.quantidade + 1;



    const atualizado =

      alterarQuantidade(

        item.id,

        novaQuantidade,

        item.tamanho,

        item.cor

      );



    setItens(atualizado);

  }



  function removerItem(

    item: ItemCarrinho

  ) {

    const atualizado =

      removerDoCarrinho(

        item.id,

        item.tamanho,

        item.cor

      );



    setItens(atualizado);

  }



  function esvaziarSacola() {

    const confirmar =

      window.confirm(

        "Deseja realmente remover todos os produtos da sacola?"

      );



    if (!confirmar) {

      return;

    }



    setItens(

      limparCarrinho()

    );

  }



  function finalizarCompraWhatsApp() {

    const linhasProdutos = itens.map(

      (item, index) => {

        const precoNormal = Number(

          item.preco_normal || 0

        );



        const precoChic = Number(

          item.preco_chic || 0

        );



        const precoUnitario =

          chicAtivo &&

          precoChic > 0

            ? precoChic

            : precoNormal;



        const detalhes = [

          item.tamanho

            ? `Tamanho: ${item.tamanho}`

            : "",

          item.cor

            ? `Cor: ${item.cor}`

            : "",

        ]

          .filter(Boolean)

          .join(" | ");



        return [

          `${index + 1}. ${item.nome}`,

          detalhes,

          `Quantidade: ${item.quantidade}`,

          `Valor unitário: ${formatarMoeda(

            precoUnitario

          )}`,

          `Subtotal: ${formatarMoeda(

            precoUnitario *

              item.quantidade

          )}`,

        ]

          .filter(Boolean)

          .join("\n");

      }

    );



    const mensagemWhatsApp = [

      "Olá, Dona Chic! Gostaria de finalizar esta compra:",

      "",

      ...linhasProdutos.flatMap(

        (linha) => [linha, ""]

      ),

      `Total de peças: ${quantidadeTotal}`,

      chicAtivo

        ? "Preço Chic+ aplicado."

        : "Preço normal aplicado.",

      economiaChic > 0

        ? `Economia Chic+: ${formatarMoeda(

            economiaChic

          )}`

        : "",

      `Total da compra: ${formatarMoeda(

        subtotal

      )}`,

      "",

      "Frete não incluído.",

    ]

      .filter(Boolean)

      .join("\n");



    const url = `https://wa.me/5591980660825?text=${encodeURIComponent(

      mensagemWhatsApp

    )}`;



    window.open(

      url,

      "_blank",

      "noopener,noreferrer"

    );

  }



  if (!carregado) {

    return (

      <main className="min-h-screen bg-[#f8f5f1]">

        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">

          <p className="text-center text-sm text-[#746b65]">

            Carregando sua sacola...

          </p>

        </div>

      </main>

    );

  }



  return (

    <main className="min-h-screen bg-[#f8f5f1] text-[#1d1917]">

      {mensagem && (

        <div className="fixed right-5 top-5 z-[100] max-w-sm rounded-2xl bg-black px-5 py-4 text-sm text-white shadow-xl">

          {mensagem}

        </div>

      )}



      <div className="border-b border-[#e8e0da] bg-white">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">

          <Link

            href="/produtos"

            className="text-sm font-medium uppercase tracking-[0.18em] text-[#6f625b] transition hover:text-black"

          >

            ← Continuar comprando

          </Link>



          <div className="text-center">

            <h1 className="text-xl font-semibold tracking-[0.12em] sm:text-2xl">

              DONA CHIC

            </h1>

          </div>



          <div className="min-w-[130px] text-right text-sm text-[#6f625b]">

            {quantidadeTotal}{" "}

            {quantidadeTotal === 1

              ? "peça"

              : "peças"}

          </div>

        </div>

      </div>



      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        <div className="mb-8">

          <p className="mb-2 text-xs font-medium uppercase tracking-[0.22em] text-[#9a8980]">

            Sua seleção

          </p>



          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">

            Minha Sacola

          </h2>



          <p className="mt-2 text-sm text-[#766b65]">

            Confira seus produtos antes de finalizar a compra.

          </p>

        </div>



        {itens.length === 0 ? (

          <div className="rounded-3xl border border-[#e7ded8] bg-white px-6 py-20 text-center shadow-sm">

            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#f4efeb] text-2xl">

              ♡

            </div>



            <h3 className="text-2xl font-semibold">

              Sua sacola está vazia

            </h3>



            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#776d67]">

              Escolha seus produtos favoritos e adicione-os à sua sacola.

            </p>



            <Link

              href="/produtos"

              className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-black px-8 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#302b28]"

            >

              Ver produtos

            </Link>

          </div>

        ) : (

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">

            <section className="space-y-4">

              {itens.map(

                (item, index) => {

                  const chave = [

                    item.id,

                    item.tamanho ||

                      "sem-tamanho",

                    item.cor ||

                      "sem-cor",

                    index,

                  ].join("-");



                  const precoNormalItem =

                    Number(

                      item.preco_normal ||

                        0

                    );



                  const precoChicItem =

                    Number(

                      item.preco_chic ||

                        0

                    );



                  const precoUnitarioItem =

                    chicAtivo &&

                    precoChicItem > 0

                      ? precoChicItem

                      : precoNormalItem;



                  const totalItem =

                    precoUnitarioItem *

                    item.quantidade;



                  const estoque =

                    estoqueDisponivel(

                      item

                    );



                  const atingiuLimite =

                    estoque > 0 &&

                    item.quantidade >=

                      estoque;



                  const semEstoque =

                    estoque <= 0;

                  const produtoFotos =
                    produtosEstoque.find(
                      (produto) => produto.id === item.id
                    );

                  const imagensProduto = [
                    produtoFotos?.imagem || item.imagem,
                    produtoFotos?.imagem_2,
                    produtoFotos?.imagem_3,
                  ];



                  return (

                    <article

                      key={chave}

                      className="overflow-hidden rounded-3xl border border-[#e7ded8] bg-white shadow-sm"

                    >

                      <div className="flex gap-4 p-4 sm:gap-6 sm:p-6">

                        <div className="h-32 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-[#f1ece8] sm:h-40 sm:w-32">

                          <SacolaImageCarousel images={imagensProduto} alt={item.nome} />

                        </div>



                        <div className="flex min-w-0 flex-1 flex-col">

                          <div className="flex items-start justify-between gap-3">

                            <div>

                              <h3 className="text-base font-semibold sm:text-lg">

                                {

                                  item.nome

                                }

                              </h3>



                              {(item.tamanho ||

                                item.cor) && (

                                <div className="mt-2 flex flex-wrap gap-2">

                                  {item.tamanho && (

                                    <span className="rounded-full bg-[#f4efeb] px-3 py-1 text-xs text-[#6d625c]">

                                      Tamanho:{" "}

                                      {

                                        item.tamanho

                                      }

                                    </span>

                                  )}



                                  {item.cor && (

                                    <span className="rounded-full bg-[#f4efeb] px-3 py-1 text-xs text-[#6d625c]">

                                      Cor:{" "}

                                      {

                                        item.cor

                                      }

                                    </span>

                                  )}

                                </div>

                              )}



                              {!semEstoque && (

                                <p className="mt-3 text-[11px] text-[#6f786d]">

                                  {estoque ===

                                  1

                                    ? "1 unidade disponível"

                                    : `${estoque} unidades disponíveis`}

                                </p>

                              )}



                              {semEstoque && (

                                <p className="mt-3 text-[11px] font-semibold text-[#a34c3e]">

                                  Esta combinação está sem estoque.

                                </p>

                              )}

                            </div>



                            <button

                              type="button"

                              onClick={() =>

                                removerItem(

                                  item

                                )

                              }

                              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-[#e7ded8] text-lg text-[#756a64] transition hover:border-black hover:text-black"

                              aria-label={`Remover ${item.nome}`}

                            >

                              ×

                            </button>

                          </div>



                          <div className="mt-auto flex flex-col gap-4 pt-5 sm:flex-row sm:items-end sm:justify-between">

                            <div>

                              <p className="mb-2 text-xs uppercase tracking-[0.16em] text-[#93857d]">

                                Quantidade

                              </p>



                              <div className="inline-flex items-center overflow-hidden rounded-full border border-[#ddd3cd] bg-white">

                                <button

                                  type="button"

                                  onClick={() =>

                                    diminuirQuantidade(

                                      item

                                    )

                                  }

                                  className="flex h-10 w-10 items-center justify-center text-lg transition hover:bg-[#f4efeb]"

                                  aria-label="Diminuir quantidade"

                                >

                                  −

                                </button>



                                <span className="min-w-10 text-center text-sm font-medium">

                                  {

                                    item.quantidade

                                  }

                                </span>



                                <button

                                  type="button"

                                  disabled={

                                    atingiuLimite ||

                                    semEstoque

                                  }

                                  onClick={() =>

                                    aumentarQuantidade(

                                      item

                                    )

                                  }

                                  className={`flex h-10 w-10 items-center justify-center text-lg transition ${

                                    atingiuLimite ||

                                    semEstoque

                                      ? "cursor-not-allowed bg-[#f2eeeb] text-[#b6aca6]"

                                      : "hover:bg-[#f4efeb]"

                                  }`}

                                  aria-label="Aumentar quantidade"

                                >

                                  +

                                </button>

                              </div>



                              {atingiuLimite && (

                                <p className="mt-2 text-[10px] text-[#a06a55]">

                                  Limite do estoque atingido.

                                </p>

                              )}

                            </div>



                            <div className="sm:text-right">

                              <p className="text-xs text-[#93857d]">

                                {chicAtivo &&

                                precoChicItem > 0

                                  ? "Preço Chic+ aplicado"

                                  : item.quantidade >

                                    1

                                  ? `${item.quantidade} × ${formatarMoeda(

                                      precoUnitarioItem

                                    )}`

                                  : "Preço"}

                              </p>



                              {chicAtivo &&

                                precoChicItem >

                                  0 && (

                                  <p className="mt-1 text-[11px] text-[#9b8f88] line-through">

                                    {formatarMoeda(

                                      precoNormalItem *

                                        item.quantidade

                                    )}

                                  </p>

                                )}



                              <p className="mt-1 text-lg font-semibold">

                                {formatarMoeda(

                                  totalItem

                                )}

                              </p>



                              {chicAtivo &&

                                precoChicItem >

                                  0 &&

                                item.quantidade >

                                  1 && (

                                  <p className="mt-1 text-[10px] text-[#a06a55]">

                                    {item.quantidade} ×{" "}

                                    {formatarMoeda(

                                      precoUnitarioItem

                                    )}

                                  </p>

                                )}

                            </div>

                          </div>

                        </div>

                      </div>

                    </article>

                  );

                }

              )}



              <button

                type="button"

                onClick={

                  esvaziarSacola

                }

                className="px-2 py-2 text-sm text-[#7d6f67] underline underline-offset-4 transition hover:text-black"

              >

                Esvaziar sacola

              </button>

            </section>



            <aside>

              <div className="sticky top-6 rounded-3xl border border-[#e7ded8] bg-white p-6 shadow-sm sm:p-7">

                <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#96877f]">

                  Resumo do pedido

                </p>



                <div className="mt-6 space-y-4">

                  <div className="flex items-center justify-between gap-4 text-sm">

                    <span className="text-[#716761]">

                      Produtos

                    </span>



                    <span className="font-medium">

                      {

                        quantidadeTotal

                      }

                    </span>

                  </div>



                  <div className="flex items-center justify-between gap-4 text-sm">

                    <span className="text-[#716761]">

                      Subtotal

                    </span>



                    <span className="font-medium">

                      {formatarMoeda(

                        subtotal

                      )}

                    </span>

                  </div>



                  {chicAtivo &&

                    economiaChic >

                      0 && (

                      <div className="flex items-center justify-between gap-4 text-sm">

                        <span className="font-medium text-[#a06a55]">

                          Economia Chic+

                        </span>



                        <span className="font-semibold text-[#a06a55]">

                          -{" "}

                          {formatarMoeda(

                            economiaChic

                          )}

                        </span>

                      </div>

                    )}



                  <div className="flex items-center justify-between gap-4 text-sm">

                    <span className="text-[#716761]">

                      Entrega

                    </span>



                    <span className="text-xs text-[#93857d]">

                      Calculada depois

                    </span>

                  </div>

                </div>



                <div className="my-6 border-t border-[#e8e0da]" />



                <div className="flex items-end justify-between gap-4">

                  <span className="font-medium">

                    Total

                  </span>



                  <div className="text-right">

                    <p className="text-2xl font-semibold">

                      {formatarMoeda(

                        subtotal

                      )}

                    </p>



                    <p className="mt-1 text-[11px] text-[#9b8f88]">

                      Frete não incluído

                    </p>

                  </div>

                </div>



                <button

                  type="button"

                  onClick={

                    finalizarCompraWhatsApp

                  }

                  className="mt-7 flex min-h-13 w-full items-center justify-center rounded-full bg-black px-6 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#302b28]"

                >

                  Finalizar compra

                </button>



                <p className="mt-4 text-center text-xs leading-5 text-[#968b85]">

                  Ao finalizar, sua sacola será enviada para o WhatsApp da Dona Chic.

                </p>



                <div className="mt-6 rounded-2xl bg-[#f7f2ee] p-4">

                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#85756d]">

                    Chic+

                  </p>



                  <p className="mt-2 text-xs leading-5 text-[#766a64]">

                    {chicAtivo

                      ? economiaChic > 0

                        ? `Preço Chic+ aplicado nas ${quantidadeTotal} peças. Você está economizando ${formatarMoeda(

                            economiaChic

                          )}.`

                        : `Condição Chic+ ativada para ${quantidadeTotal} peças.`

                      : `Adicione mais ${4 - quantidadeTotal} ${

                          4 -

                            quantidadeTotal ===

                          1

                            ? "peça"

                            : "peças"

                        } para ativar o Preço Chic+ em toda a sacola.`}

                  </p>

                </div>

              </div>

            </aside>

          </div>

        )}

      </div>

    </main>

  );

}