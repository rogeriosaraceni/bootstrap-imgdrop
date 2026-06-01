/*!
 * bootstrap-imgdrop.js
 * jQuery plugin for image upload with drag & drop and Bootstrap 5
 * Dependências: jQuery 3.7+, Bootstrap 5, Bootstrap Icons
 *
 * @author  Rogério Saraceni <https://github.com/rogeriosaraceni>
 * @license MIT
 * Version 1.0.0 (2026-06-01)
 */

(function ($) {
    "use strict";

    const DEFAULTS = {
        max:         3,
        maxSize:     10485760,
        extensions:  ["jpg", "jpeg", "png", "svg", "heic"],
        inputName:   "images[]",
        mock:        false,
        mockDelay:   1000,
        mockSuccess: 0.7,

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

        messages: {
            limitReached:  (max)        => `Limit of ${max} images reached.`,
            limitExceeded: (slots)      => `Only ${slots} image(s) added. Limit reached.`,
            invalidExt:    (name, exts) => `"${name}" has an invalid extension. Allowed: ${exts}`,
            sizeExceeded:  (name, mb)   => `"${name}" exceeds ${mb} MB.`,
            noneSelected:  ()           => "No image selected.",
            uploadError:   ()           => "Upload failed. Please try again.",
            tooltipRemove: ()           => "Remove",
            tooltipZoom:   ()           => "Zoom",
            hint: (exts, mb, max)       => `${exts.join(", ").toUpperCase()} · max ${mb} MB per file · up to ${max} images`,
        },

        onUploadSuccess: null,
        onUploadError:   null,
    };

    function ImgDrop(form, options) {
        this.opts    = $.extend(true, {}, DEFAULTS, options);
        this.$form   = $(form);
        this.images  = [];
        this.extsReg = new RegExp(`\\.(${this.opts.extensions.join("|")})$`, "i");
        this.maxMB   = (this.opts.maxSize / (1024 * 1024)).toFixed(0);

        this._initRefs();
        this._bindEvents();
    }

    ImgDrop.prototype._initRefs = function () {
        const s         = this.opts.selectors;
        this.$dropZone  = $(s.dropZone);
        this.$fileInput = $(s.fileInput);
        this.$imgGrid   = $(s.imgGrid);
        this.$errMsg    = $(s.errMsg);
        this.$counter   = $(s.counter);
        this.$countNum  = $(s.countNum);

        this.$fileInput.attr("name", this.opts.inputName);

         $(s.hint).text(
            this.opts.messages.hint(
                this.opts.extensions,
                this.maxMB,
                this.opts.max,
            ),
        );
    };

    ImgDrop.prototype._bindEvents = function () {
        const self = this;

        $(this.opts.selectors.selectBtn).on("click", () =>
            self.$fileInput.trigger("click"),
        );

        this.$fileInput.on("change", function () {
            self._handleFiles(this.files);
            this.value = "";
        });

        this.$dropZone.on("dragover", (e) => {
            e.preventDefault();
            self.$dropZone.addClass("drag-over");
        });
        this.$dropZone.on("dragleave", () =>
            self.$dropZone.removeClass("drag-over"),
        );
        this.$dropZone.on("drop", (e) => {
            e.preventDefault();
            self.$dropZone.removeClass("drag-over");
            self._handleFiles(e.originalEvent.dataTransfer.files);
        });

        this.$form.on("submit", (e) => self._handleSubmit(e));
    };

    ImgDrop.prototype._setErr = function (msg) {
        this.$errMsg.text(msg);
    };

    ImgDrop.prototype._handleFiles = function (files) {
        const { messages: msg } = this.opts;
        this._setErr("");

        const slots = this.opts.max - this.images.length;
        if (slots <= 0) {
            this._setErr(msg.limitReached(this.opts.max));
            return;
        }

        let added = 0;
        for (const file of files) {
            if (added >= slots) {
                this._setErr(msg.limitExceeded(slots));
                break;
            }
            if (!this.extsReg.test(file.name)) {
                this._setErr(msg.invalidExt(file.name, this.opts.extensions.join(", ")));
                continue;
            }
            if (file.size > this.opts.maxSize) {
                this._setErr(msg.sizeExceeded(file.name, this.maxMB));
                continue;
            }
            if (!file.type.match("image.*")) continue;

            const id  = Date.now() + Math.random();
            const src = URL.createObjectURL(file);
            this.images.push({ id, src, name: file.name, file });
            this._renderCard({ id, src, name: file.name });
            added++;
        }

        this._updateCounter();
    };

    ImgDrop.prototype._renderCard = function ({ id, src, name }) {
        const self    = this;
        const tipTextZoom = this.opts.messages.tooltipZoom();
        const tipTextRemove = this.opts.messages.tooltipRemove();

        const $card = $("<div>")
            .addClass("img-card")
            .attr("data-id", id)
            .html(`
                <img src="${src}" alt="${name}" title="${name}">
                <button type="button" class="btn-zoom" data-bs-toggle="tooltip" data-bs-title="${tipTextZoom}">
                    <i class="bi bi-zoom-in"></i>
                </button>

                <button type="button" class="btn-del" data-bs-toggle="tooltip" data-bs-title="${tipTextRemove}">
                    <i class="bi bi-x-circle-fill"></i>
                </button>
            `);

        const $btnZoom = $card.find(".btn-zoom");
        const $btnDel = $card.find(".btn-del");

        $btnDel.on("click", () => self._removeImage(id));

        this.$imgGrid.append($card);

        const tooltipZoom = new bootstrap.Tooltip($btnZoom[0]);
        const tooltipDel  = new bootstrap.Tooltip($btnDel[0]);

        $btnZoom.on("click", () => tooltipZoom.hide());
        $btnDel.on("click",  () => tooltipDel.hide());
    };

    ImgDrop.prototype._removeImage = function (id) {
        const img = this.images.find((i) => i.id === id);
        if (img) URL.revokeObjectURL(img.src);
        this.images = this.images.filter((i) => i.id !== id);

        const $card = this.$imgGrid.find(`.img-card[data-id="${id}"]`);
        if ($card.length) {
            const btnDel = $card.find(".btn-del")[0];
            if (btnDel) bootstrap.Tooltip.getInstance(btnDel)?.dispose();
            const btnZoom = $card.find(".btn-zoom")[0];
            if (btnZoom) bootstrap.Tooltip.getInstance(btnZoom)?.dispose();
            $card.remove();
        }

        this._setErr("");
        this._updateCounter();
    };

    ImgDrop.prototype._updateCounter = function () {
        this.$countNum.text(this.images.length);
        this.$counter.css("display", this.images.length ? "block" : "none");
    };

    ImgDrop.prototype._handleSubmit = function (e) {
        e.preventDefault();

        if (this.images.length === 0) {
            this._setErr(this.opts.messages.noneSelected());
            return;
        }

        // ✅ MOCK UPLOAD (for testing without backend)
        if (this.opts.mock) {
            const self = this;
            console.log("📦 Mock upload — files:", this.images.map((i) => i.name));
            setTimeout(() => {
                if (Math.random() < self.opts.mockSuccess) {
                    if (typeof self.opts.onUploadSuccess === "function") {
                        self.opts.onUploadSuccess({ status: "ok", mock: true });
                    }
                    console.log("✅ Mock upload success");
                } else {
                    if (typeof self.opts.onUploadError === "function") {
                        self.opts.onUploadError({ status: 500, mock: true });
                    }
                    console.log("❌ Mock upload error");
                }
            }, self.opts.mockDelay);
            return;
        }
        // end of mock upload

        const formData = new FormData(this.$form[0]);
        formData.delete(this.opts.inputName);
        this.images.forEach((img) =>
            formData.append(this.opts.inputName, img.file, img.name),
        );

        const self = this;

        $.ajax({
            url:         this.$form.attr("action"),
            method:      "POST",
            data:        formData,
            processData: false,
            contentType: false,
            success: function (response) {
                if (typeof self.opts.onUploadSuccess === "function") {
                    self.opts.onUploadSuccess(response);
                }
            },
            error: function (xhr) {
                self._setErr(self.opts.messages.uploadError());
                if (typeof self.opts.onUploadError === "function") {
                    self.opts.onUploadError(xhr);
                }
            },
        });
    };

    $.fn.imgDrop = function (options) {
        return this.each(function () {
            if (!$.data(this, "imgDrop")) {
                $.data(this, "imgDrop", new ImgDrop(this, options));
            }
        });
    };

}(jQuery));