import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import TypeDrummer from './TypeDrummer';
import { drumMapping, stopDrumSounds } from '../utils/drumSounds';
import { soundPacks } from '../utils/soundPacks';

jest.mock('../utils/drumSounds', () => ({
  drumMapping: { a: { name: 'Kick', play: jest.fn() }, b: { name: 'Snare', play: jest.fn() } },
  getAudioContext: () => ({ state: 'running', resume: () => Promise.resolve() }),
  stopDrumSounds: jest.fn(),
}));
jest.mock('../utils/soundPacks', () => ({
  defaultSoundPack: 'classic',
  soundPacks: { electronic: { name: 'Electronic', sounds: {
    a: { name: 'Electronic kick', play: jest.fn() },
    b: { name: 'Electronic snare', play: jest.fn() },
  } } },
}));
jest.mock('./BeatControls', () => ({ bpm, setBpm, setSoundPack, onLoadBeat }) => (
  <div>
    <button onClick={() => setBpm(60)}>Slow tempo</button>
    <button onClick={() => setSoundPack('electronic')}>Electronic</button>
    <button onClick={() => onLoadBeat({ text: 'ba', bpm: 120, soundPack: 'classic' })}>Load test beat</button>
  </div>
));

let container, root;
const click = label => act(() => [...container.querySelectorAll('button')]
  .find(button => button.textContent.trim() === label).click());
const type = value => act(() => {
  const input = container.querySelector('textarea');
  Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
});
const advance = ms => act(() => jest.advanceTimersByTime(ms));
const count = () => drumMapping.a.play.mock.calls.length + drumMapping.b.play.mock.calls.length;

beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  jest.useFakeTimers();
  jest.clearAllMocks();
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => root.render(<React.StrictMode><TypeDrummer /></React.StrictMode>));
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  jest.useRealTimers();
});

test('first character starts one loop; rapid edits cannot restart after Clear', () => {
  type('a');
  expect(count()).toBe(1);
  advance(125);
  expect(count()).toBe(2);
  type('ab');
  type('aba');
  click('Clear');
  const stopped = count();
  advance(1000);
  expect(count()).toBe(stopped);
  expect(container.querySelector('textarea').value).toBe('');
  expect(container.textContent).toContain('Stopped');
  expect(stopDrumSounds).toHaveBeenCalled();
});

test('Pause resumes at the next character; Stop resets to the beginning', () => {
  type('ab');
  click('Pause');
  advance(500);
  expect(count()).toBe(1);
  expect(container.textContent).toContain('Paused');
  click('Play');
  expect(drumMapping.b.play).toHaveBeenCalledTimes(1);
  click('Stop');
  const stopped = count();
  advance(1000);
  expect(count()).toBe(stopped);
  click('Play');
  expect(drumMapping.a.play).toHaveBeenCalledTimes(2);
});

test('tempo and pack replace the running loop, and cannot restart a stopped beat', () => {
  type('ab');
  click('Slow tempo');
  const before = count();
  advance(249);
  expect(count()).toBe(before);
  advance(1);
  expect(count()).toBe(before + 1);
  click('Electronic');
  const classic = count();
  advance(500);
  expect(count()).toBe(classic);
  expect(soundPacks.electronic.sounds.a.play).toHaveBeenCalled();
  expect(soundPacks.electronic.sounds.b.play).toHaveBeenCalled();
  click('Stop');
  click('Slow tempo');
  click('Load test beat');
  advance(1000);
  expect(count()).toBe(classic);
  expect(container.querySelector('textarea').value).toBe('ba');
  expect(container.textContent).toContain('Stopped');
});
