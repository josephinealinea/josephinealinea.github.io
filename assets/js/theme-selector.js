// Theme Selector and Navigation Functionality
function initializeThemeSelector() {
    console.log('Initializing theme selector...');
    
    // Theme Selector Functionality
    const themeToggle = document.getElementById('theme-toggle');
    const themeDropdown = document.getElementById('theme-dropdown');
    const themeOptions = document.querySelectorAll('.theme-option');
    
               console.log('Theme selector elements:', { 
               themeToggle: !!themeToggle, 
               themeDropdown: !!themeDropdown, 
               themeOptions: themeOptions.length 
           });
           
           // Additional debugging for theme selector visibility
           if (themeDropdown) {
               console.log('Theme dropdown initial display:', themeDropdown.style.display);
               console.log('Theme dropdown classes:', themeDropdown.className);
           }
    
    // Toggle theme dropdown
    if (themeToggle) {
        themeToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Theme toggle clicked');
            if (themeDropdown) {
                themeDropdown.classList.toggle('show');
            }
        });
    } else {
        console.error('Theme toggle not found');
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.theme-selector')) {
            if (themeDropdown) {
                console.log('Closing dropdown - clicked outside');
                themeDropdown.classList.remove('show');
            }
        }
    });
    
    // Theme switching logic
    themeOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation(); // Prevent event from bubbling up
            const theme = this.getAttribute('data-theme');
            console.log('Theme selected:', theme);
            
            // Update active state
            themeOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            
            // Apply theme
            applyTheme(theme);
            
            // Close dropdown with a small delay to ensure theme is applied
            setTimeout(() => {
                if (themeDropdown) {
                    console.log('Closing dropdown - theme selected');
                    themeDropdown.classList.remove('show');
                }
            }, 100);
        });
    });
    
               // Load saved theme
           const savedTheme = localStorage.getItem('selectedTheme') || 'jekyll-minima';
           console.log('Loading saved theme:', savedTheme);
           
           // Set active theme option first
           const activeOption = document.querySelector(`[data-theme="${savedTheme}"]`);
           if (activeOption) {
               activeOption.classList.add('active');
           }
           
           // Initialize theme display
           updateThemeDisplay(savedTheme);
           
           // Apply theme after a short delay to ensure DOM is ready
           setTimeout(() => {
               applyTheme(savedTheme);
           }, 50);
           
           // Add test function for debugging (remove in production)
           window.testThemeDropdown = function() {
               if (themeDropdown) {
                   console.log('Testing dropdown visibility...');
                   themeDropdown.classList.toggle('show');
                   console.log('Dropdown show class:', themeDropdown.classList.contains('show'));
               }
           };
}

function updateBodyPadding() {
    var header = document.querySelector('.site-header');
    if (header) {
        document.body.style.paddingTop = header.offsetHeight + 'px';
    }
}

function initializeNavigation() {
    updateBodyPadding();
    // The header's height depends on the web fonts and theme CSS, which can
    // finish after DOMContentLoaded; without a re-measure the page content
    // starts underneath the fixed header (seen on Retro-Game post titles).
    window.addEventListener('load', updateBodyPadding);
    var siteHeader = document.querySelector('.site-header');
    if (siteHeader && 'ResizeObserver' in window) {
        new ResizeObserver(updateBodyPadding).observe(siteHeader);
    }
    window.addEventListener('resize', function() {
        updateBodyPadding();
        // Re-render toggle label when viewport crosses the mobile breakpoint
        var savedTheme = localStorage.getItem('selectedTheme') || 'jekyll-minima';
        updateThemeDisplay(savedTheme);
    });

    // Smooth Scrolling and Active Menu Highlighting
    const navLinks = document.querySelectorAll('.site-nav .page-link');
    const sections = document.querySelectorAll('.section');
    
    // Smooth scroll to sections
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            // Links without a "#" (e.g. /travel/, /projects/) are plain
            // page links — never intercept those.
            if (!href || href.indexOf('#') === -1) {
                return;
            }

            const targetId = href.split('#')[1];
            const targetSection = document.getElementById(targetId);

            // If the target section exists on THIS page, smooth-scroll to
            // it. Otherwise (e.g. clicking "About Me" while on /travel/),
            // let the browser navigate normally — the href already points
            // to "/#about-me", so it'll load the homepage and jump there.
            if (!targetSection) {
                return;
            }

            e.preventDefault();

            const headerHeight = document.querySelector('.site-header')?.offsetHeight || 60;
            const targetPosition = targetSection.offsetTop - headerHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
            });
        });
    });
    
    // Highlight the menu entry for where the visitor is. On the home page that
    // is the section in view; on any other page it is that page's own entry
    // (Blogs, Projects, Travels). Nav hrefs look like "/#about-me" (the site's
    // base URL comes first), so match on the "#id" ending, not the whole href.
    function setActiveLink(link) {
        navLinks.forEach(l => {
            l.classList.remove('active');
            l.removeAttribute('aria-current');
        });
        if (link) {
            link.classList.add('active');
            link.setAttribute('aria-current', link.getAttribute('href').indexOf('#') !== -1 ? 'location' : 'page');
        }
    }

    function updateActiveMenu() {
        if (!sections.length) {
            // Not the home page: pick the entry whose path the page sits under.
            const here = location.pathname.replace(/index\.html$/, '');
            let match = null;
            navLinks.forEach(l => {
                const href = l.getAttribute('href');
                if (!href || href.indexOf('#') !== -1) return;
                const path = new URL(href, location.href).pathname;
                if (path !== '/' && here.indexOf(path) === 0) match = l;
            });
            setActiveLink(match);
            return;
        }

        const headerHeight = document.querySelector('.site-header')?.offsetHeight || 60;
        const scrollPosition = window.scrollY + headerHeight + 24;
        // Welcome counts as current until the next section reaches the header.
        let current = sections[0];
        sections.forEach(section => {
            const top = section.getBoundingClientRect().top + window.scrollY;
            if (scrollPosition >= top) current = section;
        });
        // The last section is often too short to ever reach the top of the
        // screen, so at the very bottom of the page it counts as current.
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
            current = sections[sections.length - 1];
        }
        setActiveLink(current ? Array.from(navLinks).find(l => (l.getAttribute('href') || '').endsWith('#' + current.id)) : null);
    }

    // Listen for scroll events (once per frame)
    let activeMenuQueued = false;
    window.addEventListener('scroll', () => {
        if (activeMenuQueued) return;
        activeMenuQueued = true;
        requestAnimationFrame(() => { activeMenuQueued = false; updateActiveMenu(); });
    }, { passive: true });
    window.addEventListener('resize', updateActiveMenu);

    // Initialize active menu on page load
    updateActiveMenu();
}

function initializeSkillBars() {
    // Animate skill bars when they come into view
    const skillBars = document.querySelectorAll('.skill-bar');
    
    function animateSkillBars() {
        skillBars.forEach(bar => {
            const barTop = bar.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (barTop < windowHeight - 100) {
                const level = bar.getAttribute('data-level');
                bar.style.width = level + '%';
            }
        });
    }
    
    // Listen for scroll events to animate skill bars
    window.addEventListener('scroll', animateSkillBars);
    
    // Initialize skill bars animation on page load
    animateSkillBars();
}

// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM fully loaded, initializing components...');
        initializeThemeSelector();
        initializeNavigation();
        initializeSkillBars();
    });
} else {
    // DOM is already loaded
    console.log('DOM already loaded, initializing components...');
    initializeThemeSelector();
    initializeNavigation();
    initializeSkillBars();
}

       // Registry of all themes: which <link> stylesheet id to enable (all
       // others get disabled) and the toggle-button label at each width.
       // Adding a new theme means adding one entry here, one entry in
       // theme-selector.html's dropdown, and one <link id="..." disabled>
       // in head.html — nothing else in this file needs to change.
       const THEME_REGISTRY = {
           'jekyll-minima': { stylesheetId: 'main-css', labelFull: 'Papyrus Theme', labelShort: 'Papyrus' },
           'retro-game': { stylesheetId: 'retro-game-css', labelFull: 'Retro-Game FF7', labelShort: 'FF7' }
           // Switched off, stylesheets kept in assets/ — restore these to bring them back:
           // 'y2k-theme': { stylesheetId: 'y2k-theme-css', labelFull: 'Y2K Theme', labelShort: 'Y2K' },
           // 'manila-theme': { stylesheetId: 'manila-theme-css', labelFull: 'Manila Theme', labelShort: 'Manila' }
       };
       const THEME_NAMES = Object.keys(THEME_REGISTRY);

       // Theme application function
       function applyTheme(theme) {
           // A theme saved by a visitor but since switched off (y2k, manila)
           // falls back to Papyrus instead of leaving an orphan body class.
           if (!THEME_REGISTRY[theme]) theme = 'jekyll-minima';
           console.log('Applying theme:', theme);

           const config = THEME_REGISTRY[theme];

           // Remove existing theme classes
           document.body.classList.remove(...THEME_NAMES.map(name => `theme-${name}`));

           // Add new theme class
           document.body.classList.add(`theme-${theme}`);

           // Save theme preference
           localStorage.setItem('selectedTheme', theme);

           // Update theme display
           updateThemeDisplay(theme);

           // Recalculate body padding — retro header may have different height
           setTimeout(updateBodyPadding, 50);

           // Update CSS file loading - enable only the active theme's stylesheet
           THEME_NAMES.forEach(name => {
               const link = document.getElementById(THEME_REGISTRY[name].stylesheetId);
               if (link) link.disabled = THEME_REGISTRY[name].stylesheetId !== config.stylesheetId;
           });
           console.log('Active stylesheet:', config.stylesheetId);
       }

       // Function to update theme display name in the toggle button.
       // Uses short labels on mobile (≤768px) to match the dropdown options.
       function updateThemeDisplay(theme) {
           const currentThemeSpan = document.getElementById('current-theme');
           if (currentThemeSpan) {
               const isMobile = window.innerWidth <= 768;
               const config = THEME_REGISTRY[theme] || THEME_REGISTRY['jekyll-minima'];
               currentThemeSpan.textContent = isMobile ? config.labelShort : config.labelFull;
           }
       }
