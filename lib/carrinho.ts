export type ItemCarrinho = {
  id: string;
  nome: string;
  imagem: string | null;
  preco_normal: number;
  preco_chic: number;
  quantidade: number;

  // Já deixamos preparado para a próxima etapa.
  tamanho?: string;
  cor?: string;
};

const CHAVE_CARRINHO = "dona-chic-carrinho";

export function lerCarrinho(): ItemCarrinho[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const salvo = localStorage.getItem(CHAVE_CARRINHO);

    if (!salvo) {
      return [];
    }

    const dados = JSON.parse(salvo);

    if (!Array.isArray(dados)) {
      return [];
    }

    return dados;
  } catch {
    return [];
  }
}

export function salvarCarrinho(itens: ItemCarrinho[]) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    CHAVE_CARRINHO,
    JSON.stringify(itens)
  );

  window.dispatchEvent(
    new CustomEvent("dona-chic-carrinho-atualizado")
  );
}

export function adicionarAoCarrinho(
  novoItem: Omit<ItemCarrinho, "quantidade">,
  quantidade = 1
) {
  const carrinho = lerCarrinho();

  const indice = carrinho.findIndex(
    (item) =>
      item.id === novoItem.id &&
      (item.tamanho || "") === (novoItem.tamanho || "") &&
      (item.cor || "") === (novoItem.cor || "")
  );

  if (indice >= 0) {
    carrinho[indice] = {
      ...carrinho[indice],
      quantidade:
        carrinho[indice].quantidade + quantidade,
    };
  } else {
    carrinho.push({
      ...novoItem,
      quantidade,
    });
  }

  salvarCarrinho(carrinho);

  return carrinho;
}

export function removerDoCarrinho(
  id: string,
  tamanho?: string,
  cor?: string
) {
  const carrinho = lerCarrinho().filter(
    (item) =>
      !(
        item.id === id &&
        (item.tamanho || "") === (tamanho || "") &&
        (item.cor || "") === (cor || "")
      )
  );

  salvarCarrinho(carrinho);

  return carrinho;
}

export function alterarQuantidade(
  id: string,
  quantidade: number,
  tamanho?: string,
  cor?: string
) {
  const carrinho = lerCarrinho();

  const atualizado = carrinho
    .map((item) => {
      const mesmoItem =
        item.id === id &&
        (item.tamanho || "") === (tamanho || "") &&
        (item.cor || "") === (cor || "");

      if (!mesmoItem) {
        return item;
      }

      return {
        ...item,
        quantidade,
      };
    })
    .filter((item) => item.quantidade > 0);

  salvarCarrinho(atualizado);

  return atualizado;
}

export function limparCarrinho() {
  salvarCarrinho([]);

  return [];
}

export function quantidadeCarrinho(
  itens: ItemCarrinho[]
) {
  return itens.reduce(
    (total, item) => total + item.quantidade,
    0
  );
}

export function subtotalCarrinho(
  itens: ItemCarrinho[]
) {
  return itens.reduce(
    (total, item) =>
      total +
      Number(item.preco_normal || 0) *
        item.quantidade,
    0
  );
}

export function totalChicCarrinho(
  itens: ItemCarrinho[]
) {
  return itens.reduce(
    (total, item) =>
      total +
      Number(item.preco_chic || 0) *
        item.quantidade,
    0
  );
}