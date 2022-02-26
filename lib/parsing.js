'use strict';

const { RequestError, ConfigurationError } = require('./errors');

/**
 * A parser for the Accept header
 * @param {Object.<string, string|undefined>} requestHeaders
 * @param {string[]} preferences
 */
exports.parseAccept = (requestHeaders, preferences) => {
  //                         */*        type/*                              type/subtype
  const validMediaRx =
    /^(?:\*\/\*)|(?:[\w\!#\$%&'\*\+\-\.\^`\|~]+\/\*)|(?:[\w\!#\$%&'\*\+\-\.\^`\|~]+\/[\w\!#\$%&'\*\+\-\.\^`\|~]+)$/;
  const normalize = (raw) => {
    raw = raw || '*/*';
    const normalized = {
      header: raw,
      quoted: {},
    };
    if (raw.includes('"')) {
      let i = 0;
      normalized.header = raw.replace(/="([^"]*)"/g, ($0, $1) => {
        const key = '"' + ++i;
        normalized.quoted[key] = $1;
        return '=' + key;
      });
    }
    normalized.header = normalized.header.replace(/[ \t]/g, '');
    return normalized;
  };
  const { header, quoted } = normalize(requestHeaders['accept'] ?? '');
  const parts = header.split(',');
  const selections = [];
  const map = {};
  for (let i = 0; i < parts.length; ++i) {
    const part = parts[i];
    // Ignore empty parts or leading commas
    if (!part) {
      continue;
    }

    // Parse parameters
    const pairs = part.split(';');
    const token = pairs.shift().toLowerCase();
    // Ignore invalid types
    if (!validMediaRx.test(token)) {
      continue;
    }

    const selection = {
      token,
      params: {},
      exts: {},
      pos: i,
    };

    // Parse key=value

    let target = 'params';
    for (const pair of pairs) {
      const kv = pair.split('=');
      if (kv.length !== 2 || !kv[1]) {
        throw new RequestError(`Invalid accept header`, 400);
      }

      const key = kv[0];
      let value = kv[1];

      if (key === 'q' || key === 'Q') {
        target = 'exts';

        value = parseFloat(value);
        if (
          !Number.isFinite(value) ||
          value > 1 ||
          (value < 0.001 && value !== 0)
        ) {
          value = 1;
        }

        selection.q = value;
      } else {
        if (value[0] === '"') {
          value = `"${quoted[value]}"`;
        }

        selection[target][kv[0]] = value;
      }
    }

    const params = Object.keys(selection.params);
    selection.original = ['']
      .concat(params.map((key) => `${key}=${selection.params[key]}`))
      .join(';');
    selection.specificity = params.length;
    // Default no preference to q=1 (top preference)
    if (selection.q === undefined) {
      selection.q = 1;
    }

    const tparts = selection.token.split('/');
    selection.type = tparts[0];
    selection.subtype = tparts[1];

    map[selection.token] = selection;
    // Skip denied selections (q=0)
    if (selection.q) {
      selections.push(selection);
    }
  }

  // Sort selection based on q and then position in header

  selections.sort((a, b) => {
    const innerSort = (key) => {
      const aFirst = -1;
      const bFirst = 1;
      if (a[key] === '*') {
        return bFirst;
      }
      if (b[key] === '*') {
        return aFirst;
      }
      // Group alphabetically
      return a[key] < b[key] ? aFirst : bFirst;
    };
    // Sort by quality score
    if (b.q !== a.q) {
      return b.q - a.q;
    }
    // Sort by type
    if (a.type !== b.type) {
      return innerSort('type');
    }
    // Sort by subtype
    if (a.subtype !== b.subtype) {
      return innerSort('subtype');
    }
    // Sort by specificity
    if (a.specificity !== b.specificity) {
      return b.specificity - a.specificity;
    }
    return a.pos - b.pos;
  });

  // Return selections if no preferences
  if (!preferences || !preferences.length) {
    return selections.map((selection) => selection.token + selection.original);
  }

  // Map wildcards and filter selections to preferences

  const lowers = Object.create(null);
  const flat = Object.create(null);
  let any = false;

  for (const preference of preferences) {
    const lower = preference.toLowerCase();
    flat[lower] = preference;
    const parts = lower.split('/');
    const type = parts[0];
    const subtype = parts[1];

    if (type === '*') {
      if (subtype !== '*') {
        throw new ConfigurationError(
          'Invalid media type preference contains wildcard type with a subtype'
        );
      }
      any = true;
      continue;
    }

    lowers[type] = lowers[type] || Object.create(null);
    lowers[type][subtype] = preference;
  }

  const preferred = [];
  for (const selection of selections) {
    const token = selection.token;
    const { type, subtype } = map[token];
    const subtypes = lowers[type];

    // */*

    if (type === '*') {
      for (const preference of Object.keys(flat)) {
        if (!map[preference]) {
          preferred.push(flat[preference]);
        }
      }

      if (any) {
        preferred.push('*/*');
      }

      continue;
    }

    // any

    if (any) {
      preferred.push((flat[token] || token) + selection.original);
      continue;
    }

    // type/subtype

    if (subtype !== '*') {
      const pref = flat[token];
      if (pref || (subtypes && subtypes['*'])) {
        preferred.push((pref || token) + selection.original);
      }

      continue;
    }

    // type/*

    if (subtypes) {
      for (const psub of Object.keys(subtypes)) {
        if (!map[`${type}/${psub}`]) {
          preferred.push(subtypes[psub]);
        }
      }
    }
  }

  return preferred;
};
