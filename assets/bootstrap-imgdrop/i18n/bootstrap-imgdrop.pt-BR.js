(function ($) {
    "use strict";
    // Se o plugin principal não estiver carregado, não faz nada
    if (!$.fn.imgDrop) return;
    // Adiciona o idioma pt-BR ao repositório global do plugin
    $.fn.imgDrop.locales["pt-BR"] = {
        limitReached: (max) => `Limite de ${max} imagem(ns) atingido.`,
        limitExceeded: (slots) => `Apenas ${slots} imagem(ns) adicionada(s). Limite atingido.`,
        invalidExt: (name, exts) => `"${name}" possui uma extensão inválida. Permitidas: ${exts}`,
        sizeExceeded: (name, mb) => `"${name}" excede ${mb} MB.`,
        noneSelected: () => "Nenhuma imagem selecionada.",
        tooltipRemove: () => "Remover",
        tooltipZoom: () => "Ampliar",
        selectBtnLimitReached: () => "Limite atingido",
        hint: (exts, mb, max) =>
            max === Infinity
                ? `${exts.join(", ").toUpperCase()} · máx ${mb} MB · sem limite de imagens`
                : `${exts.join(", ").toUpperCase()} · máx ${mb} MB · até ${max} imagem(ns)`,
    };
})(jQuery);
