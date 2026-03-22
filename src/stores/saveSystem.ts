import Dexie, { type EntityTable } from 'dexie';

interface SaveRecord {
  id: number; // always 1 for single save slot
  data: string; // JSON stringified game state
  savedAt: string;
}

const db = new Dexie('PipSocketChronicle') as Dexie & {
  saves: EntityTable<SaveRecord, 'id'>;
};

db.version(1).stores({
  saves: 'id',
});

export async function saveGame(state: object): Promise<void> {
  await db.saves.put({
    id: 1,
    data: JSON.stringify(state),
    savedAt: new Date().toISOString(),
  });
}

export async function loadGame(): Promise<object | null> {
  const record = await db.saves.get(1);
  if (!record) return null;
  return JSON.parse(record.data);
}

export async function hasSaveData(): Promise<boolean> {
  const record = await db.saves.get(1);
  return !!record;
}

export async function deleteSave(): Promise<void> {
  await db.saves.delete(1);
}
