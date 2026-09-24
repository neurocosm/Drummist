// Display ordering only: key assignments and playback stay independent.
export function groupSoundMap(sounds) {
  if (Object.values(sounds).some(sound => Number.isInteger(sound.order))) {
    const grouped = new Map();
    for (const entry of Object.entries(sounds).sort((a,b) => (a[1].order ?? Infinity) - (b[1].order ?? Infinity))) {
      const name = entry[0] === ' ' ? 'Rest' : entry[1].category || 'Effects';
      if (!grouped.has(name)) grouped.set(name, {name, entries: []});
      grouped.get(name).entries.push(entry);
    }
    return [...grouped.values()];
  }
  const names = ['Kicks', 'Snares', 'Hi-hats', 'Toms', 'Cymbals', 'Other percussion', 'Rest'];
  const groups = names.map(name => ({ name, entries: [] }));
  for (const entry of Object.entries(sounds)) {
    const [key, sound] = entry;
    const label = sound.name || '';
    const role = sound.role || '';
    let index = 5;
    if (key === ' ') index = 6;
    else if (/click|cross-stick|rim click|cowbell/i.test(label) || role === 'rim') index = 5;
    else if (role === 'kick' || /\bkick\b/i.test(label)) index = 0;
    else if (role === 'snare' || /\bsnare\b/i.test(label)) index = 1;
    else if (role.includes('hat') || /hi.?hat/i.test(label)) index = 2;
    else if (role.includes('tom') || /\btom\b/i.test(label)) index = 3;
    else if (['crash', 'ride'].includes(role) || /crash|cymbal|ride|china|splash/i.test(label)) index = 4;
    groups[index].entries.push(entry);
  }
  const keyboardOrder = "1234567890qwertyuiopasdfghjklzxcvbnm[],./;'-=`!@#$\\";
  for (const group of groups) group.entries.sort((a, b) => keyboardOrder.indexOf(a[0]) - keyboardOrder.indexOf(b[0]));
  const tomBrandOrder = sound => {
    const brand = ['Yamaha', 'Pearl', 'Ludwig'].findIndex(name => sound.name.includes(name));
    return brand >= 0 ? brand : /roto-tom/i.test(sound.name) ? 3 : 4;
  };
  // Roto-toms have no documented diameter: order those low to high instead.
  const tomSizeOrder = sound => Number(sound.name.match(/^(\d+)-inch/)?.[1]) || ({'high-tom': 1, 'mid-tom': 2, 'low-tom': 3}[sound.role] || 0);
  groups[3].entries.sort((a, b) => tomBrandOrder(a[1]) - tomBrandOrder(b[1]) || tomSizeOrder(b[1]) - tomSizeOrder(a[1]));
  return groups.filter(group => group.entries.length);
}

