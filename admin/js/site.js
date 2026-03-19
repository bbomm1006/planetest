async function loadSiteInfo() {
  const res = await apiGet('api/site.php', { action: 'get' });
  if (!res.ok) return;
  const d = res.data;
  document.getElementById('siteFooterCopy').value  = d.footer_copy  || '';
  document.getElementById('siteTel').value          = d.tel          || '';
  document.getElementById('siteHours').value        = d.hours        || '';
  document.getElementById('siteAddress').value      = d.address      || '';
  document.getElementById('siteCopyright').value    = d.copyright    || '';

  const hp = document.getElementById('siteHeaderLogoPreview');
  const fp = document.getElementById('siteFooterLogoPreview');
  if (d.header_logo) hp.innerHTML = `<img src="${d.header_logo}" style="max-height:60px;">`;
  if (d.footer_logo) fp.innerHTML = `<img src="${d.footer_logo}" style="max-height:60px;">`;
}

async function saveSiteInfo() {
  const fd = new FormData();
  fd.append('action', 'save');
  fd.append('footer_copy',  document.getElementById('siteFooterCopy').value.trim());
  fd.append('tel',          document.getElementById('siteTel').value.trim());
  fd.append('hours',        document.getElementById('siteHours').value.trim());
  fd.append('address',      document.getElementById('siteAddress').value.trim());
  fd.append('copyright',    document.getElementById('siteCopyright').value.trim());

  const headerFile = document.getElementById('siteHeaderLogo').files[0];
  const footerFile = document.getElementById('siteFooterLogo').files[0];
  if (headerFile) fd.append('header_logo', headerFile);
  if (footerFile) fd.append('footer_logo', footerFile);

  const res = await fetch('api/site.php', { method: 'POST', body: fd });
  const json = await res.json();
  if (json.ok) {
    showToast('저장되었습니다.', 'success');
    loadSiteInfo();
  } else {
    showToast(json.msg || '저장 실패', 'error');
  }
}