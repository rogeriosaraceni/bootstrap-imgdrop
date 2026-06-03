# bootstrap-imgdrop.js

Um plugin jQuery leve, moderno e responsivo para upload de imagens utilizando arrastar e soltar (**Drag & Drop**), totalmente integrado ao **Bootstrap 5** e **Bootstrap Icons**.

![Versão](https://img.shields.io/badge/version-2.0.0-blue)
![Licença](https://img.shields.io/badge/license-MIT-green)

---

## 🚀 Recursos

- 🖱️ **Drag & Drop real:** Arraste imagens diretamente para a zona de upload.
- 🖼️ **Preview em Tempo Real:** Criação de miniaturas instantâneas através de URLs de objetos locais seguros (`URL.createObjectURL`).
- 🔒 **Validações robustas de segurança:**
  - Controle de quantidade máxima de arquivos.
  - Filtro por tamanho máximo em MB.
  - Validação rigorosa por extensões permitidas.
- 🌐 **Suporte a Internacionalização (i18n):** Tradução nativa configurável e isolada em arquivos externos.
- 🛠️ **Componentes Nativos:** Tooltips integrados utilizando a API oficial do Bootstrap 5.
- 🧹 **Gerenciamento de Memória:** Limpeza automática de cache (`URL.revokeObjectURL`) ao remover imagens.

---

## 📦 Dependências

Certifique-se de incluir as seguintes dependências em seu projeto:

- **jQuery** (v3.7+)
- **Bootstrap 5** (CSS e Bundle JS com Popper.js incluído)
- **Bootstrap Icons** (v1.11+)

---

## 🛠️ Instalação e Estrutura

### 1. Estrutura HTML Recomendada

```html
<div class="upload-zone" id="imageUpload">
    <article data-bs-imgdrop="dropZone">
        <div class="d-flex flex-wrap justify-content-center align-items-center gap-2 text-secondary">
            <i class="bi bi-file-earmark-image fs-5"></i>
            <span>Arraste e solte suas imagens aqui ou</span>

            <button
                type="button"
                class="btn btn-sm btn-outline-secondary"
                data-bs-imgdrop="selectBtn">
                Selecione as imagens
            </button>
        </div>

        <small
            class="text-secondary d-block mt-1"
            data-bs-imgdrop="hint">
        </small>

        <input
            type="file"
            data-bs-imgdrop="fileInput"
            accept="image/*"
            multiple
            style="display:none">

        <div class="mt-2">
            <small
                class="text-danger d-block mb-2"
                data-bs-imgdrop="errMsg"
                role="alert">
            </small>

            <div
                data-bs-imgdrop="imgGrid"
                class="img-grid mb-2">
            </div>

            <small
                class="text-secondary"
                data-bs-imgdrop="counter"
                style="display:none">

                <span data-bs-imgdrop="countNum">0</span>
                arquivos selecionados
            </small>
        </div>
    </article>
</div>
```

---

### 2. Inicialização do Plugin

```javascript
$('#imageUpload').imgDrop({
    lang: 'pt-BR',
    max: 3,
    maxSize: 10485760, // 10 MB
    extensions: ["jpg", "jpeg", "png", "svg", "heic"],

    onChange: (images) => {
        console.log("Imagens atualmente carregadas:", images);
    }
});
```

---

## ⚙️ Opções de Configuração

| Parâmetro | Tipo | Padrão | Descrição |
|-----------|------|---------|-----------|
| `max` | Number | `1` | Quantidade máxima de imagens permitidas na instância. |
| `maxSize` | Number | `10485760` | Tamanho máximo permitido por arquivo (em bytes). |
| `extensions` | Array | `["jpg","jpeg","png","svg","heic"]` | Extensões de arquivos aceitas. |
| `inputName` | String | `"images[]"` | Atributo `name` aplicado dinamicamente ao input. |
| `lang` | String | `"en"` | Idioma padrão das mensagens. |
| `onChange` | Function | `null` | Callback executado ao adicionar ou remover imagens. |

---

## 🕹️ API Pública

Você pode acessar os métodos da instância do plugin através do `.data()` do jQuery.

### Recuperando a Instância

```javascript
const instance = $('#imageUpload').data('imgDrop');
```

---

### getImages()

Retorna um array contendo todas as imagens atualmente carregadas.

```javascript
const arquivos = instance.getImages();

console.log(arquivos);
```

Retorno:

```javascript
[
    {
        id: 1,
        src: "blob:https://...",
        name: "imagem.jpg",
        file: File
    }
]
```

---

### clearAll()

Remove todas as imagens carregadas, limpa os contadores e libera os recursos de memória.

```javascript
instance.clearAll();
```

---

### destroy()

Destrói completamente a instância do plugin e remove seus eventos.

```javascript
instance.destroy();
```

---

## 🌐 Internacionalização (i18n)

Você pode criar novos idiomas adicionando traduções ao objeto global:

```javascript
$.fn.imgDrop.locales["pt-BR"] = {
    limitReached: (max) =>
        `Limite de ${max} imagens atingido.`,

    limitExceeded: (slots) =>
        `Apenas ${slots} imagem(ns) foram adicionadas. Limite excedido.`,

    invalidExt: (name, exts) =>
        `"${name}" possui uma extensão inválida. Permitidos: ${exts}`,

    sizeExceeded: (name, mb) =>
        `"${name}" excede o tamanho máximo de ${mb} MB.`,

    noneSelected: () =>
        "Nenhuma imagem selecionada.",

    tooltipRemove: () =>
        "Remover",

    tooltipZoom: () =>
        "Ampliar",

    hint: (exts, mb, max) =>
        `${exts.join(", ").toUpperCase()} · Máx ${mb} MB · Até ${max} imagem(ns)`
};
```

Exemplo de estrutura:

```text
i18n/
├── bootstrap-imgdrop.en.js
├── bootstrap-imgdrop.pt-BR.js
├── bootstrap-imgdrop.es.js
└── bootstrap-imgdrop.fr.js
```

---

## 📄 Licença

Distribuído sob a licença **MIT**.

Consulte o arquivo **LICENSE** para mais informações.

---

## 👨‍💻 Exemplo Completo

```javascript
$('#imageUpload').imgDrop({
    lang: 'pt-BR',
    max: 5,
    maxSize: 5242880,
    extensions: ['jpg', 'jpeg', 'png'],

    onChange(images) {
        console.log(images);
    }
});
```