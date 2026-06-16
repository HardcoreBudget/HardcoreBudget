// Portfolio Application State
let portfolioData = null;
let activeModelFilter = 'All';
let currentRenders = [];
let currentRenderIndex = 0;
let currentExportedModel = '';
let loadedModels = {};

// Three.js FBX Viewer State
let fbxScene = null;
let fbxCamera = null;
let fbxRenderer = null;
let fbxControls = null;
let fbxAnimationId = null;
let fbxResizeObserver = null;

// Initialize Page
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  fetchData();
  setupEventListeners();
});

// Fetch Config Data
async function fetchData() {
  try {
    const response = await fetch('portfolio.json');
    if (!response.ok) throw new Error('Failed to load portfolio.json config file.');
    portfolioData = await response.json();
    
    // Populate Views
    renderProfile(portfolioData.profile);
    renderTeasers(portfolioData);
    renderModels(portfolioData.models);
    renderGames(portfolioData.games);
    renderMiscProjects(portfolioData.miscProjects);
    renderProgressWidget(portfolioData.buildingProject);
    
    // Initialize current hash route
    handleRoute();
  } catch (error) {
    console.error('Error initializing portfolio:', error);
    alert('Failed to initialize portfolio content from portfolio.json. Please check console logs.');
  }
}

// Set up Event Listeners
function setupEventListeners() {
  // Navigation Routing
  window.addEventListener('hashchange', handleRoute);
  
  // Theme Switching
  const themeToggle = document.getElementById('theme-toggle');
  themeToggle.addEventListener('click', toggleTheme);
  
  // Contact Form Submission
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', handleFormSubmit);
  }

  // Renders Lightbox Controls
  const closeBtn = document.getElementById('modal-close');
  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  
  const prevBtn = document.getElementById('modal-prev');
  if (prevBtn) prevBtn.addEventListener('click', prevLightboxImage);
  
  const nextBtn = document.getElementById('modal-next');
  if (nextBtn) nextBtn.addEventListener('click', nextLightboxImage);
  
  const tab3d = document.getElementById('tab-3d');
  if (tab3d) tab3d.addEventListener('click', () => switchModalTab('3d'));
  
  const tabRenders = document.getElementById('tab-renders');
  if (tabRenders) tabRenders.addEventListener('click', () => switchModalTab('renders'));


  
  // Click outside lightbox to close
  const modalContainer = document.getElementById('renders-modal');
  if (modalContainer) {
    modalContainer.addEventListener('click', (e) => {
      if (e.target.id === 'renders-modal') closeLightbox();
    });
  }

  // Handle escape key for lightbox
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
    const modal = document.getElementById('renders-modal');
    if (modal && modal.classList.contains('hidden')) return;
    if (e.key === 'ArrowLeft') prevLightboxImage();
    if (e.key === 'ArrowRight') nextLightboxImage();
  });
}

// Route Handler
function handleRoute() {
  const hash = window.location.hash || '#home';
  const sections = document.querySelectorAll('.view-section');
  
  sections.forEach(section => {
    section.classList.remove('active');
  });
  
  const activeSection = document.querySelector(hash);
  if (activeSection) {
    activeSection.classList.add('active');
  }

  // Update navigation links highlight
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    if (link.getAttribute('href') === hash) {
      link.classList.remove('text-secondary');
      link.classList.add('text-primary');
      if (link.classList.contains('border-transparent') || link.classList.contains('border-primary')) {
        link.classList.remove('border-transparent');
        link.classList.add('border-primary');
      }
    } else {
      link.classList.remove('text-primary');
      link.classList.add('text-secondary');
      if (link.classList.contains('border-primary')) {
        link.classList.remove('border-primary');
        link.classList.add('border-transparent');
      }
    }
  });

  window.scrollTo(0, 0);

  if (window.pendingGameScroll) {
    const gameId = window.pendingGameScroll;
    window.pendingGameScroll = null;
    setTimeout(() => {
      const gameCard = document.getElementById('game-card-' + gameId);
      if (gameCard) {
        const header = document.querySelector('header');
        const headerHeight = header ? header.offsetHeight : 80;
        const elementPosition = gameCard.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition - headerHeight - 20; // 20px extra padding
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 150);
  }
}

// Render Profile
function renderProfile(profile) {
  if (!profile) return;
  
  // Header Profile Shortcut
  const navAvatar = document.getElementById('nav-avatar');
  const navAvatarPlaceholder = document.getElementById('nav-avatar-placeholder');
  if (navAvatar && navAvatarPlaceholder && profile.avatar) {
    navAvatar.src = profile.avatar;
    navAvatar.classList.remove('hidden');
    navAvatarPlaceholder.classList.add('hidden');
  }
  
  // Hero Section
  const heroLevel = document.getElementById('hero-level');
  if (heroLevel) heroLevel.textContent = profile.level || 'Level 1: Creative Start';
  
  const heroTitle = document.getElementById('hero-title');
  if (heroTitle) heroTitle.textContent = profile.title || 'Crafting Playful Worlds';
  
  const heroBio = document.getElementById('hero-bio');
  if (heroBio) heroBio.textContent = profile.bio || '';
  
  const resumeGameDevBtn = document.getElementById('hero-resume-gamedev');
  if (resumeGameDevBtn) {
    if (profile.resumeGameDev) {
      resumeGameDevBtn.href = profile.resumeGameDev;
      resumeGameDevBtn.style.display = 'inline-flex';
    } else {
      resumeGameDevBtn.style.display = 'none';
    }
  }

  const resumeAIBtn = document.getElementById('hero-resume-ai');
  if (resumeAIBtn) {
    if (profile.resumeAI) {
      resumeAIBtn.href = profile.resumeAI;
      resumeAIBtn.style.display = 'inline-flex';
    } else {
      resumeAIBtn.style.display = 'none';
    }
  }

  // Contact Panel Profile
  const profileName = document.getElementById('profile-name');
  if (profileName) profileName.textContent = profile.name || 'Artist Name';
  
  const profileTitle = document.getElementById('profile-title');
  if (profileTitle) profileTitle.textContent = profile.title || '';
  
  const profileBio = document.getElementById('profile-bio');
  if (profileBio) profileBio.textContent = profile.bio || '';
  
  const emailBtn = document.getElementById('profile-email-btn');
  if (emailBtn) {
    if (profile.email) {
      emailBtn.href = `mailto:${profile.email}`;
      emailBtn.style.display = 'inline-flex';
    } else {
      emailBtn.style.display = 'none';
    }
  }
  
  const avatarImg = document.getElementById('profile-avatar');
  const avatarPlaceholder = document.getElementById('profile-avatar-placeholder');
  if (avatarImg && avatarPlaceholder) {
    const contactImgSrc = profile.contactImage || profile.avatar;
    if (contactImgSrc) {
      avatarImg.src = contactImgSrc;
      avatarImg.classList.remove('hidden');
      avatarPlaceholder.classList.add('hidden');
    }
  }

  // Social Nodes Map
  const socials = profile.socials || {};
  const linksMap = {
    'github': document.getElementById('link-github'),
    'itchio': document.getElementById('link-itchio'),
    'linkedin': document.getElementById('link-linkedin'),
    'playstore': document.getElementById('link-playstore')
  };
  
  Object.keys(linksMap).forEach(key => {
    const linkEl = linksMap[key];
    if (linkEl) {
      if (socials[key]) {
        linkEl.href = socials[key];
        linkEl.style.display = 'flex';
      } else {
        linkEl.style.display = 'none';
      }
    }
  });

  // Footer Social Links
  const footerLinksMap = {
    'github': document.getElementById('footer-github'),
    'itchio': document.getElementById('footer-itchio'),
    'linkedin': document.getElementById('footer-linkedin'),
    'playstore': document.getElementById('footer-playstore')
  };
  
  Object.keys(footerLinksMap).forEach(key => {
    const linkEl = footerLinksMap[key];
    if (linkEl) {
      if (socials[key]) {
        linkEl.href = socials[key];
        linkEl.style.display = 'inline';
      } else {
        linkEl.style.display = 'none';
      }
    }
  });

  // Footer Copyright Text
  const currentYear = new Date().getFullYear();
  const footerCopyright = document.getElementById('footer-copyright');
  if (footerCopyright) {
    footerCopyright.textContent = `© ${currentYear} ${profile.name || 'ARTIST_CORE'}. All Rights Reserved. Built for Fun.`;
  }
  const navLogo = document.getElementById('nav-logo');
  if (navLogo) {
    navLogo.textContent = `${profile.name || 'ARTIST_CORE'}`;
  }
}

// Render Teasers
function renderTeasers(data) {
  // 1. Models Teaser
  const modelsContainer = document.getElementById('models-teaser-grid');
  modelsContainer.innerHTML = '';
  
  const teaserModels = (data.models || []).slice(0, 3);
  teaserModels.forEach(model => {
    modelsContainer.appendChild(createModelCard(model));
  });

  // 2. Games Teaser
  const gamesContainer = document.getElementById('games-teaser-grid');
  gamesContainer.innerHTML = '';
  
  const teaserGames = (data.games || []).slice(0, 2);
  teaserGames.forEach(game => {
    gamesContainer.appendChild(createGameCard(game, true)); // pass teaser flag
  });
}

// Render Models View (with filter)
function renderModels(models) {
  if (!models) return;
  
  // 1. Build Filter Bar Dynamically
  const filterBar = document.getElementById('models-filter-bar');
  filterBar.innerHTML = '';
  
  const allTags = new Set(['All']);
  models.forEach(model => {
    (model.tags || []).forEach(tag => allTags.add(tag));
  });
  
  allTags.forEach(tag => {
    const btn = document.createElement('button');
    btn.className = `px-4 py-1.5 rounded-full border-2 font-display text-xs font-bold transition-all nintendo-shadow btn-press ${tag === activeModelFilter ? 'bg-primary text-white border-primary' : 'bg-surface-container text-text-secondary border-surface-border hover:border-primary hover:text-primary'}`;
    btn.textContent = tag;
    btn.addEventListener('click', () => {
      activeModelFilter = tag;
      renderModelsGrid(models);
      renderModels(models); // Re-render filter buttons to refresh active states
    });
    filterBar.appendChild(btn);
  });
  
  // 2. Populate Grid
  renderModelsGrid(models);
}

function renderModelsGrid(models) {
  const grid = document.getElementById('models-gallery-grid');
  grid.innerHTML = '';
  
  const filtered = activeModelFilter === 'All' 
    ? models 
    : models.filter(m => (m.tags || []).includes(activeModelFilter));
    
  filtered.forEach(model => {
    grid.appendChild(createModelCard(model));
  });
}

// Create Model Card Element
function createModelCard(model) {
  const card = document.createElement('article');
  card.className = 'card-tactile rounded-xl overflow-hidden p-6 flex flex-col gap-4';
  
  // Image Frame
  const imgFrame = document.createElement('div');
  imgFrame.className = 'w-full aspect-square bg-surface-container-low rounded-lg relative overflow-hidden border-2 border-surface-container-high group';
  
  const img = document.createElement('img');
  img.alt = model.title;
  img.className = 'w-full h-full object-cover';
  // Use a fallback screenshot if model banner path doesn't exist
  img.src = model.image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60';
  imgFrame.appendChild(img);
  
  // Hover Overlay tint
  const hoverTint = document.createElement('div');
  hoverTint.className = 'absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none';
  imgFrame.appendChild(hoverTint);
  
  // Tags Overlay
  if (model.tags && model.tags.length > 0) {
    const tagsContainer = document.createElement('div');
    tagsContainer.className = 'absolute top-3 left-3 flex flex-wrap gap-1.5';
    model.tags.forEach(tag => {
      const chip = document.createElement('span');
      chip.className = 'bg-surface/90 backdrop-blur-md text-on-background border border-surface-border px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold shadow-sm';
      chip.textContent = tag;
      tagsContainer.appendChild(chip);
    });
    imgFrame.appendChild(tagsContainer);
  }
  card.appendChild(imgFrame);
  
  // Details
  const details = document.createElement('div');
  details.className = 'flex-grow flex flex-col gap-1';
  
  const title = document.createElement('h3');
  title.className = 'font-display font-extrabold text-xl text-on-background';
  title.textContent = model.title;
  
  const desc = document.createElement('p');
  desc.className = 'font-body text-sm text-text-secondary leading-relaxed line-clamp-3';
  desc.textContent = model.description;
  
  details.appendChild(title);
  details.appendChild(desc);
  card.appendChild(details);
  
  // CTAs
  const ctaContainer = document.createElement('div');
  ctaContainer.className = 'flex flex-col gap-2.5 mt-auto pt-2';
  
  // Download .blend button
  const downloadBtn = document.createElement('button');
  downloadBtn.className = 'w-full py-2.5 bg-primary text-white rounded font-display text-xs font-bold flex justify-center items-center gap-1.5 btn-tactile';
  downloadBtn.innerHTML = '<span class="material-symbols-outlined text-sm font-bold">download</span> Download .blend';
  
  if (model.modelFile) {
    downloadBtn.addEventListener('click', () => {
      window.open(model.modelFile, '_blank');
    });
  } else {
    downloadBtn.classList.add('disabled');
    downloadBtn.disabled = true;
    downloadBtn.innerHTML = '<span class="material-symbols-outlined text-sm font-bold">block</span> No 3D Download';
  }
  ctaContainer.appendChild(downloadBtn);
  
  // View Renders / Interact 3D button
  const rendersBtn = document.createElement('button');
  rendersBtn.className = 'w-full py-2.5 bg-surface text-on-background rounded border-3 border-secondary font-display text-xs font-bold flex justify-center items-center gap-1.5 btn-tactile-secondary';
  
  if (model.exported3dmodel) {
    rendersBtn.innerHTML = '<span class="material-symbols-outlined text-sm font-bold">3d_rotation</span> Interact 3D';
  } else {
    rendersBtn.innerHTML = '<span class="material-symbols-outlined text-sm font-bold">visibility</span> View Renders';
  }
  
  rendersBtn.addEventListener('click', () => {
    const rendersList = model.renders || (model.image ? [model.image] : []);
    openLightbox(rendersList, model.title, model.exported3dmodel);
  });
  ctaContainer.appendChild(rendersBtn);
  
  card.appendChild(ctaContainer);
  
  return card;
}

// Render Games View
function renderGames(games) {
  if (!games) return;
  
  const container = document.getElementById('games-list-grid');
  container.innerHTML = '';
  
  games.forEach(game => {
    container.appendChild(createGameCard(game, false));
  });
}

// Create Game Card Element
function createGameCard(game, isTeaser = false) {
  // If in teaser mode, we create a side-by-side or standard compact card.
  // Otherwise, we create the full bento/split layout card.
  const card = document.createElement('article');
  if (!isTeaser && game.id) {
    card.id = 'game-card-' + game.id;
  }
  
  if (isTeaser) {
    card.className = 'card-tactile rounded-xl overflow-hidden flex flex-col md:flex-row group';
    
    // Left: Icon or Thumbnail Frame
    const imgFrame = document.createElement('div');
    const img = document.createElement('img');
    img.alt = game.title;
    
    if (game.icon) {
      // Style as a centered application icon
      imgFrame.className = 'w-full md:w-2/5 bg-surface-container-low border-b-2 md:border-b-0 md:border-r-2 border-surface-border flex items-center justify-center p-6 relative overflow-hidden min-h-[160px]';
      img.className = 'w-24 h-24 rounded-2xl object-cover shadow-[0_4px_10px_rgba(0,0,0,0.12)] border-2 border-surface-border transition-transform duration-300 group-hover:scale-105';
      img.src = game.icon;
    } else {
      // Fallback: Style as full-cover banner
      imgFrame.className = 'w-full md:w-2/5 aspect-[4/3] md:aspect-auto bg-surface-container-low border-b-2 md:border-b-0 md:border-r-2 border-surface-border relative overflow-hidden';
      img.className = 'w-full h-full object-cover transition-transform duration-300 group-hover:scale-105';
      img.src = game.image || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=60';
    }
    
    imgFrame.appendChild(img);
    card.appendChild(imgFrame);
    
    // Right: Content Details (60% width)
    const content = document.createElement('div');
    content.className = 'p-6 flex flex-col justify-center w-full md:w-3/5 gap-3';
    
    const tagChip = document.createElement('div');
    tagChip.className = 'inline-flex items-center gap-1.5 bg-surface-container text-text-secondary px-3 py-1 rounded-full font-mono text-[10px] font-bold w-fit uppercase';
    tagChip.textContent = `${game.engine || 'Game'} / ${game.platform || 'Platform'}`;
    content.appendChild(tagChip);
    
    const title = document.createElement('h3');
    title.className = 'font-display font-extrabold text-2xl text-on-background leading-none';
    title.textContent = game.title;
    content.appendChild(title);
    
    const desc = document.createElement('p');
    desc.className = 'font-body text-xs md:text-sm text-text-secondary leading-relaxed line-clamp-3';
    desc.textContent = game.description;
    content.appendChild(desc);
    
    // Play CTA button pointing to first available play links
    const cta = document.createElement('button');
    cta.className = 'btn-tactile bg-primary text-white font-display text-xs font-bold py-2.5 px-6 rounded-full w-fit uppercase tracking-wider mt-2';
    cta.innerHTML = 'Explore Game';
    cta.addEventListener('click', () => {
      window.pendingGameScroll = game.id;
      window.location.hash = '#games';
    });
    content.appendChild(cta);
    
    card.appendChild(content);
  } else {
    // Full Page Layout (Bento structure)
    card.className = 'card-tactile p-6 md:p-8 flex flex-col gap-6';
    
    // Image Banner
    const imgFrame = document.createElement('div');
    imgFrame.className = 'w-full bg-surface-container-high rounded-lg overflow-hidden relative border-2 border-surface-border';
    
    const img = document.createElement('img');
    img.alt = game.title;
    img.className = 'w-full h-auto block';
    img.src = game.image || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=60';
    imgFrame.appendChild(img);
    
    // Status Badge inside image
    const engineBadge = document.createElement('div');
    engineBadge.className = 'absolute top-3 right-3 bg-surface/90 backdrop-blur-md text-primary px-3.5 py-1 rounded-full font-mono text-[10px] font-bold border-2 border-primary shadow-md uppercase';
    engineBadge.textContent = game.engine || 'Game Engine';
    imgFrame.appendChild(engineBadge);
    
    card.appendChild(imgFrame);
    
    // Content details grid
    const textDetails = document.createElement('div');
    textDetails.className = 'flex flex-col gap-4';
    
    const titleHeader = document.createElement('div');
    titleHeader.className = 'flex justify-between items-start flex-wrap gap-4';
    
    const titleGroup = document.createElement('div');
    const title = document.createElement('h2');
    title.className = 'font-display font-extrabold text-2xl md:text-3xl text-on-background leading-tight';
    title.textContent = game.title;
    
    const desc = document.createElement('p');
    desc.className = 'font-body text-sm text-text-secondary mt-2 leading-relaxed';
    desc.textContent = game.description;
    
    titleGroup.appendChild(title);
    titleGroup.appendChild(desc);
    titleHeader.appendChild(titleGroup);
    
    // Primary Trailer CTA (Play Trailer)
    if (game.trailerLink) {
      const trailerBtn = document.createElement('a');
      trailerBtn.href = game.trailerLink;
      trailerBtn.target = '_blank';
      trailerBtn.className = 'btn-tactile bg-primary text-white font-display font-bold px-6 py-3 rounded-full flex items-center gap-1.5 text-xs uppercase tracking-wider self-start';
      trailerBtn.innerHTML = '<span class="material-symbols-outlined fill text-sm">movie</span> Play Trailer';
      titleHeader.appendChild(trailerBtn);
    } else {
      const trailerBtn = document.createElement('button');
      trailerBtn.className = 'btn-tactile bg-primary text-white font-display font-bold px-6 py-3 rounded-full flex items-center gap-1.5 text-xs uppercase tracking-wider self-start disabled';
      trailerBtn.disabled = true;
      trailerBtn.innerHTML = '<span class="material-symbols-outlined text-sm font-bold">block</span> No Trailer';
      titleHeader.appendChild(trailerBtn);
    }
    
    textDetails.appendChild(titleHeader);
    
    // Info table panel
    const infoPanel = document.createElement('div');
    infoPanel.className = 'bg-surface-container-low p-5 rounded-lg border-2 border-surface-border flex flex-col sm:flex-row gap-gutter mt-2';
    
    const infoBlocks = [
      { label: 'Platform', val: game.platform, icon: 'desktop_windows' },
      { label: 'Status', val: game.status, icon: 'rocket_launch', highlight: true },
      { label: 'Role', val: game.role, icon: 'engineering' }
    ];
    
    infoBlocks.forEach((block, idx) => {
      const blockEl = document.createElement('div');
      blockEl.className = `flex flex-col gap-1 flex-1 ${idx > 0 ? 'border-t-2 sm:border-t-0 sm:border-l-2 border-surface-border pt-3 sm:pt-0 sm:pl-gutter' : ''}`;
      
      const label = document.createElement('span');
      label.className = 'font-display text-[10px] font-bold text-text-secondary uppercase tracking-widest';
      label.textContent = block.label;
      
      const val = document.createElement('span');
      val.className = `font-body text-sm font-semibold flex items-center gap-1.5 ${block.highlight ? 'text-primary' : 'text-on-background'}`;
      val.innerHTML = `<span class="material-symbols-outlined text-[18px] text-secondary">${block.icon}</span> ${block.val || 'N/A'}`;
      
      blockEl.appendChild(label);
      blockEl.appendChild(val);
      infoPanel.appendChild(blockEl);
    });
    textDetails.appendChild(infoPanel);
    
    // Action/Download controls (Play Online, Play store, APK links)
    const downloadsGroup = document.createElement('div');
    downloadsGroup.className = 'flex flex-wrap gap-3 mt-2';
    
    // Play Online (beside Play Store)
    if (game.webDemoLink) {
      const playBtn = document.createElement('a');
      playBtn.href = game.webDemoLink;
      playBtn.target = '_blank';
      playBtn.className = 'btn-tactile-secondary bg-surface text-on-background font-display font-bold py-2.5 px-5 rounded-full flex items-center gap-1.5 text-xs uppercase border-3 border-secondary';
      playBtn.innerHTML = '<span class="material-symbols-outlined text-sm font-bold">play_arrow</span> Play Online';
      downloadsGroup.appendChild(playBtn);
    } else {
      const playBtn = document.createElement('button');
      playBtn.className = 'btn-tactile-secondary bg-surface text-on-background font-display font-bold py-2.5 px-5 rounded-full flex items-center gap-1.5 text-xs uppercase border-3 border-secondary disabled';
      playBtn.disabled = true;
      playBtn.innerHTML = '<span class="material-symbols-outlined text-sm font-bold">block</span> No Online Version';
      downloadsGroup.appendChild(playBtn);
    }
    
    // Google Play Store
    if (game.playStoreLink) {
      const storeBtn = document.createElement('a');
      storeBtn.href = game.playStoreLink;
      storeBtn.target = '_blank';
      storeBtn.className = 'btn-tactile-secondary bg-surface text-on-background font-display font-bold py-2.5 px-5 rounded-full flex items-center gap-1.5 text-xs uppercase border-3 border-secondary';
      storeBtn.innerHTML = '<span class="material-symbols-outlined text-sm font-bold">storefront</span> Play Store';
      downloadsGroup.appendChild(storeBtn);
    }
    
    // APK Download
    if (game.apkFile) {
      const apkBtn = document.createElement('a');
      apkBtn.href = game.apkFile;
      apkBtn.className = 'btn-tactile-secondary bg-surface text-on-background font-display font-bold py-2.5 px-5 rounded-full flex items-center gap-1.5 text-xs uppercase border-3 border-secondary';
      apkBtn.innerHTML = '<span class="material-symbols-outlined text-sm font-bold">download</span> Download APK';
      downloadsGroup.appendChild(apkBtn);
    }
    
    // Unity Asset Store
    if (game.assetStoreLink) {
      const assetBtn = document.createElement('a');
      assetBtn.href = game.assetStoreLink;
      assetBtn.target = '_blank';
      assetBtn.className = 'btn-tactile-secondary bg-surface text-on-background font-display font-bold py-2.5 px-5 rounded-full flex items-center gap-1.5 text-xs uppercase border-3 border-secondary';
      assetBtn.innerHTML = '<span class="material-symbols-outlined text-sm font-bold">shopping_bag</span> Asset Store';
      downloadsGroup.appendChild(assetBtn);
    }
    
    if (downloadsGroup.children.length > 0) {
      textDetails.appendChild(downloadsGroup);
    }
    
    card.appendChild(textDetails);
  }
  
  return card;
}

// Render Construction Progress Widget
function renderProgressWidget(progressData) {
  if (!progressData) return;
  
  const progressDesc = document.getElementById('progress-desc');
  if (progressDesc) progressDesc.textContent = progressData.description || '';
  
  const progressBar = document.getElementById('progress-bar');
  if (progressBar) {
    progressBar.style.width = '0%';
    // Delay slightly to trigger visual width transition animation
    setTimeout(() => {
      progressBar.style.width = `${progressData.progress || 0}%`;
    }, 100);
  }
  
  const progressLabel = document.getElementById('progress-label');
  if (progressLabel) {
    progressLabel.textContent = progressData.progressLabel || `Development - ${progressData.progress || 0}%`;
  }
}

// Render Misc Projects (no images, clean cards with material symbols icons)
function renderMiscProjects(miscProjects) {
  if (!miscProjects) return;
  
  const container = document.getElementById('misc-projects-grid');
  if (!container) return;
  
  container.innerHTML = '';
  
  miscProjects.forEach(project => {
    const card = document.createElement('article');
    card.className = 'card-tactile p-6 flex flex-col gap-4 bg-surface';
    
    // Icon Header
    const iconHeader = document.createElement('div');
    iconHeader.className = 'w-12 h-12 rounded-lg bg-surface-container-high border-2 border-surface-border flex items-center justify-center text-primary nintendo-shadow';
    
    const icon = document.createElement('span');
    icon.className = 'material-symbols-outlined text-[28px]';
    icon.textContent = project.icon || 'code';
    iconHeader.appendChild(icon);
    card.appendChild(iconHeader);
    
    // Title & Description
    const details = document.createElement('div');
    details.className = 'flex flex-col gap-2 flex-grow';
    
    const title = document.createElement('h3');
    title.className = 'font-display font-extrabold text-xl text-on-background';
    title.textContent = project.title;
    
    const desc = document.createElement('p');
    desc.className = 'font-body text-sm text-text-secondary leading-relaxed';
    desc.textContent = project.description;
    
    details.appendChild(title);
    details.appendChild(desc);
    card.appendChild(details);
    
    // Tags list
    if (project.tags && project.tags.length > 0) {
      const tagsContainer = document.createElement('div');
      tagsContainer.className = 'flex flex-wrap gap-1.5 mt-auto pt-2';
      project.tags.forEach(tag => {
        const chip = document.createElement('span');
        chip.className = 'bg-surface-container-low text-on-background border border-surface-border px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold';
        chip.textContent = tag;
        tagsContainer.appendChild(chip);
      });
      card.appendChild(tagsContainer);
    }
    
    // Action Link Button
    if (project.link) {
      const linkBtn = document.createElement('a');
      linkBtn.href = project.link;
      linkBtn.target = '_blank';
      linkBtn.className = 'w-full py-2.5 mt-2 bg-surface text-on-background rounded border-3 border-secondary font-display text-xs font-bold flex justify-center items-center gap-1.5 btn-tactile-secondary';
      linkBtn.innerHTML = '<span class="material-symbols-outlined text-sm font-bold">link</span> View Repository';
      card.appendChild(linkBtn);
    }
    
    container.appendChild(card);
  });
}

// Contact Form Handler
function handleFormSubmit(e) {
  e.preventDefault();
  
  const name = document.getElementById('sender-name').value;
  const email = document.getElementById('sender-comms').value;
  const type = document.getElementById('transmission-type').value;
  const message = document.getElementById('message-payload').value;
  
  // Show dispatch feedback
  const banner = document.getElementById('form-success');
  banner.classList.remove('hidden');
  
  // Populate mail client window
  const subject = encodeURIComponent(`[${type}] Portfolio Inquiry from ${name}`);
  const body = encodeURIComponent(`Sender ID/Name: ${name}\nComms Email: ${email}\n\nMessage Payload:\n${message}`);
  
  setTimeout(() => {
    window.location.href = `mailto:${portfolioData.profile.email || 'your-email@example.com'}?subject=${subject}&body=${body}`;
  }, 1000);
  
  // Reset form status
  setTimeout(() => {
    document.getElementById('contact-form').reset();
    banner.classList.add('hidden');
  }, 5000);
}

// Lightbox / 3D Model Modal Controls
function openLightbox(renders, title, exported3dmodel = '') {
  currentRenders = renders || [];
  currentRenderIndex = 0;
  currentExportedModel = exported3dmodel || '';
  
  const modal = document.getElementById('renders-modal');
  if (modal) modal.classList.remove('hidden');
  
  const modalTitle = document.getElementById('modal-title');
  if (modalTitle) modalTitle.textContent = title;
  
  // Configure tabs visibility
  const modalTabs = document.getElementById('modal-tabs');
  if (modalTabs) {
    if (currentExportedModel && currentRenders.length > 0) {
      modalTabs.classList.remove('hidden');
      switchModalTab('3d');
    } else if (currentExportedModel) {
      modalTabs.classList.add('hidden');
      switchModalTab('3d');
    } else {
      modalTabs.classList.add('hidden');
      switchModalTab('renders');
    }
  } else {
    if (currentExportedModel) {
      switchModalTab('3d');
    } else {
      switchModalTab('renders');
    }
  }
  
  updateLightboxImage();
}

function closeLightbox() {
  const modal = document.getElementById('renders-modal');
  if (modal) modal.classList.add('hidden');
  
  destroyGlbViewer();
  destroyFbxViewer();
}

function loadGlbModel(url) {
  // If the model-viewer script/custom-element is not loaded or registered yet, wait for it
  if (!customElements.get('model-viewer')) {
    const loader = document.getElementById('glb-loading-indicator');
    if (loader) {
      loader.classList.remove('hidden');
      const loaderText = loader.querySelector('span:last-child');
      if (loaderText) loaderText.textContent = 'Initializing 3D Engine...';
    }
    customElements.whenDefined('model-viewer').then(() => {
      // Re-load the model once the library is defined
      loadGlbModel(url);
    });
    return;
  }

  destroyGlbViewer();
  
  const container = document.getElementById('modal-3d-container');
  if (!container) return;
  
  const loader = document.getElementById('glb-loading-indicator');
  const cachedUrl = loadedModels[url];
  const isAlreadyLoaded = !!cachedUrl;

  if (loader) {
    if (isAlreadyLoaded) {
      loader.classList.add('hidden');
    } else {
      loader.classList.remove('hidden');
      const loaderText = loader.querySelector('span:last-child');
      if (loaderText) loaderText.textContent = 'Loading 3D Model...';
    }
  }
  
  const newViewer = document.createElement('model-viewer');
  newViewer.id = 'modal-3d-viewer';
  newViewer.setAttribute('camera-controls', '');
  newViewer.setAttribute('auto-rotate', '');
  newViewer.setAttribute('shadow-intensity', '1');
  newViewer.className = 'w-full h-full bg-surface-container-low border-2 border-surface-border rounded-lg';
  newViewer.setAttribute('ar', '');
  newViewer.setAttribute('ar-modes', 'webxr scene-viewer quick-look');
  
  newViewer.addEventListener('load', () => {
    // Save the exact cache-busted URL that loaded successfully
    loadedModels[url] = newViewer.src;
    if (loader) loader.classList.add('hidden');
  });
  
  newViewer.addEventListener('progress', (event) => {
    const loaderText = document.querySelector('#glb-loading-indicator span:last-child');
    if (loaderText && typeof event.detail.totalProgress === 'number') {
      const percent = Math.round(event.detail.totalProgress * 100);
      loaderText.textContent = `Streaming model: ${percent}%`;
    }
  });
  
  const fbxContainer = document.getElementById('modal-fbx-viewer');
  container.insertBefore(newViewer, fbxContainer);

  if (isAlreadyLoaded) {
    newViewer.src = cachedUrl;
  } else {
    const cacheBuster = url.includes('?') ? '&' : '?';
    newViewer.src = url + cacheBuster + 't=' + Date.now();
  }
}

function destroyGlbViewer() {
  const viewer = document.getElementById('modal-3d-viewer');
  if (viewer) {
    viewer.removeAttribute('src');
    if (viewer.parentNode) {
      viewer.parentNode.removeChild(viewer);
    }
  }
  const loader = document.getElementById('glb-loading-indicator');
  if (loader) {
    loader.classList.add('hidden');
  }
}

function switchModalTab(tab) {
  const tab3d = document.getElementById('tab-3d');
  const tabRenders = document.getElementById('tab-renders');
  const container3d = document.getElementById('modal-3d-container');
  const containerRenders = document.getElementById('modal-renders-container');
  const indicators = document.getElementById('modal-indicators');
  const fbxContainer = document.getElementById('modal-fbx-viewer');
  
  const isFbx = currentExportedModel && currentExportedModel.toLowerCase().endsWith('.fbx');

  if (tab === '3d') {
    if (container3d) container3d.classList.remove('hidden');
    if (containerRenders) containerRenders.classList.add('hidden');
    if (indicators) indicators.classList.add('hidden');
    
    if (tab3d) {
      tab3d.className = 'px-4 py-2 bg-primary text-white border-2 border-primary rounded-lg font-display text-xs font-bold transition-all nintendo-shadow btn-press';
    }
    if (tabRenders) {
      tabRenders.className = 'px-4 py-2 bg-surface-container text-text-secondary border-2 border-surface-border rounded-lg font-display text-xs font-bold transition-all hover:border-primary hover:text-primary';
    }

    // Load/re-initialize 3D view if we have a model
    if (currentExportedModel) {
      if (isFbx) {
        if (fbxContainer) fbxContainer.classList.remove('hidden');
        destroyGlbViewer();
        // Only initialize if not already running
        if (!fbxScene) {
          initFbxViewer(currentExportedModel);
        }
      } else {
        if (fbxContainer) fbxContainer.classList.add('hidden');
        // Only load GLB if it's not already loaded in the DOM
        const existingViewer = document.getElementById('modal-3d-viewer');
        if (!existingViewer) {
          loadGlbModel(currentExportedModel);
        }
      }
    }
  } else {
    // Switching to renders tab (so 3D screen is closed/hidden)
    if (container3d) container3d.classList.add('hidden');
    if (containerRenders) containerRenders.classList.remove('hidden');
    if (indicators && currentRenders.length > 1) {
      indicators.classList.remove('hidden');
    }
    
    if (tab3d) {
      tab3d.className = 'px-4 py-2 bg-surface-container text-text-secondary border-2 border-surface-border rounded-lg font-display text-xs font-bold transition-all hover:border-primary hover:text-primary';
    }
    if (tabRenders) {
      tabRenders.className = 'px-4 py-2 bg-primary text-white border-2 border-primary rounded-lg font-display text-xs font-bold transition-all nintendo-shadow btn-press';
    }

    // Do NOT destroy GLB viewer here, to keep it loaded when switching back.
    // Clean up FBX to save performance since it uses canvas animation loop.
    if (isFbx) {
      destroyFbxViewer();
      if (fbxContainer) {
        fbxContainer.classList.add('hidden');
      }
    }
  }
}

function updateLightboxImage() {
  const img = document.getElementById('modal-img');
  if (img) img.src = currentRenders[currentRenderIndex] || '';
  
  // Update indicator dots
  const indicatorsContainer = document.getElementById('modal-indicators');
  if (indicatorsContainer) {
    indicatorsContainer.innerHTML = '';
    // Only show indicators if multiple renders exist and renders gallery is currently visible
    const containerRenders = document.getElementById('modal-renders-container');
    const rendersVisible = containerRenders && !containerRenders.classList.contains('hidden');
    
    if (currentRenders.length > 1 && rendersVisible) {
      indicatorsContainer.classList.remove('hidden');
      currentRenders.forEach((_, idx) => {
        const dot = document.createElement('button');
        dot.className = `w-2 h-2 rounded-full transition-colors ${idx === currentRenderIndex ? 'bg-primary' : 'bg-surface-container-high'}`;
        dot.addEventListener('click', () => {
          currentRenderIndex = idx;
          updateLightboxImage();
        });
        indicatorsContainer.appendChild(dot);
      });
    } else {
      indicatorsContainer.classList.add('hidden');
    }
  }
}

function nextLightboxImage() {
  if (currentRenders.length <= 1) return;
  currentRenderIndex = (currentRenderIndex + 1) % currentRenders.length;
  updateLightboxImage();
}

function prevLightboxImage() {
  if (currentRenders.length <= 1) return;
  currentRenderIndex = (currentRenderIndex - 1 + currentRenders.length) % currentRenders.length;
  updateLightboxImage();
}

// Dark/Light Theme Handler
function initTheme() {
  if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
    updateThemeToggleIcon(true);
  } else {
    document.documentElement.classList.remove('dark');
    updateThemeToggleIcon(false);
  }
}

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.theme = isDark ? 'dark' : 'light';
  updateThemeToggleIcon(isDark);
  if (fbxScene) {
    fbxScene.background = new THREE.Color(isDark ? 0x08080c : 0xF9F9F9);
  }
}

function updateThemeToggleIcon(isDark) {
  const icon = document.querySelector('#theme-toggle span');
  if (icon) {
    icon.textContent = isDark ? 'dark_mode' : 'light_mode';
  }
}

// ==================== THREE.JS FBX VIEW HUB ====================

function initFbxViewer(fileUrl) {
  // Clean up any existing viewer instance, animation loops, and GPU resources first
  destroyFbxViewer();

  const container = document.getElementById('modal-fbx-viewer');
  if (!container) return;

  // Clear container DOM
  container.innerHTML = '';

  // Show loading indicator
  const loaderEl = document.createElement('div');
  loaderEl.id = 'fbx-loading-indicator';
  loaderEl.className = 'absolute inset-0 flex flex-col items-center justify-center bg-surface-container-low text-text-secondary font-mono text-sm gap-3 z-10';
  loaderEl.innerHTML = `
    <span class="material-symbols-outlined text-4xl animate-spin text-primary">autorenew</span>
    <span>Initializing 3D Viewer...</span>
  `;
  container.appendChild(loaderEl);

  // Set up Three.js Scene, Camera, and Renderer
  fbxScene = new THREE.Scene();
  
  // Match theme colors for background
  const isDark = document.documentElement.classList.contains('dark');
  fbxScene.background = new THREE.Color(isDark ? 0x08080c : 0xF9F9F9);

  const width = container.clientWidth || 400;
  const height = container.clientHeight || 300;
  
  fbxCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
  
  fbxRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  fbxRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  fbxRenderer.setSize(width, height, false);
  fbxRenderer.shadowMap.enabled = true;
  container.appendChild(fbxRenderer.domElement);

  // Set up ResizeObserver to handle element size changes (modal opening, tab toggling, window resizing)
  fbxResizeObserver = new ResizeObserver((entries) => {
    for (let entry of entries) {
      const w = entry.contentRect.width;
      const h = entry.contentRect.height;
      if (w > 0 && h > 0) {
        if (fbxRenderer && fbxCamera) {
          fbxRenderer.setSize(w, h, false);
          fbxCamera.aspect = w / h;
          fbxCamera.updateProjectionMatrix();
        }
      }
    }
  });
  fbxResizeObserver.observe(container);

  // Orbit Controls
  fbxControls = new THREE.OrbitControls(fbxCamera, fbxRenderer.domElement);
  fbxControls.enableDamping = true;
  fbxControls.dampingFactor = 0.05;
  fbxControls.screenSpacePanning = true;

  // Lights Setup
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  fbxScene.add(ambientLight);

  const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight1.position.set(20, 40, 20);
  dirLight1.castShadow = true;
  fbxScene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
  dirLight2.position.set(-20, -20, -20);
  fbxScene.add(dirLight2);

  // Load FBX Model
  const loader = new THREE.FBXLoader();
  loader.load(
    fileUrl,
    (fbxModel) => {
      // Hide loader indicator
      if (loaderEl.parentNode) {
        loaderEl.parentNode.removeChild(loaderEl);
      }

      // Add to scene
      fbxScene.add(fbxModel);

      // Center the model & adjust camera dynamically
      const box = new THREE.Box3().setFromObject(fbxModel);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      // Center model pivot
      fbxModel.position.sub(center);

      // Fit camera to object bounding size
      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      const fovRad = fbxCamera.fov * (Math.PI / 180);
      let cameraDistance = Math.abs(maxDim / 2 / Math.tan(fovRad / 2));
      cameraDistance *= 1.5; // Padding factor

      fbxCamera.position.set(cameraDistance * 0.5, cameraDistance * 0.5, cameraDistance);
      fbxCamera.lookAt(0, 0, 0);

      fbxCamera.near = maxDim / 100;
      fbxCamera.far = maxDim * 100;
      fbxCamera.updateProjectionMatrix();

      fbxControls.target.set(0, 0, 0);
      fbxControls.update();

      // Start rendering loop
      animateFbx();
    },
    (xhr) => {
      if (xhr.total > 0) {
        const percent = Math.round((xhr.loaded / xhr.total) * 100);
        const textSpan = loaderEl.querySelector('span:last-child');
        if (textSpan) textSpan.textContent = `Streaming model: ${percent}%`;
      }
    },
    (error) => {
      console.error('An error happened loading FBX model:', error);
      loaderEl.innerHTML = `
        <span class="material-symbols-outlined text-4xl text-primary">error</span>
        <span class="text-center px-4">Failed to render FBX model.<br><small class="text-text-secondary">Please check format compatibility.</small></span>
      `;
    }
  );
}

function animateFbx() {
  fbxAnimationId = requestAnimationFrame(animateFbx);
  if (fbxControls) fbxControls.update();
  if (fbxRenderer && fbxScene && fbxCamera) {
    fbxRenderer.render(fbxScene, fbxCamera);
  }
}

function destroyFbxViewer() {
  if (fbxAnimationId) {
    cancelAnimationFrame(fbxAnimationId);
    fbxAnimationId = null;
  }
  
  if (fbxResizeObserver) {
    fbxResizeObserver.disconnect();
    fbxResizeObserver = null;
  }

  if (fbxControls) {
    fbxControls.dispose();
    fbxControls = null;
  }

  if (fbxRenderer) {
    fbxRenderer.dispose();
    if (fbxRenderer.domElement && fbxRenderer.domElement.parentNode) {
      fbxRenderer.domElement.parentNode.removeChild(fbxRenderer.domElement);
    }
    fbxRenderer = null;
  }

  if (fbxScene) {
    // Traverse and clean up objects/textures/geometries
    fbxScene.traverse((object) => {
      if (!object.isMesh) return;
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => cleanMaterial(material));
        } else {
          cleanMaterial(object.material);
        }
      }
    });
    fbxScene = null;
  }

  fbxCamera = null;

  const container = document.getElementById('modal-fbx-viewer');
  if (container) {
    container.innerHTML = '';
  }
}

function cleanMaterial(material) {
  material.dispose();
  for (const key of Object.keys(material)) {
    const value = material[key];
    if (value && typeof value.dispose === 'function') {
      value.dispose();
    }
  }
}
