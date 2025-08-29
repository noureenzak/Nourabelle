
    // Enhanced product navigation
    function goToProduct(productId) {
      window.location.href = `product.html?product=${productId}`;
    }

    // Filter functionality
    document.addEventListener('DOMContentLoaded', function() {
      const filterBtns = document.querySelectorAll('.filter-btn');
      const sortSelect = document.getElementById('sortSelect');
      const productItems = document.querySelectorAll('.product-item');

      // Filter products
      filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
          // Remove active class from all buttons
          filterBtns.forEach(b => b.classList.remove('active'));
          // Add active class to clicked button
          this.classList.add('active');
          
          const filter = this.dataset.filter;
          filterProducts(filter);
        });
      });

      // Sort products
      if (sortSelect) {
        sortSelect.addEventListener('change', function() {
          sortProducts(this.value);
        });
      }

      function filterProducts(category) {
        productItems.forEach(item => {
          const productCategory = item.dataset.category;
          
          if (category === 'all' || productCategory === category) {
            item.style.display = 'block';
            // Add animation
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            setTimeout(() => {
              item.style.transition = 'all 0.6s ease';
              item.style.opacity = '1';
              item.style.transform = 'translateY(0)';
            }, 100);
          } else {
            item.style.display = 'none';
          }
        });
      }

      function sortProducts(sortBy) {
        const grid = document.querySelector('.products-grid');
        const items = Array.from(productItems);
        
        items.sort((a, b) => {
          const priceA = parseInt(a.dataset.price);
          const priceB = parseInt(b.dataset.price);
          
          switch(sortBy) {
            case 'price-low':
              return priceA - priceB;
            case 'price-high':
              return priceB - priceA;
            case 'name':
              return a.dataset.name.localeCompare(b.dataset.name);
            default:
              return 0;
          }
        });
        
        // Re-append sorted items
        items.forEach(item => grid.appendChild(item));
      }

      // Quick add to cart functionality
      window.quickAddToCart = function(productId, event) {
        event.stopPropagation();
        
        // Add visual feedback
        const btn = event.target;
        const originalText = btn.innerHTML;
        btn.innerHTML = '✓ Added!';
        btn.style.background = '#27ae60';
        
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.style.background = '';
        }, 1500);
        
        // Add to cart logic (integrate with your existing cart system)
        console.log('Quick add to cart:', productId);
      };

      // Initialize animations
      setTimeout(() => {
        productItems.forEach((item, index) => {
          item.style.opacity = '0';
          item.style.transform = 'translateY(20px)';
          setTimeout(() => {
            item.style.transition = 'all 0.6s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
          }, index * 100);
        });
      }, 200);
    });
 