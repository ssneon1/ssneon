// ====== DOM ELEMENTS ======
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section');
const skillCards = document.querySelectorAll('.skill-card');
const projectCards = document.querySelectorAll('.project-card');
const contactForm = document.getElementById('contactForm');
const statNumbers = document.querySelectorAll('.stat-number');
const progressBars = document.querySelectorAll('.progress');

// ====== MOBILE NAVIGATION ======
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
  });
});

// ====== SMOOTH SCROLLING ======
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = link.getAttribute('href');
    const targetSection = document.querySelector(targetId);
    
    if (targetSection) {
      const offsetTop = targetSection.offsetTop - 70; // Account for fixed navbar
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  });
});

// ====== ACTIVE NAVIGATION ======
window.addEventListener('scroll', () => {
  let current = '';
  const scrollPosition = window.scrollY + 100;

  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    
    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
});

// ====== SCROLL ANIMATIONS ======
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-in');
    }
  });
}, observerOptions);

// Observe skill cards and project cards
skillCards.forEach(card => observer.observe(card));
projectCards.forEach(card => observer.observe(card));

// ====== ANIMATED COUNTERS ======
const animateCounter = (element, target) => {
  let current = 0;
  const increment = target / 100;
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    element.textContent = Math.floor(current);
  }, 20);
};

// ====== PROGRESS BARS ======
const animateProgressBars = () => {
  progressBars.forEach(progress => {
    const width = progress.getAttribute('data-width');
    progress.style.width = `${width}%`;
  });
};

// ====== SCROLL TRIGGERED ANIMATIONS ======
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const target = parseInt(entry.target.getAttribute('data-target'));
      animateCounter(entry.target, target);
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

statNumbers.forEach(stat => statsObserver.observe(stat));

// ====== SKILLS ANIMATION ======
const skillsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateProgressBars();
      skillsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const skillsSection = document.querySelector('.skills');
if (skillsSection) {
  skillsObserver.observe(skillsSection);
}

// ====== CONTACT FORM HANDLING ======
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(contactForm);
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');
    
    // Simple validation
    if (!name || !email || !message) {
      showNotification('Please fill in all fields', 'error');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showNotification('Please enter a valid email address', 'error');
      return;
    }
    
    // Simulate form submission
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
      showNotification('Message sent successfully!', 'success');
      contactForm.reset();
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }, 2000);
  });
}

// ====== NOTIFICATION SYSTEM ======
function showNotification(message, type = 'info') {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll('.notification');
  existingNotifications.forEach(notification => notification.remove());
  
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
      <span>${message}</span>
    </div>
  `;
  
  // Add styles
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 10px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    transform: translateX(400px);
    transition: transform 0.3s ease;
    max-width: 300px;
  `;
  
  // Add to page
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // Remove after 5 seconds
  setTimeout(() => {
    notification.style.transform = 'translateX(400px)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 5000);
}

// ====== PARALLAX EFFECT ======
window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  const parallaxElements = document.querySelectorAll('.floating-card');
  
  parallaxElements.forEach((element, index) => {
    const speed = 0.5 + (index * 0.1);
    element.style.transform = `translateY(${scrolled * speed}px)`;
  });
});

// ====== TYPING EFFECT ======
function typeWriter(element, text, speed = 100) {
  let i = 0;
  element.innerHTML = '';
  
  function type() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }
  
  type();
}

// ====== HOVER EFFECTS ======
// Add hover effects to skill cards
skillCards.forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.transform = 'translateY(-10px) scale(1.02)';
  });
  
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'translateY(0) scale(1)';
  });
});

// ====== LOADING ANIMATION ======
window.addEventListener('load', () => {
  // Add loading animation
  const loader = document.createElement('div');
  loader.className = 'page-loader';
  loader.innerHTML = `
    <div class="loader-content">
      <div class="loader-spinner"></div>
      <p>Loading...</p>
    </div>
  `;
  
  loader.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #0a0a0a;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    transition: opacity 0.5s ease;
  `;
  
  document.body.appendChild(loader);
  
  // Remove loader after page loads
  setTimeout(() => {
    loader.style.opacity = '0';
    setTimeout(() => {
      if (loader.parentNode) {
        loader.parentNode.removeChild(loader);
      }
    }, 500);
  }, 1000);
});

// ====== SCROLL TO TOP ======
// Create scroll to top button
const scrollToTopBtn = document.createElement('button');
scrollToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
scrollToTopBtn.className = 'scroll-to-top';
scrollToTopBtn.style.cssText = `
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 1000;
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
`;

document.body.appendChild(scrollToTopBtn);

// Show/hide scroll to top button
window.addEventListener('scroll', () => {
  if (window.scrollY > 500) {
    scrollToTopBtn.style.opacity = '1';
    scrollToTopBtn.style.visibility = 'visible';
  } else {
    scrollToTopBtn.style.opacity = '0';
    scrollToTopBtn.style.visibility = 'hidden';
  }
});

// Scroll to top functionality
scrollToTopBtn.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

// ====== CURSOR EFFECT ======
// Create custom cursor effect
const cursor = document.createElement('div');
cursor.className = 'custom-cursor';
cursor.style.cssText = `
  position: fixed;
  width: 20px;
  height: 20px;
  background: rgba(102, 126, 234, 0.5);
  border-radius: 50%;
  pointer-events: none;
  z-index: 10000;
  transition: transform 0.1s ease;
  mix-blend-mode: difference;
`;

document.body.appendChild(cursor);

// Update cursor position
document.addEventListener('mousemove', (e) => {
  cursor.style.left = e.clientX - 10 + 'px';
  cursor.style.top = e.clientY - 10 + 'px';
});

// Cursor hover effect
const interactiveElements = document.querySelectorAll('a, button, .skill-card, .project-card');
interactiveElements.forEach(element => {
  element.addEventListener('mouseenter', () => {
    cursor.style.transform = 'scale(2)';
    cursor.style.background = 'rgba(102, 126, 234, 0.8)';
  });
  
  element.addEventListener('mouseleave', () => {
    cursor.style.transform = 'scale(1)';
    cursor.style.background = 'rgba(102, 126, 234, 0.5)';
  });
});

// ====== PERFORMANCE OPTIMIZATION ======
// Throttle scroll events
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

// Apply throttling to scroll events
window.addEventListener('scroll', throttle(() => {
  // Scroll-based animations
}, 16)); // ~60fps

// ====== ERROR HANDLING ======
window.addEventListener('error', (e) => {
  console.error('JavaScript error:', e.error);
  showNotification('Something went wrong. Please refresh the page.', 'error');
});

// ====== ACCESSIBILITY ======
// Add keyboard navigation
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    // Close mobile menu
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
  }
});

// Add focus styles for better accessibility
const focusableElements = document.querySelectorAll('a, button, input, textarea');
focusableElements.forEach(element => {
  element.addEventListener('focus', () => {
    element.style.outline = '2px solid #667eea';
    element.style.outlineOffset = '2px';
  });
  
  element.addEventListener('blur', () => {
    element.style.outline = 'none';
  });
});

// ====== INITIALIZATION ======
document.addEventListener('DOMContentLoaded', () => {
  // Initialize any additional features
  console.log('Front page loaded successfully!');
  
  // Add smooth reveal animation to hero section
  const heroTitle = document.querySelector('.hero-title');
  if (heroTitle) {
    setTimeout(() => {
      typeWriter(heroTitle, 'Siddharth Srivastava', 100);
    }, 500);
  }
});
