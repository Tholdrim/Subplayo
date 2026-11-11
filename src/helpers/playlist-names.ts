import type { UserPlaylist } from '../youtube-client';

import { InvariantId, InvariantViolationError } from '../errors/invariant-violation-error';

const PREFERRED_ID_SUFFIX_LENGTH = 4;

export function generatePlaylistNames(playlists: readonly UserPlaylist[]): Map<string, string> {
  if (!_areAllUnique(playlists.map(playlist => playlist.id))) {
    throw new Error('Duplicate playlist IDs detected. Please try fetching playlists again.');
  }

  const names = new Map<string, string>();
  const reservedNames = new Set(playlists.map(playlist => playlist.title));

  for (const [title, group] of Map.groupBy(playlists, playlist => playlist.title)) {
    if (group.length === 1) {
      names.set(group[0].id, title);
      continue;
    }

    const uniqueNames = _generateGroupNames(title, group, reservedNames);

    group.forEach((playlist, index) => {
      names.set(playlist.id, uniqueNames[index]);
      reservedNames.add(uniqueNames[index]);
    });
  }

  return names;
}

function _generateGroupNames(title: string, group: readonly UserPlaylist[], reservedNames: ReadonlySet<string>): string[] {
  const maxIdLength = Math.max(...group.map(playlist => playlist.id.length));

  for (let suffixLength = Math.min(PREFERRED_ID_SUFFIX_LENGTH, maxIdLength); suffixLength <= maxIdLength; suffixLength++) {
    const candidates = _createCandidates(title, group, suffixLength, null);

    if (_areCandidatesAvailable(candidates, reservedNames)) {
      return candidates;
    }
  }

  // Each reserved name can block at most one discriminator, so one of the first size + 1 values must be free.
  for (let discriminator = 1; discriminator <= reservedNames.size + 1; discriminator++) {
    const candidates = _createCandidates(title, group, maxIdLength, discriminator);

    if (_areCandidatesAvailable(candidates, reservedNames)) {
      return candidates;
    }
  }

  throw new InvariantViolationError(InvariantId.PLAYLIST_NAMES_SEARCH_EXHAUSTED);
}

function _createCandidates(title: string, group: readonly UserPlaylist[], idSuffixLength: number, discriminator: number | null): string[] {
  const discriminatorSuffix = discriminator === null ? '' : `-${discriminator}`;

  return group.map(playlist => `${title} • ${playlist.id.slice(-idSuffixLength)}${discriminatorSuffix}`);
}

function _areCandidatesAvailable(candidates: readonly string[], reservedNames: ReadonlySet<string>): boolean {
  return _areAllUnique(candidates) && candidates.every(name => !reservedNames.has(name));
}

function _areAllUnique(values: readonly string[]): boolean {
  return new Set(values).size === values.length;
}
