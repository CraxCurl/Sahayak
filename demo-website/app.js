document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('scholarship-form');
  const btnUpload = document.getElementById('btn-upload-docs');
  const fileInput = document.getElementById('file-input');
  const filePreview = document.getElementById('file-list-preview');

  if (btnUpload && fileInput) {
    btnUpload.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', e => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        filePreview.innerHTML = files
          .map(
            f =>
              `<div style="margin-top:0.5rem; padding:0.4rem 0.75rem; background:#0f172a; border-radius:6px; font-size:0.75rem; color:#38bdf8;">
              📄 ${f.name} (${(f.size / 1024).toFixed(1)} KB)
            </div>`
          )
          .join('');
      }
    });
  }

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      alert('Application submitted successfully! Your tracking application reference is #SH-2026-99182.');
    });
  }
});
