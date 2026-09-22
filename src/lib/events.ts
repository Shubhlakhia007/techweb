import { choice, HttpError, text } from './http';

export const eventModeLabel = (mode: string) => mode === 'hybrid' ? 'Online + in person' : mode === 'online' ? 'Online' : 'In person';
export const eventScopeLabel = (scope: string) => scope === 'global' ? 'Global' : scope === 'local' ? 'Local' : 'Reach not specified';

export function eventDateValue(value: unknown) {
  const date = text(value, 'Date', 10, true);
  if (date && (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date)) throw new HttpError('Enter a valid date.');
  return date || null;
}

export function eventRounds(value: unknown) {
  if (!Array.isArray(value) || !value.length || value.length > 12) throw new HttpError('Add between 1 and 12 rounds.');
  let lastDate = '';
  return value.map((round, position) => {
    if (!round || typeof round !== 'object') throw new HttpError('Invalid round.');
    const mode = choice(round.mode, ['online', 'offline'], 'round format');
    const date = eventDateValue(round.date);
    if (date && lastDate && date < lastDate) throw new HttpError('Round dates must follow the order of the rounds.');
    if (date) lastDate = date;
    return { position, name: text(round.name, 'Round name', 100), mode, date,
      location: text(round.location, 'In-person round venue / city', 200, mode === 'online') || null };
  });
}
