/* eslint-disable import/no-duplicates */
import { html, fixture, expect } from '@open-wc/testing';
import { setViewport } from '@web/test-runner-commands';

import { ToggleTooltip } from '../src/index.js';
import '../src/index.js';

const baseTemplate = html`
  <toggle-tooltip>ⓘ<span slot=tooltip>I am a sample tooltip.</span></toggle-tooltip>
`;

describe('<toggle-tooltip>', () => {
  it('has a default label for button', async () => {
    const el = await fixture<ToggleTooltip>(html`<toggle-tooltip></toggle-tooltip>`);
    expect(el.label).to.equal('more info');
  });

  it('can override default label via attribute', async () => {
    const el = await fixture<ToggleTooltip>(html`<toggle-tooltip label="test"></toggle-tooltip>`);
    expect(el.label).to.equal('test');
  });

  it('button click opens tooltip', async () => {
    const el = await fixture<ToggleTooltip>(baseTemplate);
    await el.updateComplete;
    el.shadowRoot?.querySelector('button')?.click();
    expect(el.show).to.be.true;
  });

  it('button click sets css custom prop position', async () => {
    const el = await fixture<ToggleTooltip>(baseTemplate);
    await el.updateComplete;
    el.shadowRoot?.querySelector('button')?.click();
    const transform = el.style.getPropertyValue('--int-tooltip-transform');
    expect(transform).to.not.be.empty;
  });

  it('button click closes tooltip', async () => {
    const el = await fixture<ToggleTooltip>(baseTemplate);
    await el.updateComplete;
    el.shadowRoot?.querySelector('button')?.click();
    expect(el.show).to.be.true;
    el.shadowRoot?.querySelector('button')?.click();
    expect(el.show).to.be.false;
  });

  it('open() call opens tooltip', async () => {
    const el = await fixture<ToggleTooltip>(baseTemplate);
    await el.updateComplete;
    el.open();
    expect(el.show).to.be.true;
  });

  it('close() call closes tooltip', async () => {
    const el = await fixture<ToggleTooltip>(baseTemplate);
    await el.updateComplete;
    el.open();
    expect(el.show).to.be.true;
    el.close();
    expect(el.show).to.be.false;
  });

  it('On open, document.activeElement focus should be set to tooltip', async () => {
    const el = await fixture<ToggleTooltip>(baseTemplate);
    await el.updateComplete;
    el.open();
    expect(document.activeElement).to.equal(el);
  });

  it('On close, document.activeElement focus should be set to tooltip', async () => {
    const el = await fixture<ToggleTooltip>(baseTemplate);
    await el.updateComplete;
    el.open();
    el.close();
    expect(document.activeElement).to.equal(el);
  });

  it('Internally on open, activeElement focus should be set to div[role=status]', async () => {
    const el = await fixture<ToggleTooltip>(baseTemplate);
    await el.updateComplete;
    el.open();
    expect(el.shadowRoot?.activeElement).to.equal(el.shadowRoot?.querySelector('div[role=status]'));
  });

  it('Internally on close, activeElement focus should be set to button', async () => {
    const el = await fixture<ToggleTooltip>(baseTemplate);
    await el.updateComplete;
    el.open();
    el.close();
    expect(el.shadowRoot?.activeElement).to.equal(el.shadowRoot?.querySelector('button'));
  });

  it('After open, ESC key should close tooltip', async () => {
    const el = await fixture<ToggleTooltip>(baseTemplate);
    await el.updateComplete;
    el.open();
    expect(el.show).to.be.true;
    window.dispatchEvent(new KeyboardEvent('keyup', { 'code': 'Escape' }));
    expect(el.show).to.be.false;
  });

  it('After open, TAB key should close tooltip when no interactive elements in slot', async () => {
    const el = await fixture<ToggleTooltip>(baseTemplate);
    await el.updateComplete;
    el.open();
    expect(el.show).to.be.true;
    window.dispatchEvent(new KeyboardEvent('keyup', { 'code': 'Tab' }));
    expect(el.show).to.be.false;
  });

  // BROKEN; dispatchEvent won't have a composedPath() so the test will fail
  // it('After open, TAB key should not close tooltip when interactive elements in slot', async () => {
  //   const el = await fixture<ToggleTooltip>(html`<toggle-tooltip>ⓘ<span slot=tooltip>I am a sample tooltip. <button>interactive focus</button></span></toggle-tooltip>`);
  //   await el.updateComplete;
  //   el.shadowRoot?.querySelector('button')?.focus();
  //   el.shadowRoot?.querySelector('button')?.click();
  //   expect(el.show).to.be.true;
  //   el.dispatchEvent(new KeyboardEvent('keyup', { 'code': 'Tab' }));
  //   expect(el.show).to.be.true;
  // });

  it('if hover attr set, prop should be true', async () => {
    const el = await fixture<ToggleTooltip>(html`<toggle-tooltip hover>ⓘ<span slot=tooltip>I am a sample tooltip.</span></toggle-tooltip>`);
    await el.updateComplete;

    expect(el.hover).to.be.true;
  });

  it('if hover attr not set, prop should be false', async () => {
    const el = await fixture<ToggleTooltip>(baseTemplate);
    await el.updateComplete;

    expect(el.hover).to.be.false;
  });

  it('mouseover should open tooltip', async () => {
    const el = await fixture<ToggleTooltip>(baseTemplate);
    await el.updateComplete;

    // Work around to call private since I don't want to mock the hover
    // eslint-disable-next-line dot-notation
    el['__handleMouseOver']();

    expect(el.show).to.be.true;
  });

  it('mouseout should close tooltip', async () => {
    const el = await fixture<ToggleTooltip>(baseTemplate);
    await el.updateComplete;

    // Work around to call private since I don't want to mock the hover
    // eslint-disable-next-line dot-notation
    el['__handleMouseOver']();
    expect(el.show).to.be.true;
    // eslint-disable-next-line dot-notation
    el['__handleMouseOut']();
    expect(el.show).to.be.false;
  });

  it('test right edge alignment for viewport overflow on tooltip open', async () => {
    const el = await fixture<ToggleTooltip>(html`
      <toggle-tooltip style="float: right">ⓘ<span slot=tooltip>I am a sample tooltip.</span></toggle-tooltip>
    `);
    await el.updateComplete;
    el.open();

    expect(el.show).to.be.true;
    expect(window.innerWidth).to.equal(document.documentElement.scrollWidth);
  });

  it('test left edge alignment for viewport overflow on tooltip open', async () => {
    const el = await fixture<ToggleTooltip>(html`
      <toggle-tooltip style="float: left">ⓘ<span slot=tooltip>I am a sample tooltip.</span></toggle-tooltip>
    `);
    await el.updateComplete;
    el.open();

    expect(el.show).to.be.true;
    expect(window.innerWidth).to.equal(document.documentElement.scrollWidth);
  });

  it('test center alignment for 320px viewport overflow on tooltip open', async () => {
    await setViewport({ width: 320, height: 640 });

    const el = await fixture<ToggleTooltip>(html`
      <toggle-tooltip>ⓘ<span slot=tooltip>I am a sample tooltip.</span></toggle-tooltip>
    `);
    await el.updateComplete;
    el.open();

    expect(el.show).to.be.true;
    expect(window.innerWidth).to.equal(document.documentElement.scrollWidth);
  });

  it('test top position alignment on tooltip open', async () => {
    await setViewport({ width: 320, height: 640 });

    const el = await fixture<ToggleTooltip>(html`
      <toggle-tooltip style="margin-top: 10rem;">ⓘ<span slot=tooltip>I am a sample tooltip.</span></toggle-tooltip>
    `);
    await el.updateComplete;
    el.open();

    expect(el.show).to.be.true;
    expect(window.innerWidth).to.equal(document.documentElement.scrollWidth);
  });

  it('test center position alignment on tooltip open', async () => {
    await setViewport({ width: 1280, height: 640 });

    const el = await fixture<ToggleTooltip>(html`
      <toggle-tooltip style="margin-top: 10rem; margin-left: 10rem;">ⓘ<span slot=tooltip>I am a sample tooltip.</span></toggle-tooltip>
    `);
    await el.updateComplete;
    el.open();

    expect(el.show).to.be.true;
    expect(window.innerWidth).to.equal(document.documentElement.scrollWidth);
  });

  it('Is valid A11y via aXe', async () => {
    const el = await fixture<ToggleTooltip>(baseTemplate);
    await expect(el).shadowDom.to.be.accessible();
  });
});
