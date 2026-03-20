
// ===========================
// 아이디 / 비밀번호 찾기
// ===========================

function openFindModal(tab) {
  document.getElementById('findAccountModal').style.display = 'flex';
  switchFindTab(tab || 'id');
}

function closeFindModal(e) {
  if (e.target === document.getElementById('findAccountModal')) {
    document.getElementById('findAccountModal').style.display = 'none';
  }
}

function switchFindTab(tab) {
  const isId = tab === 'id';
  document.getElementById('findTabId').classList.toggle('active', isId);
  document.getElementById('findTabPw').classList.toggle('active', !isId);
  document.getElementById('findIdPanel').style.display = isId ? '' : 'none';
  document.getElementById('findPwPanel').style.display = isId ? 'none' : '';
  // 초기화
  document.getElementById('findIdMsg').textContent = '';
  document.getElementById('findPwMsg').textContent = '';
  document.getElementById('findIdMsg').className = 'find-msg';
  document.getElementById('findPwMsg').className = 'find-msg';
}

async function doFindId() {
  const email  = document.getElementById('findIdEmail').value.trim();
  const msgEl  = document.getElementById('findIdMsg');
  const btn    = document.getElementById('findIdBtn');
  msgEl.textContent = '';
  msgEl.className   = 'find-msg';

  if (!email || !email.includes('@')) {
    msgEl.textContent = '이메일 주소를 올바르게 입력해 주세요.';
    msgEl.classList.add('error');
    return;
  }

  btn.disabled      = true;
  btn.textContent   = '발송 중…';

  try {
    const fd = new FormData();
    fd.append('action', 'find_id');
    fd.append('email', email);
    const res = await fetch('api/find_account.php', { method: 'POST', body: fd });
    const data = await res.json();
    msgEl.textContent = data.msg || (data.ok ? '발송 완료' : '오류가 발생했습니다.');
    msgEl.classList.add(data.ok ? 'success' : 'error');
    if (data.ok) document.getElementById('findIdEmail').value = '';
  } catch (e) {
    msgEl.textContent = '네트워크 오류가 발생했습니다.';
    msgEl.classList.add('error');
  } finally {
    btn.disabled    = false;
    btn.textContent = '이메일 발송';
  }
}

async function doFindPw() {
  const username = document.getElementById('findPwUsername').value.trim();
  const email    = document.getElementById('findPwEmail').value.trim();
  const msgEl    = document.getElementById('findPwMsg');
  const btn      = document.getElementById('findPwBtn');
  msgEl.textContent = '';
  msgEl.className   = 'find-msg';

  if (!username) {
    msgEl.textContent = '아이디를 입력해 주세요.';
    msgEl.classList.add('error');
    return;
  }
  if (!email || !email.includes('@')) {
    msgEl.textContent = '이메일 주소를 올바르게 입력해 주세요.';
    msgEl.classList.add('error');
    return;
  }

  btn.disabled    = true;
  btn.textContent = '발송 중…';

  try {
    const fd = new FormData();
    fd.append('action', 'find_pw');
    fd.append('username', username);
    fd.append('email', email);
    const res  = await fetch('api/find_account.php', { method: 'POST', body: fd });
    const data = await res.json();
    msgEl.textContent = data.msg || (data.ok ? '발송 완료' : '오류가 발생했습니다.');
    msgEl.classList.add(data.ok ? 'success' : 'error');
    if (data.ok) {
      document.getElementById('findPwUsername').value = '';
      document.getElementById('findPwEmail').value    = '';
    }
  } catch (e) {
    msgEl.textContent = '네트워크 오류가 발생했습니다.';
    msgEl.classList.add('error');
  } finally {
    btn.disabled    = false;
    btn.textContent = '임시 비밀번호 발급';
  }
}
