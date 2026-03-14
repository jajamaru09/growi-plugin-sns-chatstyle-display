export interface SpeakerDefinition {
  speaker: string;
  expression: string;
  iconUrl: string;
  position: 'left' | 'right';
}

export type SpeakerMap = Map<string, SpeakerDefinition>;

const CACHE_TTL_MS = 5 * 60 * 1000; // 5分
const VALID_NAME_PATTERN = /^[a-zA-Z0-9_-]+$/;
const VALID_URL_PATTERN = /^(\/|https?:\/\/)/;
const MARKDOWN_IMAGE_PATTERN = /!\[.*?\]\((.*?)\)/;

let cachedSpeakerMap: SpeakerMap | null = null;
let cacheTimestamp = 0;
let fetchInProgress = false;

function parseMarkdownTable(markdown: string): SpeakerMap {
  const map: SpeakerMap = new Map();
  const lines = markdown.split('\n');

  let tableStarted = false;
  let headerSkipped = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|')) continue;

    const cells = trimmed
      .split('|')
      .slice(1, -1)
      .map((c) => c.trim());

    if (cells.length < 4) continue;

    // ヘッダー行の検出
    if (!tableStarted) {
      if (cells[0] === '話者' || cells[0].toLowerCase() === 'speaker') {
        tableStarted = true;
        continue;
      }
      continue;
    }

    // 区切り行（---|---）のスキップ
    if (!headerSkipped) {
      if (cells.every((c) => /^[-:]+$/.test(c))) {
        headerSkipped = true;
        continue;
      }
    }

    const [speakerRaw, expressionRaw, iconRaw, positionRaw] = cells;
    const speaker = speakerRaw.trim();
    const expression = expressionRaw.trim();
    const positionStr = positionRaw.trim().toLowerCase();

    // バリデーション
    if (!VALID_NAME_PATTERN.test(speaker)) continue;
    if (!VALID_NAME_PATTERN.test(expression)) continue;
    if (positionStr !== 'left' && positionStr !== 'right') continue;

    // アイコンURLの抽出（空の場合はアイコンなしとして許容）
    let iconUrl = '';
    const iconTrimmed = iconRaw.trim();
    if (iconTrimmed !== '') {
      const iconMatch = iconTrimmed.match(MARKDOWN_IMAGE_PATTERN);
      if (!iconMatch) continue;
      iconUrl = iconMatch[1];
      if (!VALID_URL_PATTERN.test(iconUrl)) continue;
    }

    const key = `${speaker}_${expression}`;
    map.set(key, {
      speaker,
      expression,
      iconUrl,
      position: positionStr as 'left' | 'right',
    });
  }

  return map;
}

export async function fetchSpeakerMap(): Promise<void> {
  if (fetchInProgress) return;
  fetchInProgress = true;

  try {
    const res = await fetch('/_api/v3/page?path=/chat-style-icons');
    if (!res.ok) return;

    const data = await res.json();
    const body: string | undefined = data?.page?.revision?.body;
    if (!body) return;

    cachedSpeakerMap = parseMarkdownTable(body);
    cacheTimestamp = Date.now();
  }
  catch {
    // fetch失敗時は既存キャッシュを維持
  }
  finally {
    fetchInProgress = false;
  }
}

export function getSpeakerMap(): SpeakerMap | null {
  // TTL超過時に非同期で再取得をトリガー（現在のキャッシュは返す）
  if (cachedSpeakerMap && Date.now() - cacheTimestamp > CACHE_TTL_MS) {
    fetchSpeakerMap();
  }
  return cachedSpeakerMap;
}

export function resolveSpeaker(name: string): SpeakerDefinition | null {
  const map = getSpeakerMap();
  if (!map) return null;

  const lastUnderscoreIndex = name.lastIndexOf('_');

  if (lastUnderscoreIndex > 0) {
    // 最後の _ で分割: speaker="a_b", expression="c"
    const speaker = name.substring(0, lastUnderscoreIndex);
    const expression = name.substring(lastUnderscoreIndex + 1);
    const key = `${speaker}_${expression}`;
    const def = map.get(key);
    if (def) return def;

    // フォールバック: name全体を話者名、expression="default"
    const fallbackKey = `${name}_default`;
    const fallbackDef = map.get(fallbackKey);
    if (fallbackDef) return fallbackDef;
  }
  else {
    // _ を含まない: name_default で検索
    const key = `${name}_default`;
    const def = map.get(key);
    if (def) return def;
  }

  return null;
}
