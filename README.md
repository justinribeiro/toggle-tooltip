# toggle-tooltip

A small (8KB), accessible, fast, and WCAG 2.1 compliant toggle style tooltip web component using role=status.

## Features
1. WCAG 2.1 compliant:
2. Fast: no jank repaint (turn on paint flashing in DevTools...nada)
3. Screen reader friendly (interaction model allows explicit feedback)
4. Supports optional hover (which is also compliant with WCAG 1.4.13)
5. Basic styling with CSS custom properties

## Demo /  Screen Reader
To see the tooltip in action within JAWS 2020, see
https://www.youtube.com/watch?v=PNH0RTB9alg

## Install with Tools
Install the component:
```sh
npm i @justinribeiro/toggle-tooltip
# or
yarn add @justinribeiro/toggle-tooltip
```
## Install with CDN

If you want the paste-and-go version, you can simply load it via CDN:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@justinribeiro/toggle-tooltip@1.0.3/dist/index.js">
```

## Usage

Fire it up:
```html
<script type="module">
   import '@justinribeiro/toggle-tooltip/index.js';
</script>
<toggle-tooltip>
  ⓘ
  <span slot="tooltip">
    I'm a tooltip!
  </span>
</toggle-tooltip>
```

See other uses in `demo/index.html`.

## Development
```
$ git clone git@github.com:justinribeiro/toggle-tooltip.git
$ cd toggle-tooltip
$ yarn install
$ yarn start

# run the tests
$ yarn test
```

## Properties

| Property | Attribute | Type      | Default       | Description                                      |
|----------|-----------|-----------|---------------|--------------------------------------------------|
| `hover`  | `hover`   | `boolean` | false         | Setting `hover` as attribute on component allows for the mouseover and<br />mouseout events to become active for this instance of the `toggle-tooltip`<br /><br />Note: this mode is complaint with WCAG SC 1.4.13 Content on Hover or Focus<br /><br />TODO: I suppose I could watch for the change and then add/remove the event<br />handlers...but I don't have a use case for the at the moment |
| `label`  | `label`   | `string`  | "'more info'" | Define the internal button aria-label when an svg icon or other non-text<br />is used |
| `show`   | `show`    | `boolean` | "'more info'" | Define the internal button aria-label when an svg icon or other non-text<br />is used |

## Methods

| Method  | Type                          | Description                                      |
|---------|-------------------------------|--------------------------------------------------|
| `close` | `(noReFocus?: boolean): void` | Close the tooltip<br /><br />**oReFocus**: Don't refocus to the button (probably because we<br />tabbed off and are moving through the document) |
| `open`  | `(): void`                    | Open the tooltip and focus to it                 |

## Slots

| Name      | Description                                      |
|-----------|--------------------------------------------------|
|           | Default slot injects into button value, useful for icon |
| `tooltip` | Any message or links you'd like in the tooltip status message |

## CSS Custom Properties

| Property                                   | Default          |
|--------------------------------------------|------------------|
| `--toggle-tooltip-button-background-color` | "transparent"    |
| `--toggle-tooltip-button-border`           | "none"           |
| `--toggle-tooltip-button-padding`          | 0                |
| `--toggle-tooltip-status-background-color` | "#fafafa"        |
| `--toggle-tooltip-status-border`           | "1px solid #ccc" |
| `--toggle-tooltip-status-border-radius`    | "0.5rem"         |
| `--toggle-tooltip-status-box-shadow`       | "none"           |
| `--toggle-tooltip-status-padding`          | "1rem"           |
