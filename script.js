/**
 * A Love Told In Silence - Core Controller
 * 100% Natural 1:1 Scrolling with Cinematic Top/Bottom Video Cut Transition
 * Instant, rock-solid audio synchronization - ZERO audio mismatch!
 */

document.addEventListener('DOMContentLoaded', () => {
  const feedContainer = document.getElementById('feedContainer');
  const slides = Array.from(document.querySelectorAll('.slide-section'));
  const videos = Array.from(document.querySelectorAll('.slide-video'));
  const storyProgressBar = document.getElementById('storyProgressBar');
  const storyCounter = document.getElementById('storyCounter');
  const audioToggleBtn = document.getElementById('audioToggleBtn');
  const soundWave = document.getElementById('soundWave');
  const audioLabel = document.getElementById('audioLabel');
  const speakerIcon = document.getElementById('speakerIcon');
  const fsToggleBtn = document.getElementById('fsToggleBtn');
  const prevSlideBtn = document.getElementById('prevSlideBtn');
  const nextSlideBtn = document.getElementById('nextSlideBtn');
  const replayBtn = document.getElementById('replayBtn');
  const heartCanvas = document.getElementById('heartCanvas');

  let currentIndex = 0;
  let isAudioEnabled = false;

  // 1. Initialize Story Progress Bar segments (Clickable for smooth jump)
  slides.forEach((_, idx) => {
    const seg = document.createElement('div');
    seg.className = `story-segment ${idx === 0 ? 'active' : ''}`;
    seg.title = `Slide ${idx + 1}`;
    seg.addEventListener('click', (e) => {
      e.stopPropagation();
      goToSlide(idx);
    });
    storyProgressBar.appendChild(seg);
  });
  const segments = Array.from(document.querySelectorAll('.story-segment'));

  // 2. Audio Toggle Handler (Controls the video's original song)
  function toggleAudio() {
    isAudioEnabled = !isAudioEnabled;

    if (isAudioEnabled) {
      soundWave.classList.add('playing');
      if (audioLabel) audioLabel.textContent = 'On';
      speakerIcon.innerHTML = `
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
      `;

      // Unmute active slide video and ensure it plays
      const activeVideo = videos[currentIndex];
      if (activeVideo) {
        activeVideo.muted = false;
        activeVideo.play().catch(() => {});
      }
    } else {
      soundWave.classList.remove('playing');
      if (audioLabel) audioLabel.textContent = 'Muted';
      speakerIcon.innerHTML = `
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <line x1="23" y1="9" x2="17" y2="15"></line>
        <line x1="17" y1="9" x2="23" y2="15"></line>
      `;
      // Mute all videos
      videos.forEach(v => { v.muted = true; });
    }
  }

  audioToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleAudio();
  });

  // 3. Perfect Audio Switching & Active Slide Synchronization
  // Ensures ONLY the single active video plays its song, and ALL others are strictly paused and muted!
  function setActiveSlide(newIndex) {
    if (newIndex < 0 || newIndex >= slides.length) return;
    currentIndex = newIndex;

    const num = String(currentIndex + 1).padStart(2, '0');
    const total = String(slides.length).padStart(2, '0');
    storyCounter.textContent = `${num} / ${total}`;

    // Update Story segments
    segments.forEach((seg, idx) => {
      seg.classList.remove('active', 'completed');
      if (idx < currentIndex) {
        seg.classList.add('completed');
      } else if (idx === currentIndex) {
        seg.classList.add('active');
      }
    });

    // ROCK SOLID AUDIO CONTROL:
    // Only the active video plays. ALL other videos are IMMEDIATELY PAUSED AND MUTED!
    videos.forEach((video, idx) => {
      if (idx === currentIndex) {
        video.muted = !isAudioEnabled;
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            video.muted = true;
            video.play().catch(() => {});
          });
        }
      } else {
        // Stop audio and pause immediately
        video.muted = true;
        video.pause();
      }
    });

    if (prevSlideBtn) prevSlideBtn.disabled = currentIndex === 0;
    if (nextSlideBtn) nextSlideBtn.disabled = currentIndex === slides.length - 1;
  }

  // 4. Cinematic Top & Bottom Video Cut Transition during Scrolling
  // As requested: "scroll karte time aisa lage ki upar se or niche se vo video cut si hone lag jaye"
  function handleScroll() {
    const viewportHeight = feedContainer.clientHeight || window.innerHeight;
    const viewportCenter = viewportHeight / 2;

    let closestIndex = currentIndex;
    let minDistance = Infinity;

    slides.forEach((slide, idx) => {
      const rect = slide.getBoundingClientRect();
      const slideCenter = rect.top + rect.height / 2;
      const distanceFromCenter = Math.abs(slideCenter - viewportCenter);

      // Track the slide closest to center for audio synchronization
      if (distanceFromCenter < minDistance) {
        minDistance = distanceFromCenter;
        closestIndex = idx;
      }

      // Calculate how far this slide is from the center (0 = center, 1 = scrolled one screen away)
      const ratio = Math.min(1, Math.max(0, distanceFromCenter / viewportHeight));

      // Dynamic cinematic letterbox cut from top and bottom:
      // When at center: cut is 0% (full screen)
      // As you scroll: the video cuts inward up to 14% from top and bottom!
      const cutPercent = ratio * 14; 
      const videoWrap = slide.querySelector('.video-wrapper');
      if (videoWrap) {
        videoWrap.style.clipPath = `inset(${cutPercent.toFixed(1)}% 0% ${cutPercent.toFixed(1)}% 0% round 6px)`;
        videoWrap.style.transform = `scale(${1 - ratio * 0.04})`;
      }
    });

    // If the closest slide changed, immediately switch audio!
    if (closestIndex !== currentIndex) {
      setActiveSlide(closestIndex);
    }
  }

  let scrollTicking = false;
  feedContainer.addEventListener('scroll', () => {
    if (!scrollTicking) {
      window.requestAnimationFrame(() => {
        handleScroll();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });

  // Initial call
  setActiveSlide(0);
  handleScroll();

  // 5. Navigation Buttons Smooth Scroll (when user explicitly clicks Next/Prev)
  function goToSlide(index) {
    if (index >= 0 && index < slides.length) {
      setActiveSlide(index);
      const targetTop = slides[index].offsetTop;
      feedContainer.scrollTo({
        top: targetTop,
        behavior: 'smooth'
      });
    }
  }

  if (prevSlideBtn) {
    prevSlideBtn.addEventListener('click', () => {
      if (currentIndex > 0) goToSlide(currentIndex - 1);
    });
  }

  if (nextSlideBtn) {
    nextSlideBtn.addEventListener('click', () => {
      if (currentIndex < slides.length - 1) goToSlide(currentIndex + 1);
    });
  }

  if (replayBtn) {
    replayBtn.addEventListener('click', () => {
      goToSlide(0);
    });
  }

  // 6. Keyboard Navigation (Optional desktop convenience)
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === ' ' || e.key === 'PageDown') {
      e.preventDefault();
      if (currentIndex < slides.length - 1) goToSlide(currentIndex + 1);
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      if (currentIndex > 0) goToSlide(currentIndex - 1);
    }
  });

  if (fsToggleBtn) {
    fsToggleBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
      }
    });
  }

  // 7. Romantic Floating Particles Canvas
  function initParticles() {
    if (!heartCanvas) return;
    const ctx = heartCanvas.getContext('2d');
    let width = (heartCanvas.width = window.innerWidth);
    let height = (heartCanvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = heartCanvas.width = window.innerWidth;
      height = heartCanvas.height = window.innerHeight;
    });

    const particles = [];
    const maxParticles = 24;

    class Particle {
      constructor() {
        this.reset(true);
      }

      reset(init = false) {
        this.x = Math.random() * width;
        this.y = init ? Math.random() * height : height + 10;
        this.size = Math.random() * 3 + 1.5;
        this.speedY = Math.random() * 0.45 + 0.2;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.alpha = Math.random() * 0.5 + 0.2;
        this.fadeSpeed = Math.random() * 0.003 + 0.002;
        this.isHeart = Math.random() > 0.6;
      }

      update() {
        this.y -= this.speedY;
        this.x += this.speedX;
        this.alpha -= this.fadeSpeed;
        if (this.y < -10 || this.alpha <= 0) {
          this.reset(false);
        }
      }

      draw() {
        ctx.save();
        ctx.fillStyle = `rgba(255, 182, 193, ${this.alpha})`;
        ctx.shadowBlur = 6;
        ctx.shadowColor = 'rgba(255, 105, 180, 0.6)';

        if (this.isHeart) {
          const s = this.size;
          ctx.beginPath();
          ctx.moveTo(this.x, this.y);
          ctx.bezierCurveTo(this.x - s, this.y - s, this.x - s * 1.5, this.y + s / 3, this.x, this.y + s * 1.4);
          ctx.bezierCurveTo(this.x + s * 1.5, this.y + s / 3, this.x + s, this.y - s, this.x, this.y);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }

    for (let i = 0; i < maxParticles; i++) {
      particles.push(new Particle());
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animate);
    }
    animate();
  }

  initParticles();
});
