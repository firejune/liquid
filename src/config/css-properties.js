const forbiddenProperties = ['direction'];

const validProperties = [
  'align-content', 'align-items', 'align-self', 'animation', 'animation-delay',
  'animation-direction', 'animation-duration', 'animation-fill-mode', 'animation-iteration-count',
  'animation-name', 'animation-play-state', 'animation-timing-function', 'backface-visibility',
  'background', 'background-attachment', 'background-clip', 'background-color', 'background-image',
  'background-origin', 'background-position', 'background-repeat', 'background-size', 'border',
  'border-bottom', 'border-bottom-color', 'border-bottom-left-radius', 'border-bottom-right-radius',
  'border-bottom-style', 'border-bottom-width', 'border-collapse', 'border-color', 'border-image',
  'border-image-outset', 'border-image-repeat', 'border-image-slice', 'border-image-source',
  'border-image-width', 'border-left', 'border-left-color', 'border-left-style',
  'border-left-width', 'border-radius', 'border-right', 'border-right-color', 'border-right-style',
  'border-right-width', 'border-spacing', 'border-style', 'border-top', 'border-top-color',
  'border-top-left-radius', 'border-top-right-radius', 'border-top-style', 'border-top-width',
  'border-width', 'bottom', 'box-shadow', 'box-sizing', 'caption-side', 'clear', 'clip', 'color',
  'column-count', 'column-fill', 'column-gap', 'column-rule', 'column-rule-color',
  'column-rule-style', 'column-rule-width', 'column-span', 'column-width', 'columns', 'content',
  'counter-increment', 'counter-reset', 'cursor', 'display', 'empty-cells', 'flex', 'flex-basis',
  'flex-direction', 'flex-flow', 'flex-grow', 'flex-shrink', 'flex-wrap', 'float', 'font',
  'font-family', 'font-size', 'font-size-adjust', 'font-stretch', 'font-style', 'font-variant',
  'font-weight', 'hanging-punctuation', 'height', 'icon', 'justify-content', 'left',
  'letter-spacing', 'line-height', 'list-style', 'list-style-image', 'list-style-position',
  'list-style-type', 'margin', 'margin-bottom', 'margin-left', 'margin-right', 'margin-top',
  'max-height', 'max-width', 'min-height', 'min-width', 'nav-down', 'nav-index', 'nav-left',
  'nav-right', 'nav-up', 'opacity', 'order', 'outline', 'outline-color', 'outline-offset',
  'outline-style', 'outline-width', 'overflow', 'overflow-x', 'overflow-y', 'padding',
  'padding-bottom', 'padding-left', 'padding-right', 'padding-top', 'page-break-after',
  'page-break-before', 'page-break-inside', 'perspective', 'perspective-origin', 'position',
  'quotes', 'resize', 'right', 'tab-size', 'table-layout', 'text-align', 'text-align-last',
  'text-decoration', 'text-decoration-color', 'text-decoration-line', 'text-decoration-style',
  'text-indent', 'text-justify', 'text-overflow', 'text-shadow', 'text-transform', 'top',
  'transform', 'transform-origin', 'transform-style', 'transition', 'transition-delay',
  'transition-duration', 'transition-property', 'transition-timing-function', 'unicode-bidi',
  'vertical-align', 'visibility', 'white-space', 'width', 'word-break', 'word-spacing', 'word-wrap',
  'z-index', 'text-size-adjust', 'tap-highlight-color'
];

const _borderStyles = [
  'dashed', 'dotted', 'double', 'groove', 'hidden', 'inset', 'none', 'outset', 'ridge', 'solid'
];

const propertyValues = {
  'align-content': ['center', 'flex-end', 'flex-start', 'space-around', 'space-between', 'stretch'],
  'align-items': ['baseline', 'center', 'flex-end', 'flex-start', 'stretch'],
  'align-self': ['auto', 'baseline', 'center', 'flex-end', 'flex-start', 'stretch'],
  'alignment-baseline': [
    'after-edge', 'alphabetic', 'auto', 'baseline', 'before-edge', 'central', 'hanging',
    'ideographic', 'mathematical', 'middle', 'text-after-edge', 'text-before-edge'
  ],
  'animation-direction': ['alternate', 'alternate-reverse', 'normal', 'reverse'],
  'animation-fill-mode': ['backwards', 'both', 'forwards', 'none'],
  'animation-play-state': ['paused', 'running'],
  'animation-timing-function': [
    'cubic-bezier', 'ease', 'ease-in', 'ease-in-out', 'ease-out', 'linear', 'step-end',
    'step-start', 'steps'
  ],
  'background-clip': ['border-box', 'content-box', 'padding-box'],
  'background-origin': ['border-box', 'content-box', 'padding-box'],
  'background-repeat': ['no-repeat', 'repeat', 'repeat-x', 'repeat-y', 'round', 'space'],
  'background-size': ['contain', 'cover'],
  'baseline-shift': ['baseline', 'sub', 'super'],
  border: _borderStyles,
  'border-bottom-style': _borderStyles,
  'border-bottom-width': ['medium', 'thick', 'thin'],
  'border-collapse': ['collapse', 'separate'],
  'border-image': ['repeat', 'stretch'],
  'border-left-style': _borderStyles,
  'border-left-width': ['medium', 'thick', 'thin'],
  'border-right-style': _borderStyles,
  'border-right-width': ['medium', 'thick', 'thin'],
  'border-style': _borderStyles,
  'border-top-style': _borderStyles,
  'border-top-width': ['medium', 'thick', 'thin'],
  'border-width': ['medium', 'thick', 'thin'],
  'box-align': ['baseline', 'center', 'end', 'start', 'stretch'],
  'box-direction': ['normal', 'reverse'],
  'box-lines': ['multiple', 'single'],
  'box-orient': ['block-axis', 'horizontal', 'inline-axis', 'vertical'],
  'box-reflect': ['above', 'below', 'left', 'right'],
  'box-shadow': ['inset', 'none'],
  'box-sizing': ['border-box', 'content-box'],
  'caption-side': ['bottom', 'top'],
  clear: ['both', 'left', 'none', 'right'],
  clip: ['auto'],
  'clip-path': ['none'],
  'clip-rule': ['evenodd', 'nonzero'],
  'color-interpolation': ['linearrgb'],
  'color-rendering': ['auto', 'optimizeQuality', 'optimizeSpeed'],
  content: ['close-quote', 'list-item', 'no-close-quote', 'no-open-quote', 'open-quote'],
  cursor: [
    'alias', 'all-scroll', 'auto', 'cell', 'col-resize', 'context-menu', 'copy', 'crosshair',
    'default', 'e-resize', 'ew-resize', 'help', 'move', 'n-resize', 'ne-resize', 'nesw-resize',
    'no-drop', 'none', 'not-allowed', 'ns-resize', 'nw-resize', 'nwse-resize', 'pointer',
    'progress', 'row-resize', 's-resize', 'se-resize', 'sw-resize', 'text', 'vertical-text',
    'w-resize', 'wait'
  ],
  direction: ['ltr', 'rtl'],
  display: [
    'block', 'flex', 'grid', 'inline', 'inline-block', 'inline-flex', 'inline-grid', 'inline-table',
    'list-item', 'none', 'run-in', 'table', 'table-caption', 'table-cell', 'table-column',
    'table-column-group', 'table-footer-group', 'table-header-group', 'table-row', 'table-row-group'
  ],
  'dominant-baseline': [
    'alphabetic', 'auto', 'central', 'hanging', 'ideographic', 'mathematical', 'middle',
    'no-change', 'reset-size', 'text-after-edge', 'text-before-edge', 'use-script'
  ],
  'empty-cells': ['hide', 'show'],
  'enable-background': ['accumulate', 'new'],
  'flex-direction': ['column', 'column-reverse', 'row', 'row-reverse'],
  'flex-wrap': ['nowrap', 'wrap', 'wrap-reverse'],
  'float': ['left', 'none', 'right'],
  'font-family': ['cursive', 'fantasy', 'monospace', 'sans-serif', 'serif'],
  'font-size': [
    'large', 'larger', 'medium', 'small', 'smaller', 'x-large', 'x-small', 'xx-large', 'xx-small'
  ],
  'font-stretch': [
    'condensed', 'expanded', 'extra-condensed', 'extra-expanded', 'narrower', 'normal',
    'semi-condensed', 'semi-expanded', 'ultra-condensed', 'ultra-expanded', 'wider'
  ],
  'font-style': ['italic', 'normal', 'oblique'],
  'font-variant': ['normal', 'small-caps'],
  'font-weight': [
    '100', '200', '300', '400', '500', '600', '700', '800', '900', 'bold', 'bolder', 'lighter',
    'normal'
  ],
  'image-rendering': ['auto', 'optimizeQuality', 'optimizeSpeed', 'pixelated'],
  'image-resolution': ['from-image', 'snap'],
  'justify-content': ['center', 'flex-end', 'flex-start', 'space-around', 'space-between'],
  'letter-spacing': ['normal'],
  'line-height': ['normal'],
  'list-style-image': ['none'],
  'list-style-position': ['hanging', 'inside', 'outside'],
  'list-style-type': [
    'afar', 'amharic', 'amharic-abegede', 'arabic-indic', 'armenian', 'asterisks', 'bengali',
    'binary', 'cambodian', 'circle', 'cjk-earthly-branch', 'cjk-heavenly-stem', 'cjk-ideographic',
    'decimal', 'decimal-leading-zero', 'devanagari', 'disc', 'ethiopic', 'ethiopic-abegede',
    'ethiopic-abegede-am-et', 'ethiopic-abegede-gez', 'ethiopic-abegede-ti-er',
    'ethiopic-abegede-ti-et', 'ethiopic-halehame-aa-er', 'ethiopic-halehame-aa-et',
    'ethiopic-halehame-am-et', 'ethiopic-halehame-gez', 'ethiopic-halehame-om-et',
    'ethiopic-halehame-sid-et', 'ethiopic-halehame-so-et', 'ethiopic-halehame-ti-er',
    'ethiopic-halehame-ti-et', 'ethiopic-halehame-tig', 'footnotes', 'georgian', 'gujarati',
    'gurmukhi', 'hangul', 'hangul-consonant', 'hebrew', 'hiragana', 'hiragana-iroha', 'inline',
    'kannada', 'katakana', 'katakana-iroha', 'khmer', 'lao', 'lower-alpha', 'lower-armenian',
    'lower-greek', 'lower-hexadecimal', 'lower-latin', 'lower-norwegian', 'lower-roman',
    'malayalam', 'mongolian', 'myanmar', 'none', 'octal', 'oriya', 'oromo', 'persian', 'sidama',
    'somali', 'square', 'telugu', 'thai', 'tibetan', 'tigre', 'tigrinya-er', 'tigrinya-er-abegede',
    'tigrinya-et', 'tigrinya-et-abegede', 'upper-alpha', 'upper-armenian', 'upper-greek',
    'upper-hexadecimal', 'upper-latin', 'upper-norwegian', 'upper-roman', 'urdu'
  ],
  margin: ['auto'],
  'margin-after-collapse': ['collapse', 'discard', 'separate'],
  'margin-before-collapse': ['collapse', 'discard', 'separate'],
  'margin-bottom': ['auto'],
  'margin-bottom-collapse': ['collapse', 'discard', 'separate'],
  'margin-left': ['auto'],
  'margin-right': ['auto'],
  'margin-top': ['auto'],
  'margin-top-collapse': ['collapse', 'discard', 'separate'],
  'max-height': ['none'],
  'max-width': ['none'],
  outline: _borderStyles,
  'outline-color': ['invert'],
  'outline-style': _borderStyles,
  'outline-width': ['medium', 'thick', 'thin'],
  overflow: ['auto', 'hidden', 'overlay', 'scroll', 'visible'],
  'overflow-wrap': ['break-word', 'normal'],
  'overflow-x': ['auto', 'hidden', 'overlay', 'scroll', 'visible'],
  'overflow-y': ['auto', 'hidden', 'overlay', 'scroll', 'visible'],
  'page-break-after': ['always', 'auto', 'avoid', 'left', 'right'],
  'page-break-before': ['always', 'auto', 'avoid', 'left', 'right'],
  'page-break-inside': ['auto', 'avoid'],
  perspective: ['none'],
  'perspective-origin': ['bottom', 'center', 'left', 'right', 'top'],
  'pointer-events': [
    'all', 'auto', 'bounding-box', 'fill', 'none', 'painted', 'stroke', 'visible', 'visiblefill',
    'visiblepainted', 'visiblestroke'
  ],
  position: ['absolute', 'fixed', 'relative', 'static'],
  resize: ['both', 'horizontal', 'none', 'vertical'],
  size: ['a3', 'a4', 'a5', 'b4', 'b5', 'landscape', 'ledger', 'legal', 'letter', 'portrait'],
  speak: ['digits', 'literal-punctuation', 'no-punctuation', 'none', 'normal', 'spell-out'],
  'stroke-linejoin': ['bevel', 'miter', 'round'],
  'table-layout': ['auto', 'fixed'],
  'text-align': ['center', 'end', 'justify', 'left', 'right', 'start'],
  'text-align-last': ['auto', 'center', 'end', 'justify', 'left', 'right', 'start'],
  'text-decoration': ['blink', 'line-through', 'overline', 'underline'],
  'text-overflow': ['clip', 'ellipsis'],
  'text-overflow-mode': ['clip', 'ellipsis'],
  'text-rendering': ['auto', 'geometricPrecision', 'optimizeLegibility', 'optimizeSpeed'],
  'text-transform': ['capitalize', 'lowercase', 'none', 'uppercase'],
  transform: [
    'matrix', 'matrix3d', 'perspective', 'rotate', 'rotate3d', 'rotateX', 'rotateY', 'rotateZ',
    'scale', 'scale3d', 'scaleX', 'scaleY', 'skew', 'skewX', 'skewY', 'translate', 'translate3d',
    'translateX', 'translateY', 'translateZ'
  ],
  'transform-origin': ['bottom', 'center', 'left', 'right', 'top'],
  'transform-style': ['flat', 'preserve-3d'],
  'transition-timing-function': [
    'cubic-bezier', 'ease', 'ease-in', 'ease-in-out', 'ease-out', 'linear', 'step-end',
    'step-start', 'steps'
  ],
  'unicode-bidi': ['bidi-override', 'embed', 'isolate', 'isolate-override', 'normal', 'plaintext'],
  'vertical-align': [
    'baseline', 'bottom', 'middle', 'sub', 'super', 'text-bottom', 'text-top', 'top'
  ],
  visibility: ['collapse', 'hidden', 'visible'],
  'white-space': ['normal', 'nowrap', 'pre', 'pre-line', 'pre-wrap'],
  'word-break': ['break-all', 'break-word', 'normal'],
  'word-spacing': ['normal'],
  'word-wrap': ['break-word', 'normal'],
  zoom: ['document', 'normal', 'reset']
};

const inheritableProperties = new Set([
  'border-collapse', 'border-spacing', 'caption-side', 'color', 'cursor', 'direction',
  'empty-cells', 'font-family', 'font-size', 'font-style', 'font-variant', 'font-weight', 'font',
  'letter-spacing', 'line-height', 'list-style-image', 'list-style-position', 'list-style-type',
  'list-style', 'orphans', 'quotes', 'text-align', 'text-indent', 'text-transform', 'visibility',
  'white-space', 'widows', 'word-spacing'
]);

const colorProperties = new Set([
  'background-color', 'background-image', 'background', 'border', 'border-bottom',
  'border-bottom-color', 'border-color', 'border-left border-left-color', 'border-right',
  'border-right-color', 'border-top', 'border-top-color', 'box-shadow', 'color', 'column-rule',
  'column-rule-color', 'outline', 'outline-color', 'text-decoration', 'text-decoration-color',
  'text-shadow', 'tap-highlight-color'
]);

export default {
  forbiddenProperties,
  validProperties,
  propertyValues,
  inheritableProperties,
  colorProperties
};
