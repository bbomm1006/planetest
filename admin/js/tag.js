
// ===========================
// TAGS
// ===========================
function addTag(e, areaId) {
  if (e.key !== 'Enter') return;
  e.preventDefault();
  const input = e.target;
  const val = input.value.trim();
  if (!val) return;
  const area = document.getElementById(areaId);
  const tag = document.createElement('span');
  tag.className = 'tag';
  tag.innerHTML = `${val} <button class="tag-remove" onclick="removeTag(this)">×</button>`;
  area.insertBefore(tag, input);
  input.value = '';
}
function removeTag(btn) { btn.closest('.tag').remove(); }