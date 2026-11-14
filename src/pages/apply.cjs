// Applications and sign-in, in progress. User (2026-11-14): no link on the site goes to apply.artpark.info; it will be
// merged into artpark.in later. Until then "Apply", "Sign in" and "Sign up" open this page, built from his inner-page
// intro and button components.
const { page, pageIntro, R } = require('../lib.cjs');

module.exports = {
  route: '/apply',
  html: () => page({
    title: 'Applications — ARTPARK',
    description: 'Applications and sign-in for ARTPARK programs are moving to artpark.in. This page is in progress.',
    body: pageIntro({
      eyebrow: 'Applications',
      h1: 'We are working <span class="tt">on it.</span>',
      lede: 'Applications and sign-in for ARTPARK’s programs are moving to artpark.in, and this page is in progress. Until it is ready, write to us at <a href="mailto:connect@artpark.in">connect@artpark.in</a> with a short note on what you are building, and the ARTPARK team will help you apply.',
    }) + `
  <div style="max-width:1180px;margin:0 auto;padding:40px 24px 112px">
    <div style="display:flex;flex-wrap:wrap;gap:12px">
      <a class="btn btn-primary" href="mailto:connect@artpark.in?subject=${encodeURIComponent('Application enquiry')}">Write to connect@artpark.in <span class="arrow">→</span></a>
      <a class="btn btn-ghost" href="${R.programs}/tir">About TIR</a>
      <a class="btn btn-ghost" href="${R.programs}/vip">About VIP</a>
    </div>
  </div>`,
  }),
};
