// Dignity Mathematics Academy - printable progress report (shared by admin and parent pages)
// Needs: supabaseClient (from supabase-client.js) and the <div id="printArea"> on the page.
(function () {
  const AFFECTIVE = ['Attentiveness', 'Attitude to School Work', 'Completes Work Promptly', 'Honesty',
    'Mental Alertness', 'Neatness', 'Politeness', 'Punctuality', 'Relationship w/ Peers', 'Respect', 'Spirit of Team Work'];
  const PSYCHOMOTOR = ['Creative Arts', 'General Reasoning', 'Handwriting', 'Musical Skills',
    'Physical Education', 'Reading', 'Verbal Fluency/Diction'];
  const TERM_SHORT = { 'First Term': '1st', 'Second Term': '2nd', 'Third Term': '3rd' };

  const esc = (s) => String(s === null || s === undefined ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const n2 = (v) => (v === null || v === undefined || v === '') ? '' : String(Math.round(Number(v) * 100) / 100);
  function ord(n) {
    if (n === null || n === undefined) return '';
    const s = ['th', 'st', 'nd', 'rd'], v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }
  const ul = (v) => `<span class="ul">${v === '' || v === null || v === undefined ? '&nbsp;&nbsp;&nbsp;&nbsp;' : esc(v)}</span>`;
  const HIDE = `onerror="this.style.display='none'"`;

  function build(card, photoUrl) {
    const info = card.info || {};
    const isThird = card.term === 'Third Term';
    const rows = card.rows || [];
    const count = rows.length;
    // keep everything on one page, even with many subjects
    const rh = count <= 26 ? 16 : Math.max(10, Math.floor(430 / count));
    const fs = count <= 26 ? 8 : Math.max(6.5, 8 - (count - 26) * 0.12);

    const weight = (info.weight_start != null || info.weight_end != null)
      ? [info.weight_start != null ? `W1 ${n2(info.weight_start)}KG` : '', info.weight_end != null ? `W2 ${n2(info.weight_end)}KG` : ''].filter(Boolean).join('/') : '';
    const height = (info.height_start != null || info.height_end != null)
      ? [info.height_start != null ? `H1 ${n2(info.height_start)}CM` : '', info.height_end != null ? `H2 ${n2(info.height_end)}CM` : ''].filter(Boolean).join('/') : '';

    const head3 = isThird
      ? '<th>1st</th><th>2nd</th><th>3rd</th><th>An.Tot</th><th>An.Avg</th>' : '';
    const subjectRows = rows.map(r => `
      <tr>
        <td class="l">${esc(r.subject)}</td><td>${n2(r.ca)}</td><td>${n2(r.exam)}</td><td>${n2(r.total)}</td>
        <td>${n2(r.class_high)}</td><td>${n2(r.class_low)}</td>
        ${isThird ? `<td>${n2(r.first)}</td><td>${n2(r.second)}</td><td>${n2(r.third)}</td><td>${n2(r.an_tot)}</td><td>${n2(r.an_avg)}</td>` : ''}
        <td class="l">${esc(r.remark)}</td>
      </tr>`).join('');

    const traitTable = (title, names, values) => `
      <table class="rc2-t rc2-side-t">
        <thead><tr><th colspan="2">${title}</th></tr></thead>
        <tbody>${names.map(n => `<tr><td class="l">${esc(n)}</td><td class="r">${esc((values || {})[n] || '')}</td></tr>`).join('')}</tbody>
      </table>`;

    const overall = isThird ? card.annual_overall_avg : card.overall_avg;
    const student = card.student || {};

    return `
    <div class="rc2" style="--rh:${rh}px;--fs:${fs}pt;">
      <div class="rc2-head">
        <img class="rc2-logo" src="../assets/img/logo.png" alt="" ${HIDE}>
        <div class="rc2-title"><div class="t1">DIGNITY MATHEMATICS ACADEMY</div><div class="t2">STUDENT/PUPIL'S PROGRESS REPORT</div></div>
        <div class="rc2-photo">${photoUrl ? `<img src="${esc(photoUrl)}" alt="" ${HIDE}>` : ''}</div>
      </div>
      <div class="rc2-row">
        <span><b>Name:</b> ${ul(student.full_name)}</span><span><b>Class:</b> ${ul(info.class_name)}</span>
        <span><b>Age:</b> ${ul(info.age)}</span><span><b>Term:</b> ${ul(TERM_SHORT[card.term] || card.term)}</span><span><b>Year:</b> ${ul(card.session)}</span>
      </div>
      <div class="rc2-row">
        <span><b>No in Class:</b> ${ul(card.no_in_class)}</span><span><b>Position:</b> ${ul(ord(card.position))}</span>
        <span><b>Weight:</b> ${ul(weight)}</span><span><b>Height:</b> ${ul(height)}</span><span><b>Teacher:</b> ${ul(info.teacher_name)}</span>
      </div>
      <div class="rc2-main">
        <table class="rc2-t rc2-sub">
          <thead><tr><th class="l">Subject</th><th>CA</th><th>Exam</th><th>Total</th><th>C.High</th><th>C.Low</th>${head3}<th class="l">Remark</th></tr></thead>
          <tbody>${subjectRows}</tbody>
        </table>
        <div class="rc2-side">${traitTable('Affective Traits', AFFECTIVE, info.affective)}${traitTable('Psychomotor Skills', PSYCHOMOTOR, info.psychomotor)}</div>
      </div>
      <div class="rc2-line"><span><b>Overall Avg:</b> ${ul(n2(overall))}</span><span><b>Overall Remark:</b> ${ul(info.overall_remark)}</span></div>
      <div class="rc2-foot">
        <div>
          <p><b>Times school opened:</b> ${ul(info.times_opened)}</p>
          <p><b>Class teacher's remark:</b> ${ul(info.class_teacher_remark)} <img class="rc2-sig" src="assets/signatures/class-teacher.png" alt="" ${HIDE}></p>
          <p><b>Annual Position:</b> ${ul(isThird ? ord(card.annual_position) : '')}</p>
          <p class="rc2-key"><b>Rating Key:</b> A. Excellent &nbsp; B. Good &nbsp; C. Average &nbsp; D. Below Average &nbsp; E. Poor</p>
        </div>
        <div>
          <p><b>Times absent:</b> ${ul(info.times_absent)}</p>
          <p><b>Head Master/Mistress remark:</b> ${ul(info.head_remark)} <img class="rc2-sig" src="assets/signatures/head-teacher.png" alt="" ${HIDE}></p>
          <p><b>Status:</b> ${ul(info.status)}</p>
          <p class="rc2-key"><b>H1.</b> Beginning of Term &nbsp; <b>H2.</b> End of Term &nbsp; <b>W1.</b> Beginning of Term &nbsp; <b>W2.</b> End of Term</p>
        </div>
      </div>
    </div>`;
  }

  function waitForImages(root) {
    const imgs = Array.from(root.querySelectorAll('img'));
    return Promise.all(imgs.map(img => (img.complete ? Promise.resolve() :
      new Promise(res => { img.onload = img.onerror = res; setTimeout(res, 4000); }))));
  }

  // Prints one report card straight away (no preview page). Returns an error message or null.
  window.printSchoolReportCard = async function (studentId, term, session) {
    const { data: card, error } = await supabaseClient.rpc('get_report_card',
      { p_student: studentId, p_term: term, p_session: session });
    if (error) return 'Could not prepare the report card: ' + error.message;
    if (!card || !card.rows || card.rows.length === 0) return 'There are no results for that term yet.';

    let photoUrl = null;
    const path = card.student && card.student.photo_path;
    if (path) {
      const signed = await supabaseClient.storage.from('student-photos').createSignedUrl(path, 600);
      if (signed && signed.data) photoUrl = signed.data.signedUrl;
    }

    const area = document.getElementById('printArea');
    area.className = 'rc2-mode';
    document.body.classList.add('has-rc2');
    area.innerHTML = build(card, photoUrl);
    await waitForImages(area);
    window.print();
    return null;
  };
})();
