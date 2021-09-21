/* eslint-disable class-methods-use-this */
import { html, css, LitElement } from 'lit';
import { state, property, query } from 'lit/decorators.js';

/**
 * An accessible, fast, and WCAG 2.1 compliant toggle style tooltip web component using role=status.
 *
 * ## Features
 * 1. WCAG 2.1 compliant:
 * 2. Fast: no jank repaint (turn on paint flashing in DevTools...nada)
 * 3. Screen reader friendly (interaction model allows explicit feedback)
 * 4. Supports optional hover (which is also compliant with WCAG 1.4.3)
 * 5. Basic styling with CSS custom properties
 *
 * ## Demo /  Screen Reader
 * To see the tooltip in action within JAWS 2020, see
 * https://www.youtube.com/watch?v=PNH0RTB9alg
 *
 * ## Install with Tools
 * Install the component:
 * ```sh
 * npm i @justinribeiro/toggle-tooltip
 * # or
 * yarn add @justinribeiro/toggle-tooltip
 * ```
 * ## Install with CDN
 *
 * If you want the paste-and-go version, you can simply load it via CDN:
 *
 * ```html
 * <script type="module" src="https://cdn.jsdelivr.net/npm/@justinribeiro/toggle-tooltip@1.0.2/dist/index.js">
 * ```
 *
 * ## Usage
 * Fire it up:
 * ```html
 * <script type="module">
 *   import '@justinribeiro/toggle-tooltip/index.js';
 * </script>
 * <toggle-tooltip>
 *  ⓘ
 *  <span slot="tooltip">
 *    I'm a tooltip!
 *  </span>
 * </toggle-tooltip>
 * ```
 *
 * See other uses in `demo/index.html`.
 *
 * ## Development
 * ```
 * $ git clone git@github.com:justinribeiro/toggle-tooltip.git
 * $ cd toggle-tooltip
 * $ yarn install
 * $ yarn start
 *
 * # run the tests
 * $ yarn test
 * ```
 *
 * @element toggle-tooltip
 *
 * @slot - Default slot injects into button value, useful for icon
 * @slot tooltip - Any message or links you'd like in the tooltip status message
 *
 * @cssprop [--toggle-tooltip-status-border=1px solid #ccc]
 * @cssprop [--toggle-tooltip-status-background-color=#fafafa]
 * @cssprop [--toggle-tooltip-status-padding=1rem]
 * @cssprop [--toggle-tooltip-status-border-radius=0.5rem]
 * @cssprop [--toggle-tooltip-status-box-shadow=none]
 * @cssprop [--toggle-tooltip-button-border=none]
 * @cssprop [--toggle-tooltip-button-background-color=transparent]
 * @cssprop [--toggle-tooltip-button-padding=0]
 */
export class ToggleTooltip extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
      position: relative;
      pointer-events: auto;

      --toggle-tooltip-status-border: 1px solid #ccc;
      --toggle-tooltip-status-background-color: #fafafa;
      --toggle-tooltip-status-padding: 1rem;
      --toggle-tooltip-status-border-radius: 0.5rem;
      --toggle-tooltip-status-box-shadow: none;

      --toggle-tooltip-button-border: none;
      --toggle-tooltip-button-background-color: transparent;
      --toggle-tooltip-button-padding: 0;
    }

    button {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
      border: var(--toggle-tooltip-button-border);
      background-color: var(--toggle-tooltip-button-background-color);
      padding: var(--toggle-tooltip-button-padding);
      cursor: pointer;
    }

    div[role='status'] {
      position: absolute;
      z-index: 2;
      border: var(--toggle-tooltip-status-border);
      background: var(--toggle-tooltip-status-background-color);
      padding: var(--toggle-tooltip-status-padding);
      border-radius: var(--toggle-tooltip-status-border-radius);
      box-shadow: var(--toggle-tooltip-status-box-shadow);

      /*
        This is a bit specific to making the case respectively
        accessible for as many users as possible and is purely my opinion
      */
      width: calc(100vw - var(--toggle-tooltip-status-padding) * 2);
      max-width: calc(300px - var(--toggle-tooltip-status-padding) * 2);

      transform: translateX(-1000%);
      transition: opacity 300ms;
      will-change: opacity;
      opacity: 0;
    }

    /*
      This is a cheeky workaround so that we can focus the div but *not* use
      the focus outline since the element is not interactive.

      The reason for this is so that we can throw focus for screen readers so
      that readout is correct (particularly for JAWS 2020+, which has issues
      reading the role=status when brought back to the viewport)
    */
    div[role='status']:focus {
      outline: none;
    }

    :host([show]) div[role='status'] {
      opacity: 1;
      transform: var(--int-tooltip-transform);
    }

    @media (prefers-reduced-motion) {
      div[role='status'] {
        transition: none;
      }
    }
  `;

  /**
   * Setting `hover` as attribute on component allows for the mouseover and
   * mouseout events to become active for this instance of the `toggle-tooltip`
   *
   * Note: this mode is complaint with WCAG SC 1.4.13 Content on Hover or Focus
   *
   * TODO: I suppose I could watch for the change and then add/remove the event
   * handlers...but I don't have a use case for the at the moment
   * @attr
   */
  @property({ type: Boolean }) hover = false;

  /**
   * Define the internal button aria-label when an svg icon or other non-text
   * is used
   * @default 'more info'
   * @attr
   */
  @property({ type: String, reflect: true }) label = 'more info';

  /**
   * Define the internal button aria-label when an svg icon or other non-text
   * is used
   * @default 'more info'
   * @attr
   */
  @property({ type: Boolean, reflect: true }) show = false;

  /**
   * Hold the current active state of the tooltip
   * @state
   * @protected
   */
  @state() protected __tooltipActive = false;

  /**
   * DOM holder for status div for the tooltip message
   * @type {HTMLDivElement}
   */
  @query('div[role=status]') __tooltipDom!: HTMLDivElement;

  /**
   * DOM holder for tooltip button
   * @type {HTMLDivElement}
   */
  @query('button') __tooltipButton!: HTMLButtonElement;

  private KEYCODE = Object.freeze({
    ESC: 'Escape',
    ENTER: 'Enter',
    SPACE: 'Space',
    TAB: 'Tab',
  });

  connectedCallback() {
    // eslint-disable-next-line wc/guard-super-call
    super.connectedCallback();
    window.addEventListener('keyup', this.__keyboardIsEscape.bind(this));
  }

  firstUpdated() {
    if (this.hover) {
      this.addEventListener('mouseover', this.__handleMouseOver, true);
      this.addEventListener('mouseout', this.__handleMouseOut, true);
    }
  }

  disconnectedCallback() {
    // eslint-disable-next-line wc/guard-super-call
    super.disconnectedCallback();
    window.removeEventListener('keydown', this.__keyboardIsEscape.bind(this));
  }

  /**
   * Close the tooltip
   * @param {boolean} oReFocus Don't refocus to the button (probably because we
   * tabbed off and are moving through the document)
   */
  close(noReFocus = false): void {
    this.__tooltipDom.blur();
    this.__tooltipActive = false;
    this.removeAttribute('show');
    if (!noReFocus) {
      this.__tooltipButton.focus();
    }
    this.style.setProperty('--int-tooltip-transform', `0`);
  }

  /**
   * Open the tooltip and focus to it
   */
  open(): void {
    if (!this.__tooltipActive) {
      this.__tooltipActive = true;
      this.__transformPositionCalculation();
      this.setAttribute('show', '');
      this.__tooltipDom.focus();
    }
  }

  /**
   * Handle keyboard events to handle display state of the component to handle
   * WCAG SC 1.4.13 (Dismissible)
   * @private
   * @param {KeyboardEvent} event
   */
  private __keyboardIsEscape(event: KeyboardEvent): void {
    // We always check to see if the tooltip was active before running the close
    // because otherwise we're likely to set the return focus to the wrong
    // target (which may still happen because other handlers from other
    // non-tooltips could take over focus on the esc key as well), which is to
    // say, this is a best effort
    if (this.__tooltipActive && event.code === this.KEYCODE.ESC) {
      this.close();
    }

    if (this.__tooltipActive && event.code === this.KEYCODE.TAB) {
      // Look within the composedPath() to determine whether or not we're still
      // in the component focus (particularly in cases where there is
      // interactive content within the <slot>)
      // eslint-disable-next-line array-callback-return
      const found = event.composedPath().find(i => {
        if (i === this) {
          return true;
        }
        return false;
      });
      if (!found) {
        // pass true because a tab action is moving forward in the document and
        // we don't want to bounce the user
        this.close(true);
      }
    }
  }

  /**
   * Handle the mouseover action by opening the tooltip
   */
  private __handleMouseOver(): void {
    this.open();
  }

  /**
   * Handle the mouseout action by checking the current state and closing the
   * tooltip (if required)
   */
  private __handleMouseOut(): void {
    if (this.__tooltipActive) {
      this.close();
    }
  }

  /**
   * Toggle the state of the tooltip when the user operates the button via
   * click, tap, or keyboard interaction
   */
  private __toggleTooltip(): void {
    if (this.__tooltipActive) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Calculate and set the css transform for the tooltip open() based on the
   * web component position within the DOM.
   *
   * Note: this function will set the CSS custom property
   * `--int-tooltip-transform` and does not directly modify the style
   */
  private __transformPositionCalculation(): void {
    let translateX: String;
    let translateY: String;

    // Not a cheap set of operations, but we don't have a lot of choice
    const tooltipRect = this.__tooltipDom.getBoundingClientRect();
    const buttonRect = this.__tooltipButton.getBoundingClientRect();
    const windowWidth = window.innerWidth;

    // Run some checks to see where we are in the DOM for the positioning
    // This errs hard on conservative with some safety checks to reduce the need
    // to do width last revs
    const isButtonLeftWeighted =
      buttonRect.x - tooltipRect.width / 2 < 0 || windowWidth < 390;
    const isButtonTopWeighted = buttonRect.y - tooltipRect.height < 0;
    const isButtonRightWeighted =
      windowWidth - buttonRect.x - tooltipRect.width / 2 < 0;

    // There is a very high likelihood that we're:
    //   a) on a very small screen (< 320px)
    //   b) WCAG SC 1.4.10 Reflow 1280@400% (ADA)
    // in which case, we're going to play the lesser of two evils and we're
    // to weight against the innerWidth of the window and the width of the
    // tooltip itself so that we get something that's generally more
    // functional
    // NOTE: this is unlikely to meet design system criteria and you
    // ** should not ** attempt to make it so (otherwise you're going to burn)
    // the edge case.
    let screenEdgePadding: number;
    if (windowWidth < 360) {
      screenEdgePadding = (windowWidth - tooltipRect.width) / 2;
    } else {
      // hacky-ish 1rem
      screenEdgePadding = 16;
    }

    // First, check if we're wedged to the left or right
    if (isButtonLeftWeighted) {
      translateX = `translateX(${-buttonRect.x + screenEdgePadding}px)`;
    } else if (isButtonRightWeighted) {
      translateX = `translateX(${-(tooltipRect.width - screenEdgePadding)}px)`;
    } else {
      translateX = `translateX(${
        -(tooltipRect.width / 2) + buttonRect.width
      }px)`;
    }

    // Second, check if we have enough space to open to the top (preferred) or
    // if we have to shift to the bottom
    if (isButtonTopWeighted) {
      // go low
      translateY = `translateY(${
        buttonRect.y - tooltipRect.y + buttonRect.height
      }px)`;
    } else {
      translateY = `translateY(${-(
        buttonRect.y -
        tooltipRect.y +
        tooltipRect.height
      )}px)`;
    }

    // This sets the CSS custom prop against the _local_ instance of the
    // component; this won't bleed the scope, and don't set this to :root
    // otherwise you'll have stuff scattered all over
    this.style.setProperty(
      '--int-tooltip-transform',
      `${translateX} ${translateY}`
    );
  }

  render() {
    return html`
      <button @click="${this.__toggleTooltip}" aria-label="${this.label}">
        <slot></slot>
      </button>
      <div role="status" tabindex="-1"><slot name="tooltip"></slot></div>
    `;
  }
}

// you $#%^& suck ts-jest and ts-node and all your %^&*()
// eslint-disable-next-line no-unused-expressions
!window.customElements.get('toggle-tooltip')
  ? window.customElements.define('toggle-tooltip', ToggleTooltip)
  : null;

declare global {
  interface HTMLElementTagNameMap {
    'toggle-tooltip': ToggleTooltip;
  }
}
