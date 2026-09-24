"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

type Secao =
  | "inicio"
  | "produtos"
  | "chic"
  | "estilo"
  | "textos"
  | "configuracoes";

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

type Configuracao = {
  id: string;
  chave: string;
  valor: string | null;
};

type MenuExtra = {
  id: string;
  label: string;
  href: string;
};

type Beneficio = {
  id: string;
  titulo: string;
  descricao: string | null;
  ordem: number;
  ativo: boolean;
};

type ProdutoFormulario = {
  id?: string;
  nome: string;
  slug: string;
  categoria: string;
  descricao: string;
  preco_normal: number;
  preco_chic: number;
  estoque: number;
  ativo: boolean;
  novidade: boolean;
  imagem: string;
  tamanhos: string;
  cores: string;
  ordem: number;
};

const produtoVazio: ProdutoFormulario = {
  nome: "",
  slug: "",
  categoria: "Conjuntos",
  descricao: "",
  preco_normal: 0,
  preco_chic: 0,
  estoque: 0,
  ativo: true,
  novidade: false,
  imagem: "",
  tamanhos: "P, M, G, GG",
  cores: "",
  ordem: 0,
};

function formatarPreco(valor: number) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function gerarSlug(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function HomeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[17px] w-[17px]"
      fill="none"
    >
      <path
        d="M3 10.8 12 3l9 7.8V21H14v-6h-4v6H3V10.8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[17px] w-[17px]"
      fill="none"
    >
      <path
        d="m4 7 8-4 8 4-8 4-8-4Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      <path
        d="M4 7v10l8 4 8-4V7"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      <path
        d="M12 11v10"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[17px] w-[17px]"
      fill="none"
    >
      <path
        d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[17px] w-[17px]"
      fill="none"
    >
      <path
        d="M4 20h4L19 9l-4-4L4 16v4Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      <path
        d="m13.5 6.5 4 4"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[17px] w-[17px]"
      fill="none"
    >
      <circle
        cx="12"
        cy="12"
        r="3"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      <path
        d="M19 13.5v-3l-2-.7a7 7 0 0 0-.7-1.7l.9-1.9-2.1-2.1-1.9.9a7 7 0 0 0-1.7-.7L10.5 2h-3l-.7 2a7 7 0 0 0-1.7.7l-1.9-.9L1.1 5.9 2 7.8a7 7 0 0 0-.7 1.7l-2 .7v3l2 .7a7 7 0 0 0 .7 1.7l-.9 1.9 2.1 2.1 1.9-.9a7 7 0 0 0 1.7.7l.7 2h3l.7-2a7 7 0 0 0 1.7-.7l1.9.9 2.1-2.1-.9-1.9a7 7 0 0 0 .7-1.7l2-.4Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}

function EyeIcon({
  aberto,
}: {
  aberto: boolean;
}) {
  if (aberto) {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
      >
        <path
          d="M3 3l18 18"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        <path
          d="M10.6 10.7a2 2 0 0 0 2.7 2.7"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        <path
          d="M9.9 4.3A9.8 9.8 0 0 1 12 4c5.8 0 9 8 9 8a16.3 16.3 0 0 1-2.7 4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        <path
          d="M6.2 6.2C4.1 8 3 12 3 12s3.2 8 9 8a9.5 9.5 0 0 0 4-.9"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
    >
      <path
        d="M3 12s3.2-8 9-8 9 8 9 8-3.2 8-9 8-9-8-9-8Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      <circle
        cx="12"
        cy="12"
        r="3"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export default function AdminPage() {
  const [carregandoInicial, setCarregandoInicial] = useState(true);
  const [autenticado, setAutenticado] = useState(false);
  const [administrador, setAdministrador] = useState(false);

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erroLogin, setErroLogin] = useState("");
  const [entrando, setEntrando] = useState(false);

  const [secao, setSecao] = useState<Secao>("inicio");

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [configuracoes, setConfiguracoes] = useState<Configuracao[]>([]);
  const [beneficios, setBeneficios] = useState<Beneficio[]>([]);

  const [busca, setBusca] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erroSistema, setErroSistema] = useState("");

  const [modalProduto, setModalProduto] = useState(false);
  const [salvandoProduto, setSalvandoProduto] = useState(false);

  const [produtoFormulario, setProdutoFormulario] =
    useState<ProdutoFormulario>(produtoVazio);

  const [heroTitulo, setHeroTitulo] = useState("");
  const [heroDescricao, setHeroDescricao] = useState("");
  const [heroBotao, setHeroBotao] = useState("");

  const [topoEsquerda, setTopoEsquerda] = useState("Fitness & Sport");
  const [topoCentro, setTopoCentro] = useState("Entrega para todo o Brasil");
  const [topoDireita, setTopoDireita] = useState("Compre pelo WhatsApp");

  const [menuNovidades, setMenuNovidades] = useState("Novidades");
  const [menuEstilo, setMenuEstilo] = useState("Encontre seu estilo");
  const [menuPromocao, setMenuPromocao] = useState("Compre +4 Peças");
  const [menuInstagram, setMenuInstagram] = useState("Instagram");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [menuExtras, setMenuExtras] = useState<MenuExtra[]>([]);

  const [tituloEstilo, setTituloEstilo] = useState("");
  const [tituloColecao, setTituloColecao] = useState("");
  const [tituloPromocao, setTituloPromocao] = useState("");

  const [instagramUsuario, setInstagramUsuario] = useState("");
  const [instagramTitulo, setInstagramTitulo] = useState("");

  const [newsletterTitulo, setNewsletterTitulo] = useState("");
  const [newsletterDescricao, setNewsletterDescricao] = useState("");
  const [newsletterBotao, setNewsletterBotao] = useState("");

  const [rodapeFrase, setRodapeFrase] = useState("");

  const [heroImagem, setHeroImagem] = useState("");

  const [bannersImagens, setBannersImagens] = useState<string[]>(
    Array.from(
      {
        length: 10,
      },
      () => ""
    )
  );

  const [instagramImagens, setInstagramImagens] = useState<string[]>(
    Array.from(
      {
        length: 4,
      },
      () => ""
    )
  );

  const [enviandoImagemProduto, setEnviandoImagemProduto] =
    useState(false);

  const [enviandoCategoriaId, setEnviandoCategoriaId] =
    useState<string | null>(null);

  const [enviandoHero, setEnviandoHero] =
    useState(false);

  const [enviandoBannerIndice, setEnviandoBannerIndice] =
    useState<number | null>(null);

  const [enviandoInstagramIndice, setEnviandoInstagramIndice] =
    useState<number | null>(null);

  useEffect(() => {
    verificarSessao();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      verificarSessao();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function verificarSessao() {
    setCarregandoInicial(true);
    setErroSistema("");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      setAutenticado(false);
      setAdministrador(false);
      setCarregandoInicial(false);
      return;
    }

    setAutenticado(true);

    const {
      data: admin,
      error,
    } = await supabase
      .from("admins")
      .select("user_id")
      .eq(
        "user_id",
        session.user.id
      )
      .maybeSingle();

    if (error || !admin) {
      setAdministrador(false);
      setCarregandoInicial(false);
      return;
    }

    setAdministrador(true);

    await carregarTudo();

    setCarregandoInicial(false);
  }

  async function carregarTudo() {
    await Promise.all([
      carregarProdutos(),
      carregarCategorias(),
      carregarConfiguracoes(),
      carregarBeneficios(),
    ]);
  }

  async function carregarProdutos() {
    const {
      data,
      error,
    } = await supabase
      .from("produtos")
      .select("*")
      .order(
        "ordem",
        {
          ascending: true,
        }
      )
      .order(
        "created_at",
        {
          ascending: false,
        }
      );

    if (error) {
      setErroSistema(
        "Não foi possível carregar os produtos."
      );

      return;
    }

    setProdutos(
      (data ?? []).map(
        (produto) => ({
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

          ordem: Number(
            produto.ordem ?? 0
          ),

          tamanhos:
            produto.tamanhos ?? [],

          cores:
            produto.cores ?? [],
        })
      )
    );
  }

  async function carregarCategorias() {
    const {
      data,
      error,
    } = await supabase
      .from("categorias")
      .select("*")
      .order(
        "ordem",
        {
          ascending: true,
        }
      );

    if (error) {
      setErroSistema(
        "Não foi possível carregar as categorias."
      );

      return;
    }

    setCategorias(data ?? []);
  }

  async function carregarConfiguracoes() {
    const {
      data,
      error,
    } = await supabase
      .from("configuracoes")
      .select("*");

    if (error) {
      setErroSistema(
        "Não foi possível carregar as configurações."
      );

      return;
    }

    const lista = data ?? [];

    setConfiguracoes(lista);

    const valor = (
      chave: string
    ) =>
      lista.find(
        (item) =>
          item.chave === chave
      )?.valor ?? "";

    setHeroTitulo(
      valor("hero_titulo")
    );

    setHeroDescricao(
      valor("hero_descricao")
    );

    setHeroBotao(
      valor("hero_botao")
    );

    setTopoEsquerda(
      valor("topo_esquerda") ||
        "Fitness & Sport"
    );

    setTopoCentro(
      valor("topo_centro") ||
        "Entrega para todo o Brasil"
    );

    setTopoDireita(
      valor("topo_direita") ||
        "Compre pelo WhatsApp"
    );

    setMenuNovidades(
      valor("menu_novidades") ||
        "Novidades"
    );

    setMenuEstilo(
      valor("menu_estilo") ||
        "Encontre seu estilo"
    );

    setMenuPromocao(
      valor("menu_promocao") ||
        "Compre +4 Peças"
    );

    setMenuInstagram(
      valor("menu_instagram") ||
        "Instagram"
    );

    setInstagramUrl(
      valor("instagram_url")
    );

    try {
      const extras = JSON.parse(
        valor(
          "menu_extras_json"
        ) || "[]"
      );

      setMenuExtras(
        Array.isArray(extras)
          ? extras
          : []
      );
    } catch {
      setMenuExtras([]);
    }

    setTituloEstilo(
      valor("titulo_estilo")
    );

    setTituloColecao(
      valor("titulo_colecao")
    );

    setTituloPromocao(
      valor("titulo_promocao")
    );

    setInstagramUsuario(
      valor("instagram_usuario")
    );

    setInstagramTitulo(
      valor("instagram_titulo")
    );

    setNewsletterTitulo(
      valor("newsletter_titulo")
    );

    setNewsletterDescricao(
      valor(
        "newsletter_descricao"
      )
    );

    setNewsletterBotao(
      valor("newsletter_botao")
    );

    setRodapeFrase(
      valor("rodape_frase")
    );

    setHeroImagem(
      valor("hero_imagem")
    );

    setBannersImagens(
      Array.from(
        {
          length: 10,
        },
        (_, indice) =>
          valor(
            `banner_${
              indice + 1
            }_imagem`
          )
      )
    );

    setInstagramImagens(
      Array.from(
        {
          length: 4,
        },
        (_, indice) =>
          valor(
            `instagram_imagem_${
              indice + 1
            }`
          )
      )
    );
  }

  async function carregarBeneficios() {
    const {
      data,
      error,
    } = await supabase
      .from("beneficios")
      .select("*")
      .order(
        "ordem",
        {
          ascending: true,
        }
      );

    if (error) {
      setErroSistema(
        "Não foi possível carregar os benefícios."
      );

      return;
    }

    setBeneficios(data ?? []);
  }
    async function entrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setEntrando(true);
    setErroLogin("");

    const emailLimpo = email.trim();
    const senhaDigitada = senha;

    if (!emailLimpo) {
      setErroLogin("Digite o e-mail.");
      setEntrando(false);
      return;
    }

    if (!senhaDigitada) {
      setErroLogin("Digite a senha.");
      setEntrando(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: emailLimpo,
      password: senhaDigitada,
    });

    if (error) {
      console.error("Erro Supabase login:", error);
      setErroLogin("E-mail ou senha inválidos.");
      setEntrando(false);
      return;
    }

    setSenha("");
    setEntrando(false);
  }

  async function sair() {
    await supabase.auth.signOut();

    setAutenticado(false);
    setAdministrador(false);
    setProdutos([]);
    setCategorias([]);
    setConfiguracoes([]);
    setBeneficios([]);
    setSenha("");
  }

  function mostrarMensagem(texto: string) {
    setMensagem(texto);

    window.setTimeout(() => {
      setMensagem("");
    }, 2500);
  }

  function adicionarItemMenu() {
    setMenuExtras((atuais) => [
      ...atuais,
      {
        id: `menu-${Date.now()}`,
        label: "Novo item",
        href: "#",
      },
    ]);
  }

  function atualizarItemMenu(
    id: string,
    campo: "label" | "href",
    valor: string
  ) {
    setMenuExtras((atuais) =>
      atuais.map((item) =>
        item.id === id
          ? {
              ...item,
              [campo]: valor,
            }
          : item
      )
    );
  }

  function removerItemMenu(id: string) {
    setMenuExtras((atuais) =>
      atuais.filter((item) => item.id !== id)
    );
  }

  function nomeSeguroArquivo(nome: string) {
    const partes = nome.split(".");

    const extensaoOriginal =
      partes.length > 1
        ? partes[partes.length - 1].toLowerCase()
        : "jpg";

    const extensao =
      extensaoOriginal.replace(/[^a-z0-9]/g, "") || "jpg";

    const base = partes
      .slice(0, -1)
      .join(".")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60);

    return `${base || "imagem"}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}.${extensao}`;
  }

  async function enviarImagemStorage(
    file: File,
    pasta: string
  ) {
    if (!file.type.startsWith("image/")) {
      mostrarMensagem("Selecione um arquivo de imagem.");
      return null;
    }

    const limite = 10 * 1024 * 1024;

    if (file.size > limite) {
      mostrarMensagem("A imagem deve ter no máximo 10 MB.");
      return null;
    }

    const caminho = `${pasta}/${nomeSeguroArquivo(file.name)}`;

    const { error } = await supabase.storage
      .from("imagens")
      .upload(caminho, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Erro no upload da imagem:", error);
      mostrarMensagem(`Erro no upload: ${error.message}`);
      return null;
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("imagens")
      .getPublicUrl(caminho);

    return publicUrl;
  }

  async function salvarConfiguracaoImagem(
    chave: string,
    valor: string
  ) {
    const { error } = await supabase
      .from("configuracoes")
      .upsert(
        {
          chave,
          valor,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "chave",
        }
      );

    if (error) {
      mostrarMensagem(
        `Erro ao salvar imagem: ${error.message}`
      );

      return false;
    }

    setConfiguracoes((atuais) => {
      const existente = atuais.find(
        (item) => item.chave === chave
      );

      if (existente) {
        return atuais.map((item) =>
          item.chave === chave
            ? {
                ...item,
                valor,
              }
            : item
        );
      }

      return [
        ...atuais,
        {
          id: chave,
          chave,
          valor,
        },
      ];
    });

    return true;
  }

  async function selecionarImagemProduto(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setEnviandoImagemProduto(true);

    const url = await enviarImagemStorage(
      file,
      "produtos"
    );

    if (url) {
      setProdutoFormulario((atual) => ({
        ...atual,
        imagem: url,
      }));

      mostrarMensagem("Imagem do produto enviada.");
    }

    event.target.value = "";
    setEnviandoImagemProduto(false);
  }

  async function selecionarImagemCategoria(
    event: ChangeEvent<HTMLInputElement>,
    categoria: Categoria
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setEnviandoCategoriaId(categoria.id);

    const url = await enviarImagemStorage(
      file,
      "categorias"
    );

    if (url) {
      const { error } = await supabase
        .from("categorias")
        .update({
          imagem: url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", categoria.id);

      if (error) {
        mostrarMensagem(
          `Erro ao salvar imagem: ${error.message}`
        );
      } else {
        atualizarCategoriaLocal(
          categoria.id,
          "imagem",
          url
        );

        mostrarMensagem(
          `Imagem de ${categoria.nome} atualizada.`
        );
      }
    }

    event.target.value = "";
    setEnviandoCategoriaId(null);
  }

  async function selecionarHero(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setEnviandoHero(true);

    const url = await enviarImagemStorage(
      file,
      "banners"
    );

    if (url) {
      const salvo = await salvarConfiguracaoImagem(
        "hero_imagem",
        url
      );

      if (salvo) {
        setHeroImagem(url);

        mostrarMensagem(
          "Imagem do banner principal atualizada."
        );
      }
    }

    event.target.value = "";
    setEnviandoHero(false);
  }

  async function selecionarBanner(
    event: ChangeEvent<HTMLInputElement>,
    indice: number
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setEnviandoBannerIndice(indice);

    const url = await enviarImagemStorage(
      file,
      "banners"
    );

    if (url) {
      const chave =
        `banner_${indice + 1}_imagem`;

      const salvo =
        await salvarConfiguracaoImagem(
          chave,
          url
        );

      if (salvo) {
        setBannersImagens((atuais) =>
          atuais.map(
            (item, posicao) =>
              posicao === indice
                ? url
                : item
          )
        );

        mostrarMensagem(
          `Banner ${indice + 1} atualizado.`
        );
      }
    }

    event.target.value = "";
    setEnviandoBannerIndice(null);
  }

  async function selecionarImagemInstagram(
    event: ChangeEvent<HTMLInputElement>,
    indice: number
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setEnviandoInstagramIndice(indice);

    const url = await enviarImagemStorage(
      file,
      "instagram"
    );

    if (url) {
      const chave =
        `instagram_imagem_${indice + 1}`;

      const salvo =
        await salvarConfiguracaoImagem(
          chave,
          url
        );

      if (salvo) {
        setInstagramImagens((atuais) =>
          atuais.map(
            (item, posicao) =>
              posicao === indice
                ? url
                : item
          )
        );

        mostrarMensagem(
          `Imagem ${indice + 1} do Instagram atualizada.`
        );
      }
    }

    event.target.value = "";
    setEnviandoInstagramIndice(null);
  }

  async function removerImagemConfiguracao(
    chave: string,
    aoRemover: () => void
  ) {
    const salvo =
      await salvarConfiguracaoImagem(
        chave,
        ""
      );

    if (salvo) {
      aoRemover();

      mostrarMensagem(
        "Imagem removida da exibição."
      );
    }
  }

  function abrirNovoProduto() {
    setProdutoFormulario({
      ...produtoVazio,
      categoria:
        categorias[0]?.nome ??
        "Conjuntos",
    });

    setModalProduto(true);
  }

  function abrirEditarProduto(
    produto: Produto
  ) {
    setProdutoFormulario({
      id: produto.id,
      nome: produto.nome,
      slug:
        produto.slug ??
        gerarSlug(produto.nome),
      categoria:
        produto.categoria,
      descricao:
        produto.descricao ?? "",
      preco_normal:
        produto.preco_normal,
      preco_chic:
        produto.preco_chic,
      estoque:
        produto.estoque,
      ativo:
        produto.ativo,
      novidade:
        produto.novidade,
      imagem:
        produto.imagem ?? "",
      tamanhos:
        produto.tamanhos.join(", "),
      cores:
        produto.cores.join(", "),
      ordem:
        produto.ordem,
    });

    setModalProduto(true);
  }

  async function salvarProduto() {
    if (!produtoFormulario.nome.trim()) {
      mostrarMensagem(
        "Informe o nome do produto."
      );

      return;
    }

    if (!produtoFormulario.categoria) {
      mostrarMensagem(
        "Selecione uma categoria."
      );

      return;
    }

    setSalvandoProduto(true);

    const dados = {
      nome:
        produtoFormulario.nome.trim(),

      slug:
        produtoFormulario.slug.trim() ||
        gerarSlug(
          produtoFormulario.nome.trim()
        ),

      categoria:
        produtoFormulario.categoria,

      descricao:
        produtoFormulario.descricao.trim() ||
        null,

      preco_normal:
        Number(
          produtoFormulario.preco_normal ||
            0
        ),

      preco_chic:
        Number(
          produtoFormulario.preco_chic ||
            0
        ),

      estoque:
        Number(
          produtoFormulario.estoque ||
            0
        ),

      ativo:
        produtoFormulario.ativo,

      novidade:
        produtoFormulario.novidade,

      imagem:
        produtoFormulario.imagem.trim() ||
        null,

      tamanhos:
        produtoFormulario.tamanhos
          .split(",")
          .map((item) =>
            item.trim()
          )
          .filter(Boolean),

      cores:
        produtoFormulario.cores
          .split(",")
          .map((item) =>
            item.trim()
          )
          .filter(Boolean),

      ordem:
        Number(
          produtoFormulario.ordem ||
            0
        ),

      updated_at:
        new Date().toISOString(),
    };

    if (produtoFormulario.id) {
      const { error } = await supabase
        .from("produtos")
        .update(dados)
        .eq(
          "id",
          produtoFormulario.id
        );

      if (error) {
        setSalvandoProduto(false);

        mostrarMensagem(
          `Erro ao salvar: ${error.message}`
        );

        return;
      }
    } else {
      const { error } = await supabase
        .from("produtos")
        .insert(dados);

      if (error) {
        setSalvandoProduto(false);

        mostrarMensagem(
          `Erro ao cadastrar: ${error.message}`
        );

        return;
      }
    }

    await carregarProdutos();

    setSalvandoProduto(false);
    setModalProduto(false);

    mostrarMensagem(
      produtoFormulario.id
        ? "Produto atualizado com sucesso."
        : "Produto cadastrado com sucesso."
    );
  }

  async function excluirProduto(
    produto: Produto
  ) {
    const confirmar =
      window.confirm(
        `Deseja realmente excluir "${produto.nome}"?`
      );

    if (!confirmar) return;

    const { error } = await supabase
      .from("produtos")
      .delete()
      .eq(
        "id",
        produto.id
      );

    if (error) {
      mostrarMensagem(
        `Erro ao excluir: ${error.message}`
      );

      return;
    }

    await carregarProdutos();

    mostrarMensagem(
      "Produto excluído."
    );
  }

  function atualizarPrecoProduto(
    produto: Produto,
    campo:
      | "preco_normal"
      | "preco_chic",
    valor: number
  ) {
    setProdutos((atuais) =>
      atuais.map((item) =>
        item.id === produto.id
          ? {
              ...item,
              [campo]: valor,
            }
          : item
      )
    );
  }

  async function salvarPrecosChic() {
    for (const produto of produtos) {
      const { error } = await supabase
        .from("produtos")
        .update({
          preco_normal:
            produto.preco_normal,

          preco_chic:
            produto.preco_chic,

          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          produto.id
        );

      if (error) {
        mostrarMensagem(
          `Erro ao atualizar ${produto.nome}.`
        );

        return;
      }
    }

    mostrarMensagem(
      "Preços atualizados com sucesso."
    );
  }

  function atualizarCategoriaLocal(
    id: string,
    campo: keyof Categoria,
    valor:
      | string
      | boolean
      | number
  ) {
    setCategorias((atuais) =>
      atuais.map((categoria) =>
        categoria.id === id
          ? {
              ...categoria,
              [campo]: valor,
            }
          : categoria
      )
    );
  }

  async function salvarCategoria(
    categoria: Categoria
  ) {
    const { error } = await supabase
      .from("categorias")
      .update({
        nome:
          categoria.nome,

        descricao:
          categoria.descricao,

        imagem:
          categoria.imagem,

        ativo:
          categoria.ativo,

        ordem:
          categoria.ordem,

        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        categoria.id
      );

    if (error) {
      mostrarMensagem(
        `Erro ao salvar: ${error.message}`
      );

      return;
    }

    mostrarMensagem(
      `${categoria.nome} atualizada.`
    );
  }

  async function salvarConfiguracoes(
    itens: {
      chave: string;
      valor: string;
    }[]
  ) {
    for (const item of itens) {
      const { error } = await supabase
        .from("configuracoes")
        .upsert(
          {
            chave:
              item.chave,

            valor:
              item.valor,

            updated_at:
              new Date().toISOString(),
          },
          {
            onConflict:
              "chave",
          }
        );

      if (error) {
        mostrarMensagem(
          `Erro ao salvar ${item.chave}.`
        );

        return;
      }
    }

    await carregarConfiguracoes();

    mostrarMensagem(
      "Conteúdo atualizado com sucesso."
    );
  }

  function atualizarBeneficioLocal(
    id: string,
    campo:
      | "titulo"
      | "descricao",
    valor: string
  ) {
    setBeneficios((atuais) =>
      atuais.map((beneficio) =>
        beneficio.id === id
          ? {
              ...beneficio,
              [campo]: valor,
            }
          : beneficio
      )
    );
  }

  async function salvarBeneficios() {
    for (const beneficio of beneficios) {
      const { error } = await supabase
        .from("beneficios")
        .update({
          titulo:
            beneficio.titulo,

          descricao:
            beneficio.descricao,

          ativo:
            beneficio.ativo,

          ordem:
            beneficio.ordem,
        })
        .eq(
          "id",
          beneficio.id
        );

      if (error) {
        mostrarMensagem(
          "Erro ao salvar benefícios."
        );

        return;
      }
    }

    mostrarMensagem(
      "Benefícios atualizados."
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
            .includes(termo) ||
          produto.categoria
            .toLowerCase()
            .includes(termo)
      );
    }, [
      busca,
      produtos,
    ]);

  const estoqueTotal =
    useMemo(
      () =>
        produtos.reduce(
          (
            total,
            produto
          ) =>
            total +
            produto.estoque,
          0
        ),
      [produtos]
    );

  const totalNovidades =
    produtos.filter(
      (produto) =>
        produto.novidade
    ).length;

  const menu = [
    {
      id:
        "inicio" as Secao,
      nome:
        "Início",
      icon:
        <HomeIcon />,
    },

    {
      id:
        "produtos" as Secao,
      nome:
        "Produtos",
      icon:
        <BoxIcon />,
    },

    {
      id:
        "chic" as Secao,
      nome:
        "Chic+",
      icon:
        <StarIcon />,
    },

    {
      id:
        "estilo" as Secao,
      nome:
        "Descubra seu estilo",
      icon:
        <EditIcon />,
    },

    {
      id:
        "textos" as Secao,
      nome:
        "Textos e banners",
      icon:
        <EditIcon />,
    },

    {
      id:
        "configuracoes" as Secao,
      nome:
        "Configurações",
      icon:
        <SettingsIcon />,
    },
  ];
    if (carregandoInicial) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f1ed]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#d7c6bc] border-t-black" />

          <p className="mt-5 text-[11px] uppercase tracking-[0.2em] text-[#756a64]">
            Carregando Dona Chic
          </p>
        </div>
      </main>
    );
  }

  if (!autenticado) {
    return (
      <main className="grid min-h-screen bg-[#f2ece7] lg:grid-cols-2">
        <section className="relative hidden overflow-hidden bg-black lg:block">
          <img
            src="/hero-dona-chic.webp"
            alt="Dona Chic"
            className="absolute inset-0 h-full w-full object-cover opacity-70"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black/25 to-black/70" />

          <div className="relative flex h-full flex-col justify-between p-14 text-white">
            <div>
              <p className="font-serif text-[40px] text-[#e2ad94]">
                DC
              </p>

              <p className="mt-1 text-[9px] uppercase tracking-[0.35em]">
                Dona Chic
              </p>
            </div>

            <div className="max-w-[500px]">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#e1ae97]">
                Administração
              </p>

              <h1 className="mt-5 font-serif text-[56px] leading-[1.02]">
                Gestão da sua
                <br />
                loja Dona Chic.
              </h1>

              <p className="mt-6 text-[14px] leading-7 text-white/75">
                Produtos, preços, estoque, novidades, categorias e conteúdo em
                um único painel.
              </p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-10">
          <form
            onSubmit={entrar}
            autoComplete="off"
            className="w-full max-w-[430px] border border-[#ddd4ce] bg-white p-7 sm:p-10"
          >
            <input
              type="text"
              name="fake-login-user"
              autoComplete="username"
              tabIndex={-1}
              aria-hidden="true"
              className="absolute h-0 w-0 opacity-0"
            />

            <input
              type="password"
              name="fake-login-password"
              autoComplete="current-password"
              tabIndex={-1}
              aria-hidden="true"
              className="absolute h-0 w-0 opacity-0"
            />

            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#b4765d]">
              Dona Chic
            </p>

            <h1 className="mt-3 font-serif text-[40px] leading-none">
              Painel administrativo
            </h1>

            <p className="mt-4 text-[12px] leading-6 text-[#837770]">
              Entre com a conta autorizada para administrar a loja.
            </p>

            <div className="mt-8 space-y-5">
              <label className="block">
                <span className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.12em] text-[#736963]">
                  E-mail
                </span>

                <input
                  type="email"
                  name="dona-chic-admin-email"
                  required
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="seu@email.com"
                  className="w-full border border-[#d8d0cb] bg-[#fbfaf8] px-4 py-3.5 text-[16px] text-black caret-black outline-none focus:border-black"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.12em] text-[#736963]">
                  Senha
                </span>

                <div className="relative">
                  <input
                    type={mostrarSenha ? "text" : "password"}
                    name="dona-chic-admin-access"
                    required
                    value={senha}
                    onChange={(event) =>
                      setSenha(event.target.value)
                    }
                    autoComplete="new-password"
                    autoCapitalize="none"
                    spellCheck={false}
                    data-1p-ignore="true"
                    data-lpignore="true"
                    placeholder="Digite sua senha"
                    className="w-full border border-[#d8d0cb] bg-[#fbfaf8] px-4 py-3.5 pr-14 text-[16px] text-black caret-black outline-none focus:border-black"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setMostrarSenha((valor) => !valor)
                    }
                    aria-label={
                      mostrarSenha
                        ? "Ocultar senha"
                        : "Mostrar senha"
                    }
                    className="absolute right-0 top-0 flex h-full w-12 items-center justify-center text-[#6f625c] transition hover:text-black"
                  >
                    <EyeIcon aberto={mostrarSenha} />
                  </button>
                </div>

                <p className="mt-2 text-[10px] text-[#988b84]">
                  Digite manualmente a senha criada no Supabase.
                </p>
              </label>
            </div>

            {erroLogin && (
              <div className="mt-5 border border-[#e8bdb4] bg-[#fff2ef] px-4 py-3 text-[11px] text-[#a34839]">
                {erroLogin}
              </div>
            )}

            <button
              type="submit"
              disabled={entrando}
              className="mt-7 w-full bg-black py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-white disabled:opacity-50"
            >
              {entrando ? "Entrando..." : "Entrar no painel"}
            </button>

            <a
              href="/"
              className="mt-5 block text-center text-[10px] uppercase tracking-[0.14em] text-[#8e817a]"
            >
              ← Voltar para a loja
            </a>
          </form>
        </section>
      </main>
    );
  }

  if (!administrador) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f1ed] p-6">
        <div className="w-full max-w-[520px] border border-[#ddd5d0] bg-white p-8 text-center">
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#a9654c]">
            Acesso restrito
          </p>

          <h1 className="mt-4 font-serif text-[36px]">
            Usuário sem permissão
          </h1>

          <p className="mt-4 text-[12px] leading-6 text-[#7d716b]">
            Sua conta está autenticada, mas ainda não está cadastrada como
            administradora da Dona Chic.
          </p>

          <button
            onClick={sair}
            className="mt-7 bg-black px-8 py-3 text-[10px] uppercase tracking-[0.15em] text-white"
          >
            Sair
          </button>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f1ee] text-[#211b18]">
      <aside className="fixed bottom-0 left-0 top-0 z-40 hidden w-[230px] flex-col bg-[#0b0b0b] text-white lg:flex">
        <div className="flex h-[105px] items-center justify-center border-b border-white/10">
          <a
            href="/"
            className="text-center"
          >
            <div className="font-serif text-[30px] tracking-[0.08em] text-[#d9a088]">
              DC
            </div>

            <div className="mt-1 text-[9px] uppercase tracking-[0.3em] text-white/80">
              Dona Chic
            </div>
          </a>
        </div>

        <div className="px-3 py-6">
          <p className="mb-3 px-3 text-[9px] uppercase tracking-[0.25em] text-white/35">
            Administração
          </p>

          <nav className="space-y-1">
            {menu.map((item) => {
              const ativo = secao === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    setSecao(item.id)
                  }
                  className={`flex w-full items-center gap-3 rounded-sm px-4 py-3 text-left text-[12px] transition ${
                    ativo
                      ? "bg-[#b97a61] text-white"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.icon}
                  {item.nome}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto border-t border-white/10 p-4">
          <a
            href="/"
            className="mb-2 flex w-full items-center justify-center border border-white/15 px-4 py-3 text-[10px] uppercase tracking-[0.16em] text-white/65 transition hover:bg-white hover:text-black"
          >
            Ver loja
          </a>

          <button
            type="button"
            onClick={sair}
            className="flex w-full items-center justify-center border border-white/15 px-4 py-3 text-[10px] uppercase tracking-[0.16em] text-white/65 transition hover:bg-[#a75245] hover:text-white"
          >
            Sair
          </button>
        </div>
      </aside>

      <main className="min-h-screen lg:ml-[230px]">
        <header className="sticky top-0 z-30 flex min-h-[70px] items-center justify-between border-b border-[#ded8d3] bg-[#f8f6f3]/95 px-5 backdrop-blur md:px-8">
          <div>
            <p className="text-[9px] uppercase tracking-[0.22em] text-[#a07866]">
              Administração
            </p>

            <p className="mt-1 text-[14px] font-semibold text-[#28201c]">
              Dona Chic
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              className="border border-[#d8cec8] bg-white px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] transition hover:border-black"
            >
              Ver loja
            </a>

            <button
              type="button"
              onClick={sair}
              className="border border-[#d8cec8] bg-white px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.12em]"
            >
              Sair
            </button>
          </div>
        </header>

        <div className="flex overflow-x-auto border-b border-[#ddd6d1] bg-white px-3 lg:hidden">
          {menu.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() =>
                setSecao(item.id)
              }
              className={`whitespace-nowrap border-b-2 px-4 py-4 text-[11px] ${
                secao === item.id
                  ? "border-[#b97a61] text-[#9a604a]"
                  : "border-transparent text-[#736963]"
              }`}
            >
              {item.nome}
            </button>
          ))}
        </div>

        {mensagem && (
          <div className="fixed right-6 top-[88px] z-[300] max-w-[360px] bg-black px-5 py-3 text-[12px] text-white shadow-xl">
            {mensagem}
          </div>
        )}

        {erroSistema && (
          <div className="mx-5 mt-5 border border-[#e6b8ae] bg-[#fff1ed] px-5 py-4 text-[12px] text-[#9b4638] md:mx-8">
            {erroSistema}
          </div>
        )}

        {secao === "inicio" && (
          <div className="p-5 md:p-8 lg:p-10">
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#ba8169]">
                  Visão geral
                </p>

                <h1 className="mt-2 font-serif text-[42px] leading-none">
                  Painel Dona Chic
                </h1>

                <p className="mt-3 text-[13px] text-[#82756e]">
                  Os dados exibidos aqui vêm do Supabase.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSecao("produtos");
                  abrirNovoProduto();
                }}
                className="bg-black px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white"
              >
                + Novo produto
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="border border-[#ddd7d2] bg-white p-6">
                <p className="text-[9px] uppercase tracking-[0.18em] text-[#91837c]">
                  Produtos
                </p>

                <p className="mt-4 font-serif text-[40px]">
                  {produtos.length}
                </p>

                <p className="mt-1 text-[11px] text-[#958881]">
                  cadastrados
                </p>
              </div>

              <div className="border border-[#ddd7d2] bg-white p-6">
                <p className="text-[9px] uppercase tracking-[0.18em] text-[#91837c]">
                  Estoque
                </p>

                <p className="mt-4 font-serif text-[40px]">
                  {estoqueTotal}
                </p>

                <p className="mt-1 text-[11px] text-[#958881]">
                  peças disponíveis
                </p>
              </div>

              <div className="border border-[#ddd7d2] bg-white p-6">
                <p className="text-[9px] uppercase tracking-[0.18em] text-[#91837c]">
                  Novidades
                </p>

                <p className="mt-4 font-serif text-[40px]">
                  {totalNovidades}
                </p>

                <p className="mt-1 text-[11px] text-[#958881]">
                  produtos marcados
                </p>
              </div>

              <div className="border border-[#ddd7d2] bg-white p-6">
                <p className="text-[9px] uppercase tracking-[0.18em] text-[#91837c]">
                  Categorias
                </p>

                <p className="mt-4 font-serif text-[40px]">
                  {categorias.length}
                </p>

                <p className="mt-1 text-[11px] text-[#958881]">
                  cadastradas
                </p>
              </div>
            </div>

            <div className="mt-8 border border-[#ddd7d2] bg-white">
              <div className="flex items-center justify-between border-b border-[#eee9e5] px-6 py-5">
                <div>
                  <h2 className="font-serif text-[25px]">
                    Produtos recentes
                  </h2>

                  <p className="mt-1 text-[11px] text-[#92857e]">
                    Produtos cadastrados no banco.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSecao("produtos")
                  }
                  className="text-[10px] font-semibold uppercase tracking-[0.15em]"
                >
                  Ver catálogo →
                </button>
              </div>

              {produtos.length === 0 ? (
                <div className="px-6 py-14 text-center">
                  <p className="text-[12px] text-[#8d817b]">
                    Ainda não existem produtos cadastrados.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setSecao("produtos");
                      abrirNovoProduto();
                    }}
                    className="mt-5 bg-black px-6 py-3 text-[9px] uppercase tracking-[0.15em] text-white"
                  >
                    Cadastrar primeiro produto
                  </button>
                </div>
              ) : (
                produtos
                  .slice(0, 5)
                  .map((produto) => (
                    <div
                      key={produto.id}
                      className="flex items-center gap-4 border-b border-[#eee9e5] px-6 py-4 last:border-b-0"
                    >
                      <div className="h-14 w-11 overflow-hidden bg-[#eeeae7]">
                        {produto.imagem ? (
                          <img
                            src={produto.imagem}
                            alt={produto.nome}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[8px] text-[#9f938c]">
                            Sem foto
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold">
                          {produto.nome}
                        </p>

                        <p className="mt-1 text-[10px] text-[#958880]">
                          {produto.categoria}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[11px] font-semibold text-[#9e6048]">
                          {formatarPreco(
                            produto.preco_chic
                          )}
                        </p>

                        <p className="mt-1 text-[9px] text-[#9b8f89]">
                          {produto.estoque} em estoque
                        </p>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {secao === "produtos" && (
          <div className="p-5 md:p-8 lg:p-10">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-[#b07861]">
                  Catálogo
                </p>

                <h1 className="mt-2 font-serif text-[42px] leading-none">
                  Produtos
                </h1>

                <p className="mt-3 text-[12px] text-[#8a7e77]">
                  Os produtos cadastrados aqui ficam gravados no Supabase.
                </p>
              </div>

              <button
                type="button"
                onClick={abrirNovoProduto}
                className="bg-black px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white"
              >
                + Novo produto
              </button>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="border border-[#ded8d3] bg-white p-5">
                <p className="text-[9px] uppercase tracking-[0.18em] text-[#958880]">
                  Cadastrados
                </p>

                <p className="mt-2 font-serif text-[34px]">
                  {produtos.length}
                </p>
              </div>

              <div className="border border-[#ded8d3] bg-white p-5">
                <p className="text-[9px] uppercase tracking-[0.18em] text-[#958880]">
                  Ativos
                </p>

                <p className="mt-2 font-serif text-[34px]">
                  {
                    produtos.filter(
                      (produto) =>
                        produto.ativo
                    ).length
                  }
                </p>
              </div>

              <div className="border border-[#ded8d3] bg-white p-5">
                <p className="text-[9px] uppercase tracking-[0.18em] text-[#958880]">
                  Estoque total
                </p>

                <p className="mt-2 font-serif text-[34px]">
                  {estoqueTotal}
                </p>
              </div>
            </div>

            <div className="mt-6 border border-[#ddd7d2] bg-white">
              <div className="flex flex-col justify-between gap-4 border-b border-[#e9e3df] p-5 md:flex-row md:items-center">
                <div>
                  <h2 className="font-serif text-[25px]">
                    Catálogo
                  </h2>

                  <p className="mt-1 text-[10px] text-[#90847d]">
                    Gerencie os produtos da loja.
                  </p>
                </div>

                <input
                  value={busca}
                  onChange={(event) =>
                    setBusca(event.target.value)
                  }
                  placeholder="Buscar produto ou categoria"
                  className="w-full border border-[#ded7d2] bg-[#fbfaf8] px-4 py-3 text-[12px] outline-none focus:border-black md:w-[310px]"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse">
                  <thead>
                    <tr className="border-b border-[#e9e3df] text-left">
                      <th className="px-5 py-4 text-[9px] uppercase tracking-[0.15em] text-[#8f827b]">
                        Produto
                      </th>

                      <th className="px-5 py-4 text-[9px] uppercase tracking-[0.15em] text-[#8f827b]">
                        Categoria
                      </th>

                      <th className="px-5 py-4 text-[9px] uppercase tracking-[0.15em] text-[#8f827b]">
                        Preços
                      </th>

                      <th className="px-5 py-4 text-[9px] uppercase tracking-[0.15em] text-[#8f827b]">
                        Estoque
                      </th>

                      <th className="px-5 py-4 text-[9px] uppercase tracking-[0.15em] text-[#8f827b]">
                        Status
                      </th>

                      <th className="px-5 py-4 text-right text-[9px] uppercase tracking-[0.15em] text-[#8f827b]">
                        Ações
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {produtosFiltrados.map((produto) => (
                      <tr
                        key={produto.id}
                        className="border-b border-[#eee9e5] last:border-0"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-4">
                            <div className="h-14 w-11 overflow-hidden bg-[#eeeae7]">
                              {produto.imagem ? (
                                <img
                                  src={produto.imagem}
                                  alt={produto.nome}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-[7px] text-[#a3958e]">
                                  Sem foto
                                </div>
                              )}
                            </div>

                            <div>
                              <p className="text-[12px] font-semibold">
                                {produto.nome}
                              </p>

                              {produto.novidade && (
                                <span className="mt-1 inline-block bg-[#f1ded4] px-2 py-[3px] text-[8px] font-semibold uppercase tracking-[0.12em] text-[#a06149]">
                                  Novidade
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-[11px] text-[#665d58]">
                          {produto.categoria}
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-[10px] text-[#736965]">
                            Normal:{" "}
                            {formatarPreco(
                              produto.preco_normal
                            )}
                          </p>

                          <p className="mt-1 text-[11px] font-semibold text-[#a06049]">
                            Chic+:{" "}
                            {formatarPreco(
                              produto.preco_chic
                            )}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-[11px]">
                          {produto.estoque}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-block rounded-full px-3 py-1 text-[8px] font-semibold uppercase tracking-[0.1em] ${
                              produto.ativo
                                ? "bg-[#e5f2e9] text-[#437451]"
                                : "bg-[#eeeae7] text-[#827872]"
                            }`}
                          >
                            {produto.ativo
                              ? "Ativo"
                              : "Inativo"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                abrirEditarProduto(
                                  produto
                                )
                              }
                              className="border border-[#d8d0cb] px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.1em] hover:border-black"
                            >
                              Editar
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                excluirProduto(
                                  produto
                                )
                              }
                              className="border border-[#e5c4bb] px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.1em] text-[#a75545] hover:bg-[#a75545] hover:text-white"
                            >
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {produtosFiltrados.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-5 py-16 text-center text-[12px] text-[#8c817b]"
                        >
                          Nenhum produto encontrado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
                {secao === "chic" && (
          <div className="p-5 md:p-8 lg:p-10">
            <p className="text-[10px] uppercase tracking-[0.24em] text-[#b07861]">
              Programa especial
            </p>

            <h1 className="mt-2 font-serif text-[42px] leading-none">
              Preço Chic+
            </h1>

            <p className="mt-3 max-w-[650px] text-[12px] leading-6 text-[#887b75]">
              Edite o Preço normal e o Preço Chic+ dos produtos.
            </p>

            <div className="mt-8 border border-[#ddd6d1] bg-white">
              <div className="border-b border-[#ebe5e1] p-6">
                <h2 className="font-serif text-[25px]">
                  Produtos com preço Chic+
                </h2>
              </div>

              {produtos.length === 0 ? (
                <div className="p-10 text-center text-[12px] text-[#8d817b]">
                  Nenhum produto cadastrado.
                </div>
              ) : (
                produtos.map((produto) => (
                  <div
                    key={produto.id}
                    className="grid gap-5 border-b border-[#eee9e5] p-5 last:border-0 md:grid-cols-[1fr_180px_180px]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-12 overflow-hidden bg-[#eeeae7]">
                        {produto.imagem && (
                          <img
                            src={produto.imagem}
                            alt={produto.nome}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>

                      <div>
                        <p className="text-[12px] font-semibold">
                          {produto.nome}
                        </p>

                        <p className="mt-1 text-[10px] text-[#91857f]">
                          {produto.categoria}
                        </p>
                      </div>
                    </div>

                    <label className="block">
                      <span className="mb-2 block text-[9px] uppercase tracking-[0.12em] text-[#81756f]">
                        Preço normal
                      </span>

                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={produto.preco_normal}
                        onChange={(event) =>
                          atualizarPrecoProduto(
                            produto,
                            "preco_normal",
                            Number(event.target.value)
                          )
                        }
                        className="w-full border border-[#ddd5d0] px-3 py-2.5 text-[12px]"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-[9px] uppercase tracking-[0.12em] text-[#a06149]">
                        Preço Chic+
                      </span>

                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={produto.preco_chic}
                        onChange={(event) =>
                          atualizarPrecoProduto(
                            produto,
                            "preco_chic",
                            Number(event.target.value)
                          )
                        }
                        className="w-full border border-[#d8aa96] bg-[#fbf3ef] px-3 py-2.5 text-[12px] font-semibold text-[#915940]"
                      />
                    </label>
                  </div>
                ))
              )}

              <div className="p-5 text-right">
                <button
                  type="button"
                  onClick={salvarPrecosChic}
                  className="bg-[#b97a61] px-7 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white"
                >
                  Salvar preços
                </button>
              </div>
            </div>
          </div>
        )}

        {secao === "estilo" && (
          <div className="p-5 md:p-8 lg:p-10">
            <p className="text-[10px] uppercase tracking-[0.24em] text-[#b07861]">
              Página inicial
            </p>

            <h1 className="mt-2 font-serif text-[42px] leading-none">
              Descubra seu estilo
            </h1>

            <p className="mt-3 max-w-[700px] text-[12px] leading-6 text-[#887b75]">
              Essas categorias já estão gravadas no Supabase.
            </p>

            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {categorias.map((categoria) => (
                <div
                  key={categoria.id}
                  className="overflow-hidden border border-[#dcd5d0] bg-white"
                >
                  <div className="relative aspect-[16/8] overflow-hidden bg-[#eeeae7]">
                    {categoria.imagem ? (
                      <img
                        src={categoria.imagem}
                        alt={categoria.nome}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[11px] text-[#9d9088]">
                        Adicione uma imagem
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 p-5">
                    <label className="block">
                      <span className="mb-2 block text-[9px] uppercase tracking-[0.12em] text-[#81756f]">
                        Nome
                      </span>

                      <input
                        value={categoria.nome}
                        onChange={(event) =>
                          atualizarCategoriaLocal(
                            categoria.id,
                            "nome",
                            event.target.value
                          )
                        }
                        className="w-full border border-[#dbd4cf] px-3 py-2.5 text-[12px]"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-[9px] uppercase tracking-[0.12em] text-[#81756f]">
                        Descrição
                      </span>

                      <textarea
                        value={categoria.descricao ?? ""}
                        onChange={(event) =>
                          atualizarCategoriaLocal(
                            categoria.id,
                            "descricao",
                            event.target.value
                          )
                        }
                        rows={3}
                        className="w-full resize-none border border-[#dbd4cf] px-3 py-2.5 text-[12px]"
                      />
                    </label>

                    <div>
                      <span className="mb-2 block text-[9px] uppercase tracking-[0.12em] text-[#81756f]">
                        Imagem da categoria
                      </span>

                      <label className="flex cursor-pointer items-center justify-center border border-[#d8d0cb] bg-[#fbfaf8] px-4 py-3 text-[9px] font-semibold uppercase tracking-[0.12em] transition hover:border-black">
                        {enviandoCategoriaId === categoria.id
                          ? "Enviando..."
                          : categoria.imagem
                            ? "Trocar imagem"
                            : "Selecionar imagem do computador"}

                        <input
                          type="file"
                          accept="image/*"
                          disabled={enviandoCategoriaId === categoria.id}
                          onChange={(event) =>
                            selecionarImagemCategoria(event, categoria)
                          }
                          className="hidden"
                        />
                      </label>

                      {categoria.imagem && (
                        <button
                          type="button"
                          onClick={async () => {
                            const { error } = await supabase
                              .from("categorias")
                              .update({
                                imagem: null,
                                updated_at: new Date().toISOString(),
                              })
                              .eq("id", categoria.id);

                            if (error) {
                              mostrarMensagem(
                                `Erro ao remover imagem: ${error.message}`
                              );
                              return;
                            }

                            atualizarCategoriaLocal(
                              categoria.id,
                              "imagem",
                              ""
                            );

                            mostrarMensagem(
                              "Imagem da categoria removida."
                            );
                          }}
                          className="mt-2 w-full border border-[#e1c8bf] px-4 py-2.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-[#a65343]"
                        >
                          Remover imagem
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => salvarCategoria(categoria)}
                      className="w-full bg-[#c98e76] py-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-white"
                    >
                      Salvar categoria
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {secao === "textos" && (
          <div className="p-5 md:p-8 lg:p-10">
            <p className="text-[10px] uppercase tracking-[0.24em] text-[#b07861]">
              Conteúdo do site
            </p>

            <h1 className="mt-2 font-serif text-[42px] leading-none">
              Textos e banners
            </h1>

            <div className="mt-8 space-y-6">
              <section className="border border-[#ddd6d1] bg-white">
                <div className="border-b border-[#ebe5e1] px-6 py-5">
                  <h2 className="font-serif text-[25px]">
                    Barra superior e menu
                  </h2>

                  <p className="mt-2 text-[11px] leading-5 text-[#8c8079]">
                    Edite os textos da faixa preta, os nomes do menu e crie
                    novos links.
                  </p>
                </div>

                <div className="grid gap-5 p-6 lg:grid-cols-3">
                  <label>
                    <span className="mb-2 block text-[9px] uppercase tracking-[0.12em] text-[#81756f]">
                      Faixa preta — esquerda
                    </span>

                    <input
                      value={topoEsquerda}
                      onChange={(event) =>
                        setTopoEsquerda(event.target.value)
                      }
                      className="w-full border border-[#dbd4cf] px-4 py-3 text-[12px]"
                    />
                  </label>

                  <label>
                    <span className="mb-2 block text-[9px] uppercase tracking-[0.12em] text-[#81756f]">
                      Faixa preta — centro
                    </span>

                    <input
                      value={topoCentro}
                      onChange={(event) =>
                        setTopoCentro(event.target.value)
                      }
                      className="w-full border border-[#dbd4cf] px-4 py-3 text-[12px]"
                    />
                  </label>

                  <label>
                    <span className="mb-2 block text-[9px] uppercase tracking-[0.12em] text-[#81756f]">
                      Faixa preta — direita
                    </span>

                    <input
                      value={topoDireita}
                      onChange={(event) =>
                        setTopoDireita(event.target.value)
                      }
                      className="w-full border border-[#dbd4cf] px-4 py-3 text-[12px]"
                    />
                  </label>
                </div>

                <div className="border-t border-[#ebe5e1] p-6">
                  <p className="mb-4 text-[9px] uppercase tracking-[0.14em] text-[#81756f]">
                    Itens principais do menu
                  </p>

                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                    <label>
                      <span className="mb-2 block text-[9px] uppercase tracking-[0.12em] text-[#81756f]">
                        Novidades
                      </span>

                      <input
                        value={menuNovidades}
                        onChange={(event) =>
                          setMenuNovidades(event.target.value)
                        }
                        className="w-full border border-[#dbd4cf] px-4 py-3 text-[12px]"
                      />
                    </label>

                    <label>
                      <span className="mb-2 block text-[9px] uppercase tracking-[0.12em] text-[#81756f]">
                        Encontre seu estilo
                      </span>

                      <input
                        value={menuEstilo}
                        onChange={(event) =>
                          setMenuEstilo(event.target.value)
                        }
                        className="w-full border border-[#dbd4cf] px-4 py-3 text-[12px]"
                      />
                    </label>

                    <label>
                      <span className="mb-2 block text-[9px] uppercase tracking-[0.12em] text-[#81756f]">
                        Promoção
                      </span>

                      <input
                        value={menuPromocao}
                        onChange={(event) =>
                          setMenuPromocao(event.target.value)
                        }
                        className="w-full border border-[#dbd4cf] px-4 py-3 text-[12px]"
                      />
                    </label>

                    <label>
                      <span className="mb-2 block text-[9px] uppercase tracking-[0.12em] text-[#81756f]">
                        Instagram
                      </span>

                      <input
                        value={menuInstagram}
                        onChange={(event) =>
                          setMenuInstagram(event.target.value)
                        }
                        className="w-full border border-[#dbd4cf] px-4 py-3 text-[12px]"
                      />
                    </label>
                  </div>
                </div>

                <div className="border-t border-[#ebe5e1] p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <label className="w-full max-w-[720px]">
                      <span className="mb-2 block text-[9px] uppercase tracking-[0.12em] text-[#81756f]">
                        Link do Instagram
                      </span>

                      <input
                        value={instagramUrl}
                        onChange={(event) =>
                          setInstagramUrl(event.target.value)
                        }
                        placeholder="https://instagram.com/seuusuario"
                        className="w-full border border-[#dbd4cf] px-4 py-3 text-[12px]"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={adicionarItemMenu}
                      className="shrink-0 bg-black px-6 py-3 text-[9px] font-semibold uppercase tracking-[0.13em] text-white"
                    >
                      + Adicionar item ao menu
                    </button>
                  </div>

                  {menuExtras.length > 0 && (
                    <div className="mt-5 space-y-3">
                      {menuExtras.map((item, indice) => (
                        <div
                          key={item.id}
                          className="grid gap-3 border border-[#e2dbd6] bg-[#fbfaf8] p-4 md:grid-cols-[1fr_1.3fr_auto]"
                        >
                          <label>
                            <span className="mb-2 block text-[8px] uppercase tracking-[0.12em] text-[#81756f]">
                              Nome do item {indice + 1}
                            </span>

                            <input
                              value={item.label}
                              onChange={(event) =>
                                atualizarItemMenu(
                                  item.id,
                                  "label",
                                  event.target.value
                                )
                              }
                              className="w-full border border-[#dbd4cf] px-3 py-2.5 text-[11px]"
                            />
                          </label>

                          <label>
                            <span className="mb-2 block text-[8px] uppercase tracking-[0.12em] text-[#81756f]">
                              Destino
                            </span>

                            <input
                              value={item.href}
                              onChange={(event) =>
                                atualizarItemMenu(
                                  item.id,
                                  "href",
                                  event.target.value
                                )
                              }
                              placeholder="#colecao, /produtos ou https://..."
                              className="w-full border border-[#dbd4cf] px-3 py-2.5 text-[11px]"
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => removerItemMenu(item.id)}
                            className="self-end border border-[#e1c8bf] px-4 py-2.5 text-[8px] font-semibold uppercase tracking-[0.1em] text-[#a65343]"
                          >
                            Remover
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-[#ebe5e1] p-5 text-right">
                  <button
                    type="button"
                    onClick={() =>
                      salvarConfiguracoes([
                        {
                          chave: "topo_esquerda",
                          valor: topoEsquerda,
                        },
                        {
                          chave: "topo_centro",
                          valor: topoCentro,
                        },
                        {
                          chave: "topo_direita",
                          valor: topoDireita,
                        },
                        {
                          chave: "menu_novidades",
                          valor: menuNovidades,
                        },
                        {
                          chave: "menu_estilo",
                          valor: menuEstilo,
                        },
                        {
                          chave: "menu_promocao",
                          valor: menuPromocao,
                        },
                        {
                          chave: "menu_instagram",
                          valor: menuInstagram,
                        },
                        {
                          chave: "instagram_url",
                          valor: instagramUrl,
                        },
                        {
                          chave: "menu_extras_json",
                          valor: JSON.stringify(menuExtras),
                        },
                      ])
                    }
                    className="bg-[#bd8067] px-7 py-3 text-[10px] uppercase tracking-[0.14em] text-white"
                  >
                    Salvar barra e menu
                  </button>
                </div>
              </section>

              <section className="border border-[#ddd6d1] bg-white">
                <div className="border-b border-[#ebe5e1] px-6 py-5">
                  <h2 className="font-serif text-[25px]">
                    Banner principal
                  </h2>
                </div>

                <div className="grid gap-5 p-6 lg:grid-cols-2">
                  <label>
                    <span className="mb-2 block text-[9px] uppercase tracking-[0.12em] text-[#81756f]">
                      Título
                    </span>
                                        <input
                      value={heroTitulo}
                      onChange={(event) =>
                        setHeroTitulo(event.target.value)
                      }
                      className="w-full border border-[#dbd4cf] px-4 py-3 text-[12px]"
                    />
                  </label>

                  <label>
                    <span className="mb-2 block text-[9px] uppercase tracking-[0.12em] text-[#81756f]">
                      Texto do botão
                    </span>

                    <input
                      value={heroBotao}
                      onChange={(event) =>
                        setHeroBotao(event.target.value)
                      }
                      className="w-full border border-[#dbd4cf] px-4 py-3 text-[12px]"
                    />
                  </label>

                  <label className="lg:col-span-2">
                    <span className="mb-2 block text-[9px] uppercase tracking-[0.12em] text-[#81756f]">
                      Descrição
                    </span>

                    <textarea
                      value={heroDescricao}
                      onChange={(event) =>
                        setHeroDescricao(event.target.value)
                      }
                      rows={3}
                      className="w-full resize-none border border-[#dbd4cf] px-4 py-3 text-[12px]"
                    />
                  </label>

                  <div className="lg:col-span-2">
                    <span className="mb-2 block text-[9px] uppercase tracking-[0.12em] text-[#81756f]">
                      Imagem do banner principal
                    </span>

                    <div className="grid gap-4 md:grid-cols-[260px_1fr]">
                      <div className="aspect-[16/9] overflow-hidden bg-[#eeeae7]">
                        {heroImagem ? (
                          <img
                            src={heroImagem}
                            alt="Banner principal"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[10px] text-[#998c85]">
                            Sem imagem
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col justify-center gap-3">
                        <label className="flex cursor-pointer items-center justify-center bg-black px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.13em] text-white">
                          {enviandoHero
                            ? "Enviando..."
                            : heroImagem
                              ? "Trocar imagem"
                              : "Selecionar imagem do computador"}

                          <input
                            type="file"
                            accept="image/*"
                            disabled={enviandoHero}
                            onChange={selecionarHero}
                            className="hidden"
                          />
                        </label>

                        {heroImagem && (
                          <button
                            type="button"
                            onClick={() =>
                              removerImagemConfiguracao(
                                "hero_imagem",
                                () => setHeroImagem("")
                              )
                            }
                            className="border border-[#e0c6bd] px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.13em] text-[#a65443]"
                          >
                            Remover imagem
                          </button>
                        )}

                        <p className="text-[10px] leading-5 text-[#8d817a]">
                          A imagem é enviada para o Supabase Storage e salva
                          automaticamente.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#ebe5e1] p-5 text-right">
                  <button
                    type="button"
                    onClick={() =>
                      salvarConfiguracoes([
                        {
                          chave: "hero_titulo",
                          valor: heroTitulo,
                        },
                        {
                          chave: "hero_descricao",
                          valor: heroDescricao,
                        },
                        {
                          chave: "hero_botao",
                          valor: heroBotao,
                        },
                        {
                          chave: "hero_imagem",
                          valor: heroImagem,
                        },
                      ])
                    }
                    className="bg-black px-7 py-3 text-[10px] uppercase tracking-[0.14em] text-white"
                  >
                    Salvar banner
                  </button>
                </div>
              </section>

              <section className="border border-[#ddd6d1] bg-white">
                <div className="border-b border-[#ebe5e1] px-6 py-5">
                  <h2 className="font-serif text-[25px]">
                    Imagens dos 10 banners
                  </h2>

                  <p className="mt-2 text-[11px] leading-5 text-[#8c8079]">
                    Selecione as imagens diretamente do computador. Cada upload
                    é salvo automaticamente no Supabase.
                  </p>
                </div>

                <div className="grid gap-5 p-6 md:grid-cols-2 xl:grid-cols-5">
                  {bannersImagens.map((imagem, indice) => (
                    <div
                      key={`banner-${indice + 1}`}
                      className="border border-[#e0d9d4] bg-[#fbfaf8] p-3"
                    >
                      <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#98614b]">
                        Banner {indice + 1}
                      </p>

                      <div className="aspect-[16/10] overflow-hidden bg-[#ece8e5]">
                        {imagem ? (
                          <img
                            src={imagem}
                            alt={`Banner ${indice + 1}`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center px-3 text-center text-[9px] text-[#998c85]">
                            Nenhuma imagem
                          </div>
                        )}
                      </div>

                      <label className="mt-3 flex cursor-pointer items-center justify-center bg-black px-3 py-2.5 text-center text-[8px] font-semibold uppercase tracking-[0.1em] text-white">
                        {enviandoBannerIndice === indice
                          ? "Enviando..."
                          : imagem
                            ? "Trocar imagem"
                            : "Selecionar imagem"}

                        <input
                          type="file"
                          accept="image/*"
                          disabled={enviandoBannerIndice === indice}
                          onChange={(event) =>
                            selecionarBanner(event, indice)
                          }
                          className="hidden"
                        />
                      </label>

                      {imagem && (
                        <button
                          type="button"
                          onClick={() =>
                            removerImagemConfiguracao(
                              `banner_${indice + 1}_imagem`,
                              () =>
                                setBannersImagens((atuais) =>
                                  atuais.map((item, posicao) =>
                                    posicao === indice ? "" : item
                                  )
                                )
                            )
                          }
                          className="mt-2 w-full border border-[#e1c8bf] px-3 py-2 text-[8px] font-semibold uppercase tracking-[0.1em] text-[#a65343]"
                        >
                          Remover
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              <section className="border border-[#ddd6d1] bg-white">
                <div className="border-b border-[#ebe5e1] px-6 py-5">
                  <h2 className="font-serif text-[25px]">
                    Títulos das seções
                  </h2>
                </div>

                <div className="grid gap-5 p-6 md:grid-cols-2">
                  <label>
                    <span className="mb-2 block text-[9px] uppercase tracking-[0.12em] text-[#81756f]">
                      Seu estilo
                    </span>

                    <input
                      value={tituloEstilo}
                      onChange={(event) =>
                        setTituloEstilo(event.target.value)
                      }
                      className="w-full border border-[#dbd4cf] px-4 py-3 text-[12px]"
                    />
                  </label>

                  <label>
                    <span className="mb-2 block text-[9px] uppercase tracking-[0.12em] text-[#81756f]">
                      Nova coleção
                    </span>

                    <input
                      value={tituloColecao}
                      onChange={(event) =>
                        setTituloColecao(event.target.value)
                      }
                      className="w-full border border-[#dbd4cf] px-4 py-3 text-[12px]"
                    />
                  </label>

                  <label className="md:col-span-2">
                    <span className="mb-2 block text-[9px] uppercase tracking-[0.12em] text-[#81756f]">
                      Promoção
                    </span>

                    <textarea
                      value={tituloPromocao}
                      onChange={(event) =>
                        setTituloPromocao(event.target.value)
                      }
                      rows={3}
                      className="w-full resize-none border border-[#dbd4cf] px-4 py-3 text-[12px]"
                    />
                  </label>
                </div>

                <div className="border-t border-[#ebe5e1] p-5 text-right">
                  <button
                    type="button"
                    onClick={() =>
                      salvarConfiguracoes([
                        {
                          chave: "titulo_estilo",
                          valor: tituloEstilo,
                        },
                        {
                          chave: "titulo_colecao",
                          valor: tituloColecao,
                        },
                        {
                          chave: "titulo_promocao",
                          valor: tituloPromocao,
                        },
                      ])
                    }
                    className="bg-[#bd8067] px-7 py-3 text-[10px] uppercase tracking-[0.14em] text-white"
                  >
                    Salvar textos
                  </button>
                </div>
              </section>

              <section className="border border-[#ddd6d1] bg-white">
                <div className="border-b border-[#ebe5e1] px-6 py-5">
                  <h2 className="font-serif text-[25px]">
                    Benefícios
                  </h2>
                </div>

                <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-5">
                  {beneficios.map((beneficio) => (
                    <div
                      key={beneficio.id}
                      className="border border-[#e0d9d4] bg-[#fbfaf8] p-4"
                    >
                      <input
                        value={beneficio.titulo}
                        onChange={(event) =>
                          atualizarBeneficioLocal(
                            beneficio.id,
                            "titulo",
                            event.target.value
                          )
                        }
                        className="w-full border border-[#ddd5d0] bg-white px-3 py-2 text-[11px]"
                      />

                      <input
                        value={beneficio.descricao ?? ""}
                        onChange={(event) =>
                          atualizarBeneficioLocal(
                            beneficio.id,
                            "descricao",
                            event.target.value
                          )
                        }
                        className="mt-2 w-full border border-[#ddd5d0] bg-white px-3 py-2 text-[10px]"
                      />
                    </div>
                  ))}
                </div>

                <div className="border-t border-[#ebe5e1] p-5 text-right">
                  <button
                    type="button"
                    onClick={salvarBeneficios}
                    className="bg-black px-7 py-3 text-[10px] uppercase tracking-[0.14em] text-white"
                  >
                    Salvar benefícios
                  </button>
                </div>
              </section>

              <section className="border border-[#ddd6d1] bg-white">
                <div className="border-b border-[#ebe5e1] px-6 py-5">
                  <h2 className="font-serif text-[25px]">
                    Instagram
                  </h2>
                </div>

                <div className="grid gap-5 p-6 md:grid-cols-2">
                  <label>
                    <span className="mb-2 block text-[9px] uppercase tracking-[0.12em] text-[#81756f]">
                      Usuário
                    </span>

                    <input
                      value={instagramUsuario}
                      onChange={(event) =>
                        setInstagramUsuario(event.target.value)
                      }
                      className="w-full border border-[#dbd4cf] px-4 py-3 text-[12px]"
                    />
                  </label>

                  <label>
                    <span className="mb-2 block text-[9px] uppercase tracking-[0.12em] text-[#81756f]">
                      Título
                    </span>

                    <input
                      value={instagramTitulo}
                      onChange={(event) =>
                        setInstagramTitulo(event.target.value)
                      }
                      className="w-full border border-[#dbd4cf] px-4 py-3 text-[12px]"
                    />
                  </label>

                  <label className="md:col-span-2">
                    <span className="mb-2 block text-[9px] uppercase tracking-[0.12em] text-[#81756f]">
                      Link do perfil no Instagram
                    </span>

                    <input
                      value={instagramUrl}
                      onChange={(event) =>
                        setInstagramUrl(event.target.value)
                      }
                      placeholder="https://instagram.com/seuusuario"
                      className="w-full border border-[#dbd4cf] px-4 py-3 text-[12px]"
                    />
                  </label>
                </div>

                <div className="border-t border-[#ebe5e1] p-6">
                  <p className="mb-4 text-[9px] uppercase tracking-[0.14em] text-[#81756f]">
                    Imagens do Instagram
                  </p>

                  <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {instagramImagens.map((imagem, indice) => (
                      <div
                        key={`instagram-${indice + 1}`}
                        className="border border-[#e0d9d4] bg-[#fbfaf8] p-3"
                      >
                        <div className="aspect-square overflow-hidden bg-[#ece8e5]">
                          {imagem ? (
                            <img
                              src={imagem}
                              alt={`Instagram ${indice + 1}`}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-[9px] text-[#998c85]">
                              Sem imagem
                            </div>
                          )}
                        </div>

                        <label className="mt-3 flex cursor-pointer items-center justify-center bg-black px-3 py-2.5 text-center text-[8px] font-semibold uppercase tracking-[0.1em] text-white">
                          {enviandoInstagramIndice === indice
                            ? "Enviando..."
                            : imagem
                              ? "Trocar"
                              : "Selecionar"}

                          <input
                            type="file"
                            accept="image/*"
                            disabled={enviandoInstagramIndice === indice}
                            onChange={(event) =>
                              selecionarImagemInstagram(event, indice)
                            }
                            className="hidden"
                          />
                        </label>

                        {imagem && (
                          <button
                            type="button"
                            onClick={() =>
                              removerImagemConfiguracao(
                                `instagram_imagem_${indice + 1}`,
                                () =>
                                  setInstagramImagens((atuais) =>
                                    atuais.map((item, posicao) =>
                                      posicao === indice ? "" : item
                                    )
                                  )
                              )
                            }
                            className="mt-2 w-full border border-[#e1c8bf] px-3 py-2 text-[8px] font-semibold uppercase tracking-[0.1em] text-[#a65343]"
                          >
                            Remover
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-[#ebe5e1] p-5 text-right">
                  <button
                    type="button"
                    onClick={() =>
                      salvarConfiguracoes([
                        {
                          chave: "instagram_usuario",
                          valor: instagramUsuario,
                        },
                        {
                          chave: "instagram_titulo",
                          valor: instagramTitulo,
                        },
                        {
                          chave: "instagram_url",
                          valor: instagramUrl,
                        },
                      ])
                    }
                    className="bg-[#bd8067] px-7 py-3 text-[10px] uppercase tracking-[0.14em] text-white"
                  >
                    Salvar Instagram
                  </button>
                </div>
              </section>

              <section className="border border-[#ddd6d1] bg-white">
                <div className="border-b border-[#ebe5e1] px-6 py-5">
                  <h2 className="font-serif text-[25px]">
                    Newsletter
                  </h2>
                </div>

                <div className="grid gap-5 p-6 md:grid-cols-2">
                  <input
                    value={newsletterTitulo}
                    onChange={(event) =>
                      setNewsletterTitulo(event.target.value)
                    }
                    className="border border-[#dbd4cf] px-4 py-3 text-[12px]"
                  />

                  <input
                    value={newsletterBotao}
                    onChange={(event) =>
                      setNewsletterBotao(event.target.value)
                    }
                    className="border border-[#dbd4cf] px-4 py-3 text-[12px]"
                  />

                  <textarea
                    value={newsletterDescricao}
                    onChange={(event) =>
                      setNewsletterDescricao(event.target.value)
                    }
                    rows={3}
                    className="resize-none border border-[#dbd4cf] px-4 py-3 text-[12px] md:col-span-2"
                  />
                </div>

                <div className="border-t border-[#ebe5e1] p-5 text-right">
                                 <button
                    type="button"
                    onClick={() =>
                      salvarConfiguracoes([
                        {
                          chave: "newsletter_titulo",
                          valor: newsletterTitulo,
                        },
                        {
                          chave: "newsletter_descricao",
                          valor: newsletterDescricao,
                        },
                        {
                          chave: "newsletter_botao",
                          valor: newsletterBotao,
                        },
                      ])
                    }
                    className="bg-black px-7 py-3 text-[10px] uppercase tracking-[0.14em] text-white"
                  >
                    Salvar newsletter
                  </button>
                </div>
              </section>
            </div>
          </div>
        )}

        {secao === "configuracoes" && (
          <div className="p-5 md:p-8 lg:p-10">
            <p className="text-[10px] uppercase tracking-[0.24em] text-[#b07861]">
              Sistema
            </p>

            <h1 className="mt-2 font-serif text-[42px] leading-none">
              Configurações
            </h1>

            <div className="mt-8 max-w-[850px] space-y-6">
              <section className="border border-[#ddd6d1] bg-white p-6">
                <h2 className="font-serif text-[25px]">
                  Rodapé da loja
                </h2>

                <label className="mt-6 block">
                  <span className="mb-2 block text-[9px] uppercase tracking-[0.12em] text-[#81756f]">
                    Frase da marca
                  </span>

                  <input
                    value={rodapeFrase}
                    onChange={(event) =>
                      setRodapeFrase(event.target.value)
                    }
                    className="w-full border border-[#dbd4cf] px-4 py-3 text-[12px]"
                  />
                </label>

                <button
                  type="button"
                  onClick={() =>
                    salvarConfiguracoes([
                      {
                        chave: "rodape_frase",
                        valor: rodapeFrase,
                      },
                    ])
                  }
                  className="mt-6 bg-black px-7 py-3 text-[10px] uppercase tracking-[0.14em] text-white"
                >
                  Salvar configurações
                </button>
              </section>

              <section className="border border-[#d8e5db] bg-[#f1f7f2] p-6">
                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#487356]">
                  Supabase conectado
                </p>

                <h2 className="mt-3 font-serif text-[28px]">
                  Painel usando banco de dados real
                </h2>

                <p className="mt-3 text-[12px] leading-6 text-[#667169]">
                  Produtos, categorias, preços, textos e imagens desta área
                  são gravados no projeto Supabase da Dona Chic. As imagens usam
                  o bucket Storage "imagens".
                </p>
              </section>
            </div>
          </div>
        )}
      </main>

      {modalProduto && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/65 p-3 sm:p-6">
          <div className="max-h-[95vh] w-full max-w-[920px] overflow-y-auto bg-[#f8f6f3] shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#ddd5cf] bg-[#f8f6f3] px-6 py-5">
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-[#af7259]">
                  Catálogo
                </p>

                <h2 className="mt-1 font-serif text-[30px]">
                  {produtoFormulario.id
                    ? "Editar produto"
                    : "Novo produto"}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setModalProduto(false)}
                className="flex h-10 w-10 items-center justify-center border border-[#d8d0cb] text-xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-6 p-6">
              <section className="border border-[#ded7d2] bg-white p-5">
                <h3 className="font-serif text-[22px]">
                  Dados do produto
                </h3>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <label className="md:col-span-2">
                    <span className="mb-2 block text-[9px] uppercase tracking-[0.12em] text-[#81756f]">
                      Nome
                    </span>

                    <input
                      value={produtoFormulario.nome}
                      onChange={(event) =>
                        setProdutoFormulario({
                          ...produtoFormulario,
                          nome: event.target.value,
                          slug:
                            produtoFormulario.id &&
                            produtoFormulario.slug
                              ? produtoFormulario.slug
                              : gerarSlug(event.target.value),
                        })
                      }
                      className="w-full border border-[#dcd4cf] px-4 py-3 text-[12px]"
                    />
                  </label>

                  <label>
                    <span className="mb-2 block text-[9px] uppercase tracking-[0.12em] text-[#81756f]">
                      Categoria
                    </span>

                    <select
                      value={produtoFormulario.categoria}
                      onChange={(event) =>
                        setProdutoFormulario({
                          ...produtoFormulario,
                          categoria: event.target.value,
                        })
                      }
                      className="w-full border border-[#dcd4cf] bg-white px-4 py-3 text-[12px]"
                    >
                      {categorias.map((categoria) => (
                        <option
                          key={categoria.id}
                          value={categoria.nome}
                        >
                          {categoria.nome}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span className="mb-2 block text-[9px] uppercase tracking-[0.12em] text-[#81756f]">
                      Estoque
                    </span>

                    <input
                      type="number"
                      min="0"
                      value={produtoFormulario.estoque}
                      onChange={(event) =>
                        setProdutoFormulario({
                          ...produtoFormulario,
                          estoque: Number(event.target.value),
                        })
                      }
                      className="w-full border border-[#dcd4cf] px-4 py-3 text-[12px]"
                    />
                  </label>

                  <label className="md:col-span-2">
                    <span className="mb-2 block text-[9px] uppercase tracking-[0.12em] text-[#81756f]">
                      Descrição
                    </span>

                    <textarea
                      rows={4}
                      value={produtoFormulario.descricao}
                      onChange={(event) =>
                        setProdutoFormulario({
                          ...produtoFormulario,
                          descricao: event.target.value,
                        })
                      }
                      className="w-full resize-none border border-[#dcd4cf] px-4 py-3 text-[12px]"
                    />
                  </label>
                </div>
              </section>

              <section className="border border-[#ded7d2] bg-white p-5">
                <h3 className="font-serif text-[22px]">
                  Imagem
                </h3>

                <div className="mt-5 grid gap-5 md:grid-cols-[180px_1fr]">
                  <div className="aspect-[3/4] overflow-hidden bg-[#eeeae7]">
                    {produtoFormulario.imagem ? (
                      <img
                        src={produtoFormulario.imagem}
                        alt="Produto"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] text-[#9c9089]">
                        Sem imagem
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col justify-center">
                    <span className="mb-2 block text-[9px] uppercase tracking-[0.12em] text-[#81756f]">
                      Imagem do produto
                    </span>

                    <label className="flex cursor-pointer items-center justify-center bg-black px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.13em] text-white">
                      {enviandoImagemProduto
                        ? "Enviando..."
                        : produtoFormulario.imagem
                          ? "Trocar imagem"
                          : "Selecionar imagem do computador"}

                      <input
                        type="file"
                        accept="image/*"
                        disabled={enviandoImagemProduto}
                        onChange={selecionarImagemProduto}
                        className="hidden"
                      />
                    </label>

                    {produtoFormulario.imagem && (
                      <button
                        type="button"
                        onClick={() =>
                          setProdutoFormulario((atual) => ({
                            ...atual,
                            imagem: "",
                          }))
                        }
                        className="mt-3 border border-[#e1c8bf] px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.13em] text-[#a65343]"
                      >
                        Remover imagem do produto
                      </button>
                    )}

                    <p className="mt-3 text-[10px] leading-5 text-[#8d817a]">
                      JPG, PNG, WEBP ou outro formato de imagem. Limite de 10 MB.
                    </p>
                  </div>
                </div>
              </section>

              <section className="border border-[#ded7d2] bg-white p-5">
                <h3 className="font-serif text-[22px]">
                  Preços
                </h3>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <label>
                    <span className="mb-2 block text-[9px] uppercase tracking-[0.12em] text-[#81756f]">
                      Preço normal
                    </span>

                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={produtoFormulario.preco_normal}
                      onChange={(event) =>
                        setProdutoFormulario({
                          ...produtoFormulario,
                          preco_normal: Number(event.target.value),
                        })
                      }
                      className="w-full border border-[#dcd4cf] px-4 py-3 text-[12px]"
                    />
                  </label>

                  <label>
                    <span className="mb-2 block text-[9px] uppercase tracking-[0.12em] text-[#a25e46]">
                      Preço Chic+
                    </span>

                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={produtoFormulario.preco_chic}
                      onChange={(event) =>
                        setProdutoFormulario({
                          ...produtoFormulario,
                          preco_chic: Number(event.target.value),
                        })
                      }
                      className="w-full border border-[#d9a38c] bg-[#fff8f5] px-4 py-3 text-[12px] font-semibold text-[#995b43]"
                    />
                  </label>
                </div>
              </section>

              <section className="border border-[#ded7d2] bg-white p-5">
                <h3 className="font-serif text-[22px]">
                  Tamanhos e cores
                </h3>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <label>
                    <span className="mb-2 block text-[9px] uppercase tracking-[0.12em] text-[#81756f]">
                      Tamanhos
                    </span>

                    <input
                      value={produtoFormulario.tamanhos}
                      onChange={(event) =>
                        setProdutoFormulario({
                          ...produtoFormulario,
                          tamanhos: event.target.value,
                        })
                      }
                      placeholder="P, M, G, GG"
                      className="w-full border border-[#dcd4cf] px-4 py-3 text-[12px]"
                    />
                  </label>

                  <label>
                    <span className="mb-2 block text-[9px] uppercase tracking-[0.12em] text-[#81756f]">
                      Cores
                    </span>

                    <input
                      value={produtoFormulario.cores}
                      onChange={(event) =>
                        setProdutoFormulario({
                          ...produtoFormulario,
                          cores: event.target.value,
                        })
                      }
                      placeholder="Preto, Rosa, Azul"
                      className="w-full border border-[#dcd4cf] px-4 py-3 text-[12px]"
                    />
                  </label>
                </div>
              </section>

              <section className="border border-[#ded7d2] bg-white p-5">
                <h3 className="font-serif text-[22px]">
                  Exibição
                </h3>

                <div className="mt-5 space-y-4">
                  <label className="flex cursor-pointer items-center justify-between border border-[#e0d9d4] p-4">
                    <div>
                      <p className="text-[12px] font-semibold">
                        Produto ativo
                      </p>

                      <p className="mt-1 text-[10px] text-[#948780]">
                        Permite exibir este produto na loja.
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      checked={produtoFormulario.ativo}
                      onChange={(event) =>
                        setProdutoFormulario({
                          ...produtoFormulario,
                          ativo: event.target.checked,
                        })
                      }
                      className="h-5 w-5"
                    />
                  </label>

                  <label className="flex cursor-pointer items-center justify-between border border-[#e0d9d4] p-4">
                    <div>
                      <p className="text-[12px] font-semibold">
                        Marcar como novidade
                      </p>

                      <p className="mt-1 text-[10px] text-[#948780]">
                        Exibe o produto no filtro de Novidades.
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      checked={produtoFormulario.novidade}
                      onChange={(event) =>
                        setProdutoFormulario({
                          ...produtoFormulario,
                          novidade: event.target.checked,
                        })
                      }
                      className="h-5 w-5"
                    />
                  </label>
                </div>
              </section>
            </div>

            <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-[#ddd5cf] bg-[#f8f6f3] px-6 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setModalProduto(false)}
                className="border border-[#d4cbc6] px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.13em]"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={salvandoProduto}
                onClick={salvarProduto}
                className="bg-[#b97a61] px-7 py-3 text-[10px] font-semibold uppercase tracking-[0.13em] text-white disabled:opacity-50"
              >
                {salvandoProduto
                  ? "Salvando..."
                  : produtoFormulario.id
                    ? "Salvar produto"
                    : "Cadastrar produto"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}     