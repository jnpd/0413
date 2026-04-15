export interface ArchiveCatalogItem {
  id: string;
  name: string;
  model: string;
  caliber: string;
  remark: string;
  createdAt: string;
}

interface LegacyArchiveCatalogItem extends Partial<ArchiveCatalogItem> {}

const ARCHIVE_STORAGE_KEY = 'waterTest.archiveCatalog.v2';
const LEGACY_ARCHIVE_STORAGE_KEY = 'waterTest.archiveCatalog.v1';

function getNowLabel() {
  return new Date().toLocaleString('zh-CN', { hour12: false });
}

function normalizeArchiveItem(item: LegacyArchiveCatalogItem, index: number): ArchiveCatalogItem {
  return {
    id: (item.id || `archive-${index + 1}`).trim(),
    name: (item.name || '').trim(),
    model: (item.model || '').trim(),
    caliber: (item.caliber || '').trim(),
    remark: (item.remark || '').trim(),
    createdAt: (item.createdAt || '').trim() || getNowLabel(),
  };
}

export function loadArchiveCatalog(fallback: ArchiveCatalogItem[] = []): ArchiveCatalogItem[] {
  try {
    const raw = localStorage.getItem(ARCHIVE_STORAGE_KEY) || localStorage.getItem(LEGACY_ARCHIVE_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return fallback;
    const normalized = parsed
      .map((item, index) => normalizeArchiveItem(item as LegacyArchiveCatalogItem, index))
      .filter((item) => item.name || item.model || item.caliber);
    return normalized.length > 0 ? normalized : fallback;
  } catch {
    return fallback;
  }
}

export function saveArchiveCatalog(items: ArchiveCatalogItem[]) {
  try {
    localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export function getArchiveModelOptions(items: ArchiveCatalogItem[]): string[] {
  const unique = new Map<string, string>();
  for (const item of items) {
    const value = (item.model || '').trim();
    if (!value) continue;
    unique.set(value.toLowerCase(), value);
  }
  return Array.from(unique.values()).sort((a, b) => a.localeCompare(b, 'zh-CN'));
}
