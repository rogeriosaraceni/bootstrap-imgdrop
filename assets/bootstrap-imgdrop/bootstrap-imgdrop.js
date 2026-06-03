/*!
 * bootstrap-imgdrop.js
 * jQuery plugin for image upload with drag & drop and Bootstrap 5
 * Dependências: jQuery 3.7+, Bootstrap 5, Bootstrap Icons
 *
 * @author  Rogério Saraceni <https://github.com/rogeriosaraceni>
 * @license MIT
 * Version 2.0.0 (2026-06-03)
 */

(function ($) {
    "use strict";

    const DEFAULTS = {
        max:        1,
        maxSize: 10485760,
        maxHeight: 350,
        extensions: ["jpg", "jpeg", "png", "svg", "heic"],
        inputName:  "images[]",
        lang:       "en", // Idioma padrão nativo

        selectors: {
            dropZone:  '[data-bs-imgdrop="dropZone"]',
            fileInput: '[data-bs-imgdrop="fileInput"]',
            selectBtn: '[data-bs-imgdrop="selectBtn"]',
            imgGrid:   '[data-bs-imgdrop="imgGrid"]',
            errMsg:    '[data-bs-imgdrop="errMsg"]',
            counter:   '[data-bs-imgdrop="counter"]',
            countNum:  '[data-bs-imgdrop="countNum"]',
            hint:      '[data-bs-imgdrop="hint"]',
        },

        messages:   null, // Será preenchido no construtor com base no idioma
        onChange:   null,
    };

    function ImgDrop(container, options) {
        // 1. Descobre qual idioma foi pedido (padrão é 'en')
        const chosenLang = (options && options.lang) || DEFAULTS.lang;
        
        // 2. Pega as mensagens do idioma no repositório global do plugin (definido lá embaixo)
        const activeLocale = $.fn.imgDrop.locales[chosenLang] || $.fn.imgDrop.locales["en"];

        // 3. Mescla tudo, garantindo que o 'messages' receba a tradução correta
        this.opts      = $.extend(true, {}, DEFAULTS, { messages: activeLocale }, options);
        this.$el       = $(container);
        this.images    = [];
        this.extsReg   = new RegExp(`\\.(${this.opts.extensions.join("|")})$`, "i");
        this.maxMB     = (this.opts.maxSize / (1024 * 1024)).toFixed(0);

        this._initRefs();
        this._bindEvents();
    }

    // Busca sempre dentro do próprio container — sem vazamento entre instâncias
    ImgDrop.prototype._find = function (selector) {
        return this.$el.find(selector);
    };

    ImgDrop.prototype._initRefs = function () {
        const s = this.opts.selectors;

        this.$dropZone  = this._find(s.dropZone);
        this.$fileInput = this._find(s.fileInput);
        this.$imgGrid   = this._find(s.imgGrid);
        this.$errMsg    = this._find(s.errMsg);
        this.$counter   = this._find(s.counter);
        this.$countNum  = this._find(s.countNum);

        this.$fileInput.attr("name", this.opts.inputName);

        this._find(s.hint).text(
            this.opts.messages.hint(this.opts.extensions, this.maxMB, this.opts.max)
        );
    };

    ImgDrop.prototype._bindEvents = function () {
        const self = this;
        const s    = this.opts.selectors;

        this._find(s.selectBtn).on("click", () => self.$fileInput.trigger("click"));

        this.$fileInput.on("change", function () {
            self._handleFiles(this.files);
            this.value = "";
        });

        this.$dropZone
            .on("dragover", (e) => { e.preventDefault(); self.$dropZone.addClass("drag-over"); })
            .on("dragleave", ()  => self.$dropZone.removeClass("drag-over"))
            .on("drop", (e) => {
                e.preventDefault();
                self.$dropZone.removeClass("drag-over");
                self._handleFiles(e.originalEvent.dataTransfer.files);
            });
    };

    ImgDrop.prototype._setErr = function (msg) {
        this.$errMsg.text(msg);
    };

    ImgDrop.prototype._handleFiles = function (files) {
        const { messages: msg } = this.opts;
        this._setErr("");

        const slots = this.opts.max - this.images.length;
        if (slots <= 0) { this._setErr(msg.limitReached(this.opts.max)); return; }

        let added = 0;
        for (const file of files) {
            if (added >= slots) { this._setErr(msg.limitExceeded(slots)); break; }
            if (!this.extsReg.test(file.name))     { this._setErr(msg.invalidExt(file.name, this.opts.extensions.join(", "))); continue; }
            if (file.size > this.opts.maxSize)      { this._setErr(msg.sizeExceeded(file.name, this.maxMB)); continue; }
            if (!file.type.match("image.*"))        continue;

            const id  = Date.now() + Math.random();
            const src = URL.createObjectURL(file);
            this.images.push({ id, src, name: file.name, file });
            this._renderCard({ id, src, name: file.name });
            added++;
        }

        this._updateCounter();
        this._fireChange();
    };

    ImgDrop.prototype._renderCard = function ({ id, src, name }) {
        const self = this;
        const tipZoom   = this.opts.messages.tooltipZoom();
        const tipRemove = this.opts.messages.tooltipRemove();

        const $card = $("<div>")
            .addClass("img-card")
            .attr("data-id", id)
            .css("max-height", `${this.opts.maxHeight}px`)
            .html(`
            <img src="${src}" alt="${name}" title="${name}">
            <button type="button" class="btn-zoom" data-bs-toggle="tooltip" data-bs-title="${tipZoom}">
                <i class="bi bi-zoom-in"></i>
            </button>
            <button type="button" class="btn-del" data-bs-toggle="tooltip" data-bs-title="${tipRemove}">
                <i class="bi bi-x-circle-fill"></i>
            </button>
        `);

        const $btnZoom = $card.find(".btn-zoom");
        const $btnDel  = $card.find(".btn-del");

        this.$imgGrid.append($card);

        const tooltipZoom = new bootstrap.Tooltip($btnZoom[0]);
        const tooltipDel  = new bootstrap.Tooltip($btnDel[0]);

        $btnZoom.on("click", () => {
            tooltipZoom.hide();
            tooltipDel.hide();
        });

        $btnDel.on("click", () => {
            self._removeImage(id);
        });
    };

    ImgDrop.prototype._removeImage = function (id) {
        const img = this.images.find((i) => i.id === id);
        if (img) URL.revokeObjectURL(img.src);
        this.images = this.images.filter((i) => i.id !== id);

        const $card = this.$imgGrid.find(`.img-card[data-id="${id}"]`);
        if ($card.length) {
            const btnDel  = $card.find(".btn-del")[0];
            const btnZoom = $card.find(".btn-zoom")[0];
            
            if (btnDel)  bootstrap.Tooltip.getInstance(btnDel)?.dispose();
            if (btnZoom) bootstrap.Tooltip.getInstance(btnZoom)?.dispose();
            
            $card.remove();
        }

        this._setErr("");
        this._updateCounter();
        this._fireChange();
    };

    ImgDrop.prototype._updateCounter = function () {
        this.$countNum.text(this.images.length);
        this.$counter.css("display", this.images.length ? "block" : "none");
    };

    // Expõe a lista atual para quem precisar (ex: coleta antes do POST externo)
    ImgDrop.prototype._fireChange = function () {
        if (typeof this.opts.onChange === "function") {
            this.opts.onChange([...this.images]);
        }
    };

    // API pública — acesso via $.data(el, 'imgDrop').getImages()
    ImgDrop.prototype.getImages  = function () { return [...this.images]; };
    ImgDrop.prototype.clearAll   = function () {
        [...this.images].forEach((img) => this._removeImage(img.id));
    };
    ImgDrop.prototype.destroy    = function () {
        this.clearAll();
        this.$el.removeData("imgDrop");
    };

    $.fn.imgDrop = function (options) {
        return this.each(function () {
            if (!$.data(this, "imgDrop")) {
                $.data(this, "imgDrop", new ImgDrop(this, options));
            }
        });
    };

    // Aqui fica o inglês nativo, direto no core do seu plugin
    $.fn.imgDrop.locales = {
        en: {
            limitReached:  (max)        => `Limit of ${max} images reached.`,
            limitExceeded: (slots)      => `Only ${slots} image(s) added. Limit reached.`,
            invalidExt:    (name, exts) => `"${name}" has an invalid extension. Allowed: ${exts}`,
            sizeExceeded:  (name, mb)   => `"${name}" exceeds ${mb} MB.`,
            noneSelected:  ()           => "No image selected.",
            tooltipRemove: ()           => "Remove",
            tooltipZoom:   ()           => "Zoom",
            hint: (exts, mb, max)       => `${exts.join(", ").toUpperCase()} · max ${mb} MB · up to ${max} image(s)`,
        }
    };

}(jQuery));