const pdfModule = require('pdf-parse');
const pdf = typeof pdfModule === 'function' ? pdfModule : (pdfModule && typeof pdfModule.default === 'function' ? pdfModule.default : null);
let PDFParserLib = null;
try {
  PDFParserLib = require('pdf2json');
} catch (e) {
  PDFParserLib = null;
}

// configurable tuning params (can be set via environment variables)
const SKILL_BOOST = parseFloat(process.env.SKILL_BOOST || '6.0');
const WEIGHT_COSINE = parseFloat(process.env.WEIGHT_COSINE || '0.2');
const WEIGHT_SKILL = parseFloat(process.env.WEIGHT_SKILL || '0.75');
const BONUS_FACTOR = parseFloat(process.env.BONUS_FACTOR || '0.05');

// optional OCR fallback (tesseract.js)
let Tesseract = null;
try {
  Tesseract = require('tesseract.js');
} catch (e) {
  Tesseract = null;
}

if (!pdf && !PDFParserLib) {
  console.warn('Neither pdf-parse nor pdf2json are available. PDF parsing will fail.');
}

function parseWithPdf2Json(buffer) {
  return new Promise((resolve, reject) => {
    if (!PDFParserLib) return reject(new Error('pdf2json not installed'));
    const PDFParser = PDFParserLib.PDFParser || PDFParserLib;
    const pdfParser = new PDFParser(this, 1);

    pdfParser.on('pdfParser_dataError', (err) => reject(err));
    pdfParser.on('pdfParser_dataReady', (pdfData) => {
      try {
        const text = pdfParser.getRawTextContent();
        resolve(text || '');
      } catch (e) {
        reject(e);
      }
    });

    try {
      pdfParser.parseBuffer(buffer);
    } catch (e) {
      reject(e);
    }
  });
}

function naiveTextExtract(buffer) {
  try {
    const s = buffer.toString('latin1');
    const matches = s.match(/[A-Za-z0-9\-\,\.'"()\/\s]{40,}/g);
    if (!matches || matches.length === 0) return '';
    // join and normalize spaces
    return matches.join(' ').replace(/\s+/g, ' ').trim();
  } catch (e) {
    return '';
  }
}

async function tryOcr(buffer) {
  if (!Tesseract) return '';
  try {
    const { createWorker } = Tesseract;
    const worker = createWorker({ logger: () => {} });
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    // recognize accepts Buffer/Uint8Array
    const { data } = await worker.recognize(buffer);
    await worker.terminate();
    return (data && data.text) ? data.text.trim() : '';
  } catch (e) {
    try { console.warn('OCR failed:', e && e.message); } catch (ee) {}
    return '';
  }
}

function tokenize(text) {
  return text
    .replace(/\r?\n/g, ' ')
    .replace(/[^a-zA-Z0-9 ]/g, ' ')
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

function makeNGrams(tokens, n) {
  const grams = [];
  for (let i = 0; i <= tokens.length - n; i++) {
    grams.push(tokens.slice(i, i + n).join(' '));
  }
  return grams;
}

function normalizeText(s) {
  return (s || '')
    .normalize('NFKD')
    .replace(/[\u2010-\u2015\u2212]/g, '-') // normalize dashes
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

// very small stemmer: remove common suffixes
function simpleStem(w) {
  if (!w || w.length < 4) return w;
  return w.replace(/(ing|ed|ly|es|s)$/g, '');
}

function levenshtein(a, b) {
  const m = a.length; const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

function normalizeSkillName(s) {
  if (!s) return '';
  const map = {
    'reactjs': 'react',
    'react.js': 'react',
    'nodejs': 'node',
    'node.js': 'node',
    'c#': 'csharp',
    'c++': 'cpp',
    'postgresql': 'postgres',
    'mongodb': 'mongo',
    'aws': 'aws',
  };
  let n = normalizeText(s);
  n = n.replace(/\./g, '');
  if (map[n]) return map[n];
  return n.split(' ').map(simpleStem).join(' ');
}

function termFreq(tokens) {
  // use log-scaled term frequency to dampen very common terms
  const tf = {};
  tokens.forEach((t) => { tf[t] = (tf[t] || 0) + 1; });
  Object.keys(tf).forEach((k) => { tf[k] = Math.log(1 + tf[k]); });
  // normalize by vector length later when computing norm
  return tf;
}

function dot(a, b) {
  let s = 0;
  Object.keys(a).forEach((k) => { if (b[k]) s += a[k] * b[k]; });
  return s;
}

function norm(v) {
  return Math.sqrt(Object.values(v).reduce((acc, x) => acc + x * x, 0));
}

async function computeMatchFromBuffer(job, buffer) {
  let resumeText = '';
  if (pdf) {
    try {
      const data = await pdf(buffer);
      resumeText = (data.text || '').trim();
    } catch (e) {
      // try fallback
      resumeText = '';
    }
  }

  if (!resumeText && PDFParserLib) {
    // try pdf2json fallback
    try {
      resumeText = (await parseWithPdf2Json(buffer) || '').trim();
    } catch (e) {
      // will be handled by caller
      // if pdf2json failed, try naive extractor before giving up
      const naive = naiveTextExtract(buffer);
      if (naive && naive.length > 50) {
        resumeText = naive;
      } else {
        throw new Error('Both pdf-parse and pdf2json failed: ' + (e && e.message ? e.message : e));
      }
    }
  }

  if (!resumeText || resumeText.length < 50) {
    // Try naive extraction before failing
    const naive = naiveTextExtract(buffer);
    if (naive && naive.length > 50) {
      resumeText = naive;
    } else {
      // try OCR as a last resort (for scanned PDFs)
      const ocr = await tryOcr(buffer);
      if (ocr && ocr.length > 50) {
        resumeText = ocr;
      } else {
        throw new Error('Unable to extract readable text from resume. It may be a scanned/image PDF.');
      }
    }
  }

  // build tokens including n-grams so multi-word skills count
  const jobDoc = `${job.title || ''} ${job.description || ''} ${(job.skills || []).join(' ')}`;
  const jobTokensBase = tokenize(jobDoc);
  const resumeTokensBase = tokenize(resumeText);

  const jobBigrams = makeNGrams(jobTokensBase, 2);
  const jobTrigrams = makeNGrams(jobTokensBase, 3);
  const resumeBigrams = makeNGrams(resumeTokensBase, 2);
  const resumeTrigrams = makeNGrams(resumeTokensBase, 3);

  const jobTokens = [...jobTokensBase, ...jobBigrams, ...jobTrigrams];
  const resumeTokens = [...resumeTokensBase, ...resumeBigrams, ...resumeTrigrams];

  const tfJob = termFreq(jobTokens);
  const tfResume = termFreq(resumeTokens);

  const vocab = Array.from(new Set([...jobTokens, ...resumeTokens]));
  const df = {};
  vocab.forEach((t) => {
    df[t] = 0;
    if (jobTokens.includes(t)) df[t] += 1;
    if (resumeTokens.includes(t)) df[t] += 1;
  });

  const idf = {};
  const N = 2; // two documents: job and resume
  // slightly stronger idf smoothing
  vocab.forEach((t) => { idf[t] = Math.log((N + 0.5) / (df[t] + 0.5)) + 1; });

  const vecJob = {};
  const vecResume = {};
  vocab.forEach((t) => {
    vecJob[t] = (tfJob[t] || 0) * idf[t];
    vecResume[t] = (tfResume[t] || 0) * idf[t];
  });

  // boost job skill terms for higher influence
  const jobSkills = (job.skills || []).map((s) => s.toLowerCase().trim()).filter(Boolean);
  const skillBoost = SKILL_BOOST;
  jobSkills.forEach((sk) => {
    // boost exact phrase, bigram/trigram tokens if present
    if (vecJob[sk] !== undefined) vecJob[sk] = vecJob[sk] * skillBoost;
    const skTokens = sk.split(/\s+/).filter(Boolean);
    if (skTokens.length > 1) {
      const big = skTokens.join(' ');
      if (vecJob[big] !== undefined) vecJob[big] = vecJob[big] * skillBoost;
      const tri = skTokens.slice(0, 3).join(' ');
      if (vecJob[tri] !== undefined) vecJob[tri] = vecJob[tri] * skillBoost;
    }
  });

  // normalize vectors
  const normJob = norm(vecJob) || 1;
  const normResume = norm(vecResume) || 1;
  const denom = normJob * normResume;
  const cosine = dot(vecJob, vecResume) / denom;

  // more flexible skill matching: use normalized skill names, stems, n-grams and fuzzy matching
  const matchedSkills = [];
  const resumeTextNorm = normalizeText(resumeText);
  const resumeTokensStem = resumeTokensBase.map((t) => simpleStem(t));

  jobSkills.forEach((rawSkill) => {
    const skNorm = normalizeSkillName(rawSkill);
    if (!skNorm) return;

    // direct phrase (normalized)
    if (resumeTextNorm.includes(skNorm)) {
      matchedSkills.push(rawSkill);
      return;
    }

    // check in n-grams (we built resumeTokens earlier with bigrams/trigrams)
    if (resumeTokens.includes(skNorm)) {
      matchedSkills.push(rawSkill);
      return;
    }

    // token overlap (all parts present as stems)
    const parts = skNorm.split(/\s+/).filter(Boolean);
    if (parts.length > 0) {
      const allPresent = parts.every((p) => resumeTokensStem.includes(simpleStem(p)) || resumeTokensBase.includes(p));
      if (allPresent) {
        matchedSkills.push(rawSkill);
        return;
      }
    }

    // fuzzy fallback: allow small edit distance on individual parts
    let fuzzyCount = 0;
    parts.forEach((p) => {
      for (let i = 0; i < resumeTokensBase.length; i++) {
        const tok = resumeTokensBase[i];
        const dist = levenshtein(p, tok);
        const thresh = p.length <= 4 ? 1 : 2;
        if (dist <= thresh) {
          fuzzyCount += 1;
          break;
        }
      }
    });
    if (parts.length > 0 && fuzzyCount === parts.length) matchedSkills.push(rawSkill);
  });

  const skillScore = jobSkills.length ? matchedSkills.length / jobSkills.length : 0;

  // give more weight to skill matches while keeping semantic cosine influence
  let finalScore =
  WEIGHT_COSINE * cosine +
  WEIGHT_SKILL * skillScore +
  BONUS_FACTOR * Math.max(0, skillScore - cosine);

// Extra boost when most skills match
if (skillScore > 0.7) finalScore += 0.08;
if (skillScore > 0.5) finalScore += 0.05;
if (skillScore > 0.3) finalScore += 0.03;

finalScore = Math.min(1, finalScore);
  return {
    score: Math.round(finalScore * 100),
    cosine: Math.round(cosine * 10000) / 100,
    matchedSkills,
    topTerms: Object.entries(vecJob)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .map((t) => t[0]),
    resumeText,
  };
}

module.exports = { computeMatchFromBuffer };
