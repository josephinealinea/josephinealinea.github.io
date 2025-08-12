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

function initializeNavigation() {
    // Smooth Scrolling and Active Menu Highlighting
    const navLinks = document.querySelectorAll('.site-nav .page-link');
    const sections = document.querySelectorAll('.section');
    
    // Smooth scroll to sections
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('.site-header')?.offsetHeight || 60;
                const targetPosition = targetSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Update active menu item based on scroll position
    function updateActiveMenu() {
        const scrollPosition = window.scrollY + 100; // Offset for header
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                // Remove active class from all links
                navLinks.forEach(link => link.classList.remove('active'));
                
                // Add active class to corresponding link
                const activeLink = document.querySelector(`[href="#${sectionId}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }
    
    // Listen for scroll events
    window.addEventListener('scroll', updateActiveMenu);
    
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

       // Theme application function
       function applyTheme(theme) {
           console.log('Applying theme:', theme);
           
           // Remove existing theme classes
           document.body.classList.remove('theme-jekyll-minima', 'theme-retro-game');
           
           // Add new theme class
           document.body.classList.add(`theme-${theme}`);
           
           // Save theme preference
           localStorage.setItem('selectedTheme', theme);
           
           // Update theme display
           updateThemeDisplay(theme);
           
           // Update CSS file loading - enable/disable appropriate CSS files
           const mainCss = document.getElementById('main-css');
           const retroGameCss = document.getElementById('retro-game-css');
           
           console.log('CSS elements found:', { 
               mainCss: !!mainCss, 
               retroGameCss: !!retroGameCss 
           });
           
           if (mainCss && retroGameCss) {
               if (theme === 'retro-game') {
                   // Enable retro-game theme, disable main theme
                   mainCss.disabled = true;
                   retroGameCss.disabled = false;
                   console.log('Retro-game theme enabled - main CSS disabled:', mainCss.disabled, 'retro CSS disabled:', retroGameCss.disabled);
               } else {
                   // Enable main theme, disable retro-game theme
                   mainCss.disabled = false;
                   retroGameCss.disabled = true;
                   console.log('Jekyll-Minima theme enabled - main CSS disabled:', mainCss.disabled, 'retro CSS disabled:', retroGameCss.disabled);
               }
           } else {
               console.error('CSS elements not found for theme switching');
           }
       }
       
       // Function to update theme display name
       function updateThemeDisplay(theme) {
           const currentThemeSpan = document.getElementById('current-theme');
           if (currentThemeSpan) {
               if (theme === 'retro-game') {
                   currentThemeSpan.textContent = 'Retro-Game';
               } else {
                   currentThemeSpan.textContent = 'Jekyll-Minima';
               }
           }
       }
