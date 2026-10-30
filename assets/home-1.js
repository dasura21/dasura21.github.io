
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const items = document.querySelectorAll('.reveal');
    const demoVideo = document.querySelector('.demo-browser video');
    if (demoVideo && !reducedMotion && 'IntersectionObserver' in window) {
      const videoObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) demoVideo.play().catch(() => {});
          else demoVideo.pause();
        });
      }, { threshold: .55 });
      videoObserver.observe(demoVideo);
    }
    if (reducedMotion || !('IntersectionObserver' in window)) {
      items.forEach(item => item.classList.add('in'));
    } else {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
      items.forEach((item, index) => {
        item.style.transitionDelay = `${Math.min((index % 4) * 70, 210)}ms`;
        observer.observe(item);
      });
    }
    if (location.protocol === 'file:') {
      const modelStatus = document.getElementById('model-status');
      modelStatus.innerHTML = 'INTERACTIVE CAD REQUIRES THE SERVED PREVIEW<br><br><a href="http://127.0.0.1:4173/index.html#drone">OPEN LOCAL HTTP PREVIEW &rarr;</a>';
    }
    document.querySelectorAll('[data-case-study]').forEach(card => {
      card.addEventListener('click', event => {
        if (event.target.closest('a, button, video, input, select, textarea')) return;
        window.location.href = card.dataset.caseStudy;
      });
    });
    const galleryDialog = document.getElementById('gallery-dialog');
    const galleryImage = document.getElementById('gallery-image');
    const galleryCaption = document.getElementById('gallery-caption');
    document.querySelectorAll('[data-gallery-src]').forEach(tile => {
      tile.addEventListener('click', () => {
        galleryImage.src = tile.dataset.gallerySrc;
        galleryImage.alt = tile.querySelector('img').alt;
        galleryCaption.textContent = tile.dataset.galleryCaption;
        galleryDialog.showModal();
      });
    });
    galleryDialog.querySelector('button').addEventListener('click', () => galleryDialog.close());
    galleryDialog.addEventListener('click', event => {
      if (event.target === galleryDialog) galleryDialog.close();
    });
