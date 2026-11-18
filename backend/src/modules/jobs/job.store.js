let jobs = [];
let nextId = 1;

module.exports = {
  getAll() {
    return jobs;
  },

  getById(id) {
    return jobs.find((j) => j.id === id);
  },

  create(data) {
    const job = {
      id: nextId++,
      ...data,
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    jobs.push(job);
    return job;
  },

  update(id, data) {
    const index = jobs.findIndex((j) => j.id === id);
    if (index === -1) return null;
    jobs[index] = { ...jobs[index], ...data };
    return jobs[index];
  },

  remove(id) {
    const index = jobs.findIndex((j) => j.id === id);
    if (index === -1) return false;
    jobs.splice(index, 1);
    return true;
  },
};