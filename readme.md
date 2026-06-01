# bootstrap-imgdrop.js

jQuery plugin for image upload with drag & drop and Bootstrap 5.

## Dependencies

- jQuery 3.7+
- Bootstrap 5
- Bootstrap Icons

## Installation

Include the dependencies and the plugin in your HTML:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css">

<script src="https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
<script src="bootstrap-imgdrop.js"></script>
```

## HTML Structure

Use `data-bs-imgdrop` attributes to wire up the plugin elements:

```html
<form data-bs-imgdrop="form">
    <div class="upload-zone" data-bs-imgdrop="dropZone">
        <div>
            <i class="bi bi-file-earmark-image"></i>
            <span>Drag and drop your images here or</span>
            <button type="button" data-bs-imgdrop="selectBtn">Select images</button>
        </div>

        <small data-bs-imgdrop="hint"></small>

        <input type="file" data-bs-imgdrop="fileInput" accept="image/*" multiple style="display:none">

        <small class="text-danger" data-bs-imgdrop="errMsg" role="alert"></small>
        <div data-bs-imgdrop="imgGrid"></div>
        <small data-bs-imgdrop="counter" style="display:none">
            <span data-bs-imgdrop="countNum">0</span>/3 images selected
        </small>
    </div>

    <button type="submit">Submit</button>
</form>
```

## Usage

### Basic

```javascript
$('[data-bs-imgdrop="form"]').imgDrop();
```

### With options

```javascript
$('[data-bs-imgdrop="form"]').imgDrop({
    max:        5,
    maxSize:    5242880,
    extensions: ["jpg", "png"],

    onUploadSuccess: (response) => console.log("Success:", response),
    onUploadError:   (xhr)      => console.error("Error:", xhr),
});
```

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `max` | `number` | `3` | Maximum number of images |
| `maxSize` | `number` | `10485760` | Maximum file size in bytes (default 10 MB) |
| `extensions` | `array` | `["jpg", "jpeg", "png", "svg", "heic"]` | Allowed file extensions |
| `inputName` | `string` | `"images[]"` | Name attribute of the file input |
| `mock` | `boolean` | `false` | Enable mock upload for local testing |
| `mockDelay` | `number` | `1000` | Mock upload delay in milliseconds |
| `mockSuccess` | `number` | `0.7` | Mock success rate (0 to 1) |
| `onUploadSuccess` | `function` | `null` | Callback on upload success |
| `onUploadError` | `function` | `null` | Callback on upload error |

## Messages

All messages are customizable via the `messages` option:

```javascript
$('[data-bs-imgdrop="form"]').imgDrop({
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
});
```

## Selectors

All selectors can be customized via the `selectors` option. Useful when running multiple instances on the same page:

```javascript
$('[data-bs-imgdrop="form"]').imgDrop({
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
});
```

## Mock Upload

Enable mock mode for local testing without a backend. The `mockSuccess` option controls the success rate (0 to 1):

```javascript
$('[data-bs-imgdrop="form"]').imgDrop({
    mock: true,

    onUploadSuccess: (response) => alert("Upload successful!"),
    onUploadError:   (xhr)      => alert("Upload failed."),
});
```

To simulate a specific scenario:

```javascript
// Always succeeds
$('[data-bs-imgdrop="form"]').imgDrop({ mock: true, mockSuccess: 1 });

// Always fails
$('[data-bs-imgdrop="form"]').imgDrop({ mock: true, mockSuccess: 0 });

// 50/50
$('[data-bs-imgdrop="form"]').imgDrop({ mock: true, mockSuccess: 0.5 });
```

## License

MIT © [Rogério Saraceni](https://github.com/rogeriosaraceni)