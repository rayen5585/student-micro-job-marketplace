const { Op } = require('sequelize');
const sequelize = require('../../config/db');
const Job = require('../jobs/job.model');
const Proposal = require('../proposals/proposal.model');
const User = require('../users/user.model');
const { sortBids, SORTS: BID_SORTS } = require('./bid.sorter');

const httpError = (status, message) => Object.assign(new Error(message), { status });

const JOB_SORTS = ['relevance', 'newest', 'highest_paying', 'urgent'];
const URGENT_DAYS = 3; // job yetsama urgent ken deadline fi 3 ayem wala a9al

// ---------- Helpers ----------
// ykhalli ghir 7rouf w arqam (yمنع les caractères spéciaux mta3 MySQL FULLTEXT)
const cleanText = (v) =>
  String(v || '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100);

// "logo des" -> "+logo* +des*"  (kol kelma lazem tkoun mawjouda, w el * ya3ni "tibda b")
const toBooleanQuery = (q) =>
  q
    .split(' ')
    .map((w) => `+${w}*`)
    .join(' ');

const parseSkills = (v) =>
  String(v || '')
    .split(',')
    .map((s) => s.trim().replace(/[%_"\\]/g, ''))
    .filter(Boolean)
    .slice(0, 10);

const toNumber = (v) => {
  if (v === undefined || v === null || v === '') return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};

function buildOrder(sort, relevance) {
  switch (sort) {
    case 'highest_paying':
      return [['budget', 'DESC'], ['createdAt', 'DESC']];
    case 'urgent':
      // el jobs b deadline 9rib awel; li ma3andhomch deadline wala fet w9tha yetحطou fel a5er
      return [
        [sequelize.literal('(deadline IS NULL OR deadline < NOW())'), 'ASC'],
        ['deadline', 'ASC'],
        ['budget', 'DESC'],
      ];
    case 'relevance':
      if (relevance) return [[relevance, 'DESC'], ['createdAt', 'DESC']];
      return [['createdAt', 'DESC']];
    default:
      return [['createdAt', 'DESC']];
  }
}

function toPlain(job) {
  const j = job.toJSON();
  const dl = j.deadline ? new Date(j.deadline).getTime() : null;
  const now = Date.now();
  j.isUrgent = dl !== null && dl > now && dl - now <= URGENT_DAYS * 24 * 3600 * 1000;
  return j;
}

// ---------- 1) Recherche + filtres + tri + facettes ----------
async function searchJobs(params) {
  const q = cleanText(params.q);
  const skills = parseSkills(params.skills);
  const minBudget = toNumber(params.minBudget);
  const maxBudget = toNumber(params.maxBudget);
  const urgentOnly = params.urgent === 'true';
  const sort = JOB_SORTS.includes(params.sort) ? params.sort : 'relevance';
  const page = Math.max(1, parseInt(params.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(params.limit, 10) || 12));

  // filtres communs (budget + urgent)
  const filters = [];
  if (minBudget !== null) filters.push({ budget: { [Op.gte]: minBudget } });
  if (maxBudget !== null) filters.push({ budget: { [Op.lte]: maxBudget } });
  if (urgentOnly) {
    const now = new Date();
    const soon = new Date(now.getTime() + URGENT_DAYS * 24 * 3600 * 1000);
    filters.push({ deadline: { [Op.between]: [now, soon] } });
  }

  // mode = 'fulltext' (index MySQL) wala 'like' (fallback)
  async function attempt(mode) {
    const textFilters = [];
    let relevance = null;

    if (q && mode === 'fulltext') {
      relevance = sequelize.literal(
        `MATCH(title, description) AGAINST (${sequelize.escape(toBooleanQuery(q))} IN BOOLEAN MODE)`
      );
      textFilters.push(sequelize.where(relevance, Op.gt, 0));
    } else if (q) {
      const like = `%${q}%`;
      textFilters.push({ [Op.or]: [{ title: { [Op.like]: like } }, { description: { [Op.like]: like } }] });
    }

    // baseWhere = recherche + budget + urgent (bla skills) -> yesta3mlouh lel facettes
    const baseWhere = { [Op.and]: [...filters, ...textFilters] };
    // el skills tتزاد lel résultats bark (AND: lazem el job ykoun 3andou el skills kolhom)
    const skillFilters = skills.map((s) => ({ skills: { [Op.like]: `%"${s}"%` } }));

    const [{ rows, count }, facetRows] = await Promise.all([
      Job.findAndCountAll({
        where: { [Op.and]: [baseWhere, ...skillFilters] },
        order: buildOrder(sort, relevance),
        limit,
        offset: (page - 1) * limit,
      }),
      Job.findAll({ where: baseWhere, attributes: ['id', 'skills'] }),
    ]);
    return { rows, count, facetRows };
  }

  let out = null;
  if (q) {
    try {
      out = await attempt('fulltext');
    } catch (err) {
      out = null; // ex: FULLTEXT index mouch mawjoud -> nرjaa3 lel LIKE
    }
  }
  if (!out || out.count === 0) out = await attempt('like');

  // Facettes: kol skill + 9addech men job 3andou
  const counts = new Map();
  for (const job of out.facetRows) {
    for (const s of job.skills) counts.set(s, (counts.get(s) || 0) + 1);
  }
  const facets = [...counts]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  return {
    jobs: out.rows.map(toPlain),
    facets,
    total: out.count,
    page,
    pages: Math.max(1, Math.ceil(out.count / limit)),
    sort,
  };
}

// ---------- 2) Bids mretbin (lel client saheb el job) ----------
async function sortedBids(jobId, userId, sort = 'best_value') {
  const job = await Job.findByPk(jobId);
  if (!job) throw httpError(404, 'Job not found');
  if (String(job.postedBy) !== String(userId)) throw httpError(403, 'Only the job owner can see the bids');
  if (!BID_SORTS.includes(sort)) throw httpError(400, `sort must be one of: ${BID_SORTS.join(', ')}`);

  const proposals = await Proposal.findAll({
    where: { jobId },
    include: [{ model: User, as: 'freelancer', attributes: ['id', 'name', 'email'] }],
  });
  return sortBids(proposals.map((p) => p.toJSON()), sort);
}

module.exports = { searchJobs, sortedBids };