import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import TypeDrummer from './TypeDrummer';
import { soundPacks } from '../utils/soundPacks';

jest.mock('../utils/drumSounds', () => ({
  getAudioContext: () => ({currentTime: 0, destination: {}, resume: () => Promise.resolve(), createGain: () => ({connect() {}, disconnect() {}, gain: {setTargetAtTime: jest.fn()}})}),
  stopDrumSounds: jest.fn(),
}));
jest.mock('../utils/soundPacks', () => ({
  defaultSoundPack: 'test',
  soundPacks: {test: {name: 'Test', sounds: {a: {name: 'Kick', play: jest.fn()}, b: {name: 'Snare', play: jest.fn()}}}, other: {name: 'Other', sounds: {a: {name: 'Other kick', play: jest.fn()}}}},
}));
jest.mock('./BeatControls', () => ({setBpm, onLoadBeat}) => <div><button onClick={() => setBpm(120)}>Tempo</button><button onClick={() => onLoadBeat({text: 'ba', soundPack: 'test', bpm: 120})}>Load old beat</button></div>);
let container, root;
const click = text => act(() => [...container.querySelectorAll('button')].find(b => b.textContent === text || b.getAttribute('aria-label') === text).click());
const type = (index, value) => act(() => { const input = container.querySelectorAll('textarea')[index]; Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(input,value); input.dispatchEvent(new Event('input',{bubbles:true})); });
const advance = ms => act(() => jest.advanceTimersByTime(ms));
beforeEach(async () => {
  global.IS_REACT_ACT_ENVIRONMENT = true; jest.useFakeTimers(); jest.clearAllMocks();
  container = document.createElement('div'); document.body.appendChild(container); root=createRoot(container);
  await act(async () => {root.render(<React.StrictMode><TypeDrummer /></React.StrictMode>);});
});
afterEach(() => {act(() => root.unmount());container.remove();jest.useRealTimers();});
test('short track rests until the shared loop ends; pause resumes and stop resets', () => {
  click('Tempo'); type(0,'ab  '); click('Stop'); click('＋Add track'); type(1,'b'); click('Stop'); jest.clearAllMocks();
  click('Play'); expect(soundPacks.test.sounds.b.play).toHaveBeenCalledTimes(1);
  advance(125); expect(soundPacks.test.sounds.b.play).toHaveBeenCalledTimes(2);
  advance(250); expect(soundPacks.test.sounds.b.play).toHaveBeenCalledTimes(2);
  advance(125); expect(soundPacks.test.sounds.b.play).toHaveBeenCalledTimes(3);
  click('Pause'); advance(500); expect(soundPacks.test.sounds.b.play).toHaveBeenCalledTimes(3);
  click('Play'); expect(soundPacks.test.sounds.b.play).toHaveBeenCalledTimes(4);
  click('Stop'); jest.clearAllMocks(); click('Play'); expect(soundPacks.test.sounds.a.play).toHaveBeenCalledTimes(1);
});
test('mute and solo control playback without removing sequence lengths', () => {
  click('Tempo'); type(0,'a '); click('Stop'); click('＋Add track'); type(1,'b'); click('Stop');
  click('Solo track 2'); jest.clearAllMocks(); click('Play'); advance(250);
  expect(soundPacks.test.sounds.a.play).not.toHaveBeenCalled(); expect(soundPacks.test.sounds.b.play).toHaveBeenCalledTimes(2);
  click('Mute track 2'); advance(500); expect(soundPacks.test.sounds.b.play).toHaveBeenCalledTimes(2);
});
test('duplicate preserves text and caps tracks at four; old saves load as one stopped track', () => {
  type(0,'ab'); click('Stop'); click('Duplicate track 1'); click('Duplicate track 1'); click('Duplicate track 1');
  expect(container.querySelectorAll('textarea')).toHaveLength(4);
  expect([...container.querySelectorAll('textarea')].every(t => t.value === 'ab')).toBe(true);
  expect([...container.querySelectorAll('button')].some(b=>b.textContent.includes('Add track'))).toBe(false);
  click('Remove track 4');
  expect([...container.querySelectorAll('button')].some(b=>b.textContent.includes('Add track'))).toBe(true);
  click('Load old beat'); expect(container.querySelectorAll('textarea')).toHaveLength(1); expect(container.querySelector('textarea').value).toBe('ba'); expect(container.textContent).toContain('Stopped');
});

