/* ========================================
   GuavaSure — 3D Immersive Scripts
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

  // --- Scroll Reveal (Intersection Observer) ---
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealElements.forEach(el => revealObserver.observe(el));

  // --- Navbar Scroll Effect ---
  const nav = document.querySelector('.glass-nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });
  }

  // --- 3D Card Tilt ---
  document.querySelectorAll('.card-3d').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / centerY * -8;
      const rotateY = (x - centerX) / centerX * 8;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    });
  });

  // --- Parallax on Scroll ---
  const parallaxElements = document.querySelectorAll('[data-parallax]');
  if (parallaxElements.length) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      parallaxElements.forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || 0.3;
        const offset = el.getBoundingClientRect().top + scrollY;
        const yPos = (scrollY - offset) * speed;
        el.style.transform = `translate3d(0, ${yPos}px, 0)`;
      });
    }, { passive: true });
  }

  // --- Counter Animation ---
  document.querySelectorAll('.counter').forEach(counter => {
    const target = parseInt(counter.dataset.target);
    const suffix = counter.dataset.suffix || '';
    const prefix = counter.dataset.prefix || '';
    const duration = 2000;
    let hasAnimated = false;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !hasAnimated) {
        hasAnimated = true;
        const start = performance.now();
        const animate = (now) => {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          counter.textContent = prefix + Math.round(target * eased).toLocaleString('en-IN') + suffix;
          if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      }
    }, { threshold: 0.5 });
    observer.observe(counter);
  });

  // --- Image Lazy Load + Fade In ---
  document.querySelectorAll('img').forEach(img => {
    if (img.complete) {
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', () => img.classList.add('loaded'));
      img.addEventListener('error', () => img.classList.add('loaded'));
    }
  });

  // --- Mobile Menu Toggle ---
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const menuClose = document.getElementById('menuClose');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => mobileMenu.classList.add('open'));
    if (menuClose) menuClose.addEventListener('click', () => mobileMenu.classList.remove('open'));
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => mobileMenu.classList.remove('open'));
    });
  }

  // --- Accordion ---
  document.querySelectorAll('.accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const content = trigger.nextElementSibling;
      const icon = trigger.querySelector('.accordion-icon');
      const isOpen = content.classList.contains('open');

      // Close all others in same group
      const group = trigger.closest('.accordion-group');
      if (group) {
        group.querySelectorAll('.accordion-content.open').forEach(c => {
          c.classList.remove('open');
          c.previousElementSibling.querySelector('.accordion-icon')?.classList.remove('rotated');
        });
      }

      if (!isOpen) {
        content.classList.add('open');
        icon?.classList.add('rotated');
      }
    });
  });

  // --- Smooth Scroll for Anchor Links ---
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // --- Mouse Glow Effect on Hero ---
  const heroSection = document.querySelector('.hero-section');
  if (heroSection) {
    heroSection.addEventListener('mousemove', (e) => {
      const glow = heroSection.querySelector('.mouse-glow');
      if (glow) {
        const rect = heroSection.getBoundingClientRect();
        glow.style.left = (e.clientX - rect.left) + 'px';
        glow.style.top = (e.clientY - rect.top) + 'px';
      }
    });
  }

});

// --- Firebase Auth (loaded when Firebase SDK available) ---
function initFirebaseAuth() {
  if (typeof firebase === 'undefined') return;

  const auth = firebase.auth();

  // Google Sign-In
  window.signInWithGoogle = function() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
      .then(result => {
        console.log('Google sign-in success:', result.user.displayName);
        showAuthSuccess(result.user);
      })
      .catch(error => {
        console.error('Google sign-in error:', error);
        showAuthError(error.message);
      });
  };

  // Email Sign-In
  window.signInWithEmail = function(email, password) {
    auth.signInWithEmailAndPassword(email, password)
      .then(result => {
        showAuthSuccess(result.user);
      })
      .catch(error => {
        if (error.code === 'auth/user-not-found') {
          // Auto-create account
          auth.createUserWithEmailAndPassword(email, password)
            .then(result => showAuthSuccess(result.user))
            .catch(err => showAuthError(err.message));
        } else {
          showAuthError(error.message);
        }
      });
  };

  // Sign Out
  window.signOutUser = function() {
    auth.signOut().then(() => {
      document.querySelectorAll('.auth-status').forEach(el => {
        el.innerHTML = '<span class="text-stone-500">Signed out</span>';
      });
    });
  };

  // Auth State Listener
  auth.onAuthStateChanged(user => {
    const authBtns = document.querySelectorAll('.auth-btn-area');
    authBtns.forEach(area => {
      if (user) {
        area.innerHTML = `
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
              ${(user.displayName || user.email || '?')[0].toUpperCase()}
            </div>
            <span class="text-sm font-medium">${user.displayName || user.email}</span>
            <button onclick="signOutUser()" class="text-xs text-stone-500 hover:text-primary underline">Sign out</button>
          </div>`;
      }
    });
  });
}

function showAuthSuccess(user) {
  const modal = document.getElementById('authModal');
  if (modal) modal.style.display = 'none';
  // Could show toast notification
}

function showAuthError(msg) {
  const errEl = document.querySelector('.auth-error');
  if (errEl) {
    errEl.textContent = msg;
    errEl.style.display = 'block';
  }
}
