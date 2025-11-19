document.addEventListener('DOMContentLoaded', async () => {
    // --- DOM Elements ---
    const carousel = document.getElementById('carousel');
    const productForm = document.getElementById('product-form');
    const productIdInput = document.getElementById('product-id');
    const productNameInput = document.getElementById('product-name');
    productNameInput.maxLength = 75;
    const productPriceInput = document.getElementById('product-price');
    const productImageInput = document.getElementById('product-image');
    const productList = document.getElementById('product-list');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const paginationControls = document.getElementById('pagination-controls');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');
    
    // Customization Elements
    const backgroundColorInput = document.getElementById('background-color');
    const backgroundImageInput = document.getElementById('background-image');
    const carouselSpeedInput = document.getElementById('carousel-speed');
    const productNameColorInput = document.getElementById('product-name-color');
    const productPriceColorInput = document.getElementById('product-price-color');
    const productPriceBgColorInput = document.getElementById('product-price-bg-color');
    const productNameFontSizeInput = document.getElementById('product-name-font-size');
    const productPriceFontSizeInput = document.getElementById('product-price-font-size');
    const productNameShadowInput = document.getElementById('product-name-shadow');
    const productPriceBorderInput = document.getElementById('product-price-border');
    const resetCustomizationBtn = document.getElementById('reset-customization');

    // --- State ---
    let allProducts = [];
    let currentIndex = 0;
    let carouselInterval;
    let currentPage = 1;
    const itemsPerPage = 6; // Show 6 products per page

    // --- Main App Logic ---

    async function refreshProducts() {
        try {
            allProducts = await getAllProducts();
            // Render only the current page of products
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const paginatedProducts = allProducts.slice(startIndex, endIndex);
            
            renderProductsUI(paginatedProducts, allProducts);
            updatePaginationUI();
            applyCustomization();
            startCarousel();
        } catch (error) {
            console.error("Failed to refresh products:", error);
        }
    }

    function renderProductsUI(productsToRender, allProductsForCarousel) {
        // Clear previous content and revoke old object URLs
        carousel.innerHTML = '';
        productList.querySelectorAll('img').forEach(img => {
            if (img.src.startsWith('blob:')) {
                URL.revokeObjectURL(img.src);
            }
        });
        productList.innerHTML = '';

        if (allProductsForCarousel.length === 0) {
            carousel.innerHTML = '<div class="product-card"><p>Nenhum produto cadastrado.</p></div>';
            stopCarousel();
            return;
        }

        // Carousel should always have all products to cycle through
        allProductsForCarousel.forEach(product => {
            const imageUrl = product.image instanceof Blob ? URL.createObjectURL(product.image) : product.image;
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');
            productCard.innerHTML = `
                <img src="${imageUrl}" alt="${product.name}">
                <div class="product-card-text">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-price">R$ ${product.price.toFixed(2).replace('.', ',')}</p>
                </div>
            `;
            carousel.appendChild(productCard);
        });

        // Product list only shows the paginated items
        productsToRender.forEach((product) => {
            const imageUrl = product.image instanceof Blob ? URL.createObjectURL(product.image) : product.image;
            const listItem = document.createElement('div');
            listItem.classList.add('product-list-card');
            listItem.dataset.id = product.id;
            listItem.innerHTML = `
                <img src="${imageUrl}" alt="${product.name}">
                <div class="product-list-card-info view">
                    <h4>${product.name}</h4>
                    <p>R$ ${product.price.toFixed(2).replace('.', ',')}</p>
                </div>
                <div class="product-list-card-info edit-view">
                    <input type="text" class="edit-name" value="${product.name}">
                    <input type="number" class="edit-price" value="${product.price.toFixed(2)}" step="0.01">
                </div>
                <div class="product-list-card-actions">
                    <button class="edit view" data-id="${product.id}">Editar</button>
                    <button class="delete view" data-id="${product.id}">Excluir</button>
                    <button class="save edit-view" data-id="${product.id}">Salvar</button>
                    <button class="cancel edit-view" data-id="${product.id}">Cancelar</button>
                </div>
            `;
            productList.appendChild(listItem);
        });
    }

    function updatePaginationUI() {
        const totalPages = Math.ceil(allProducts.length / itemsPerPage);
        if (totalPages <= 1) {
            paginationControls.style.display = 'none';
            return;
        }
        
        paginationControls.style.display = 'flex';
        pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages;
    }

    // --- Carousel Logic ---
    function startCarousel() {
        stopCarousel();
        if (allProducts.length > 1) {
            const speed = (parseFloat(localStorage.getItem('carouselSpeed')) || 3) * 1000;
            carouselInterval = setInterval(() => {
                currentIndex = (currentIndex + 1) % allProducts.length;
                updateCarousel();
            }, speed);
        }
    }

    function stopCarousel() {
        clearInterval(carouselInterval);
    }

    function updateCarousel() {
        const offset = -currentIndex * 100;
        carousel.style.transform = `translateX(${offset}%)`;
    }

    // --- Event Handlers ---

    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = productIdInput.value ? Number(productIdInput.value) : null;
        const name = productNameInput.value;
        const price = parseFloat(productPriceInput.value);
        const imageFile = productImageInput.files[0];

        if (!name || isNaN(price)) {
            alert("Por favor, preencha o nome e o preço.");
            return;
        }

        try {
            if (id) {
                const existingProduct = await getProduct(id);
                const productToUpdate = { ...existingProduct, name, price, image: imageFile || existingProduct.image };
                await updateProduct(productToUpdate);
            } else {
                if (!imageFile) {
                    alert("Por favor, selecione uma imagem para o novo produto.");
                    return;
                }
                const newProduct = { name, price, image: imageFile };
                await addProduct(newProduct);
                // Go to the last page to see the new product
                currentPage = Math.ceil((allProducts.length + 1) / itemsPerPage);
            }

            productForm.reset();
            productIdInput.value = '';
            productImageInput.required = true;
            productForm.querySelector('button').textContent = 'Salvar Produto';
            await refreshProducts();
        } catch (error) {
            console.error("Failed to save product:", error);
        }
    });

    productList.addEventListener('click', async (e) => {
        const card = e.target.closest('.product-list-card');
        if (!card) return;

        const id = Number(card.dataset.id);
        const targetClass = e.target.classList;

        if (targetClass.contains('edit')) {
            document.querySelectorAll('.product-list-card.editing').forEach(c => c.classList.remove('editing'));
            card.classList.add('editing');
            productForm.style.opacity = '0.5';
            productForm.style.pointerEvents = 'none';
        }

        if (targetClass.contains('cancel')) {
            card.classList.remove('editing');
            productForm.style.opacity = '1';
            productForm.style.pointerEvents = 'auto';
        }

        if (targetClass.contains('save')) {
            const newName = card.querySelector('.edit-name').value;
            const newPrice = parseFloat(card.querySelector('.edit-price').value);

            if (!newName || isNaN(newPrice)) {
                alert('Por favor, preencha os campos corretamente.');
                return;
            }

            try {
                // 1. Update data in the database
                const product = await getProduct(id);
                product.name = newName;
                product.price = newPrice;
                await updateProduct(product);

                // 2. Update the global state array
                const productIndex = allProducts.findIndex(p => p.id === id);
                if (productIndex > -1) {
                    allProducts[productIndex] = product;
                }

                // 3. Perform targeted DOM update for the list item
                const priceString = `R$ ${newPrice.toFixed(2).replace('.', ',')}`;
                card.querySelector('.view h4').textContent = newName;
                card.querySelector('.view p').textContent = priceString;
                card.classList.remove('editing');

                // 4. Perform targeted DOM update for the carousel item
                if (productIndex > -1) {
                    const carouselCard = carousel.children[productIndex];
                    if (carouselCard) {
                        carouselCard.querySelector('.product-name').textContent = newName;
                        carouselCard.querySelector('.product-price').textContent = priceString;
                    }
                }
                
            } catch (error) {
                console.error("Failed to update product:", error);
            } finally {
                productForm.style.opacity = '1';
                productForm.style.pointerEvents = 'auto';
            }
        }

        if (targetClass.contains('delete')) {
            if (confirm('Tem certeza que deseja excluir este produto?')) {
                try {
                    await deleteProduct(id);
                    // Adjust current page if it becomes empty
                    const totalPages = Math.ceil((allProducts.length - 1) / itemsPerPage);
                    if (currentPage > totalPages && totalPages > 0) {
                        currentPage = totalPages;
                    }
                    await refreshProducts();
                } catch (error) {
                    console.error("Failed to delete product:", error);
                }
            }
        }
    });

    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            refreshProducts();
        }
    });

    nextPageBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(allProducts.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            refreshProducts();
        }
    });

    // --- Customization Logic (unchanged) ---
    function applyCustomization() {
        const carouselContainer = document.getElementById('carousel-container');
        const backgroundColor = localStorage.getItem('backgroundColor') || '#5C94FC';
        const backgroundImage = localStorage.getItem('backgroundImage') || '';
        const carouselSpeed = localStorage.getItem('carouselSpeed') || '3';
        const productNameColor = localStorage.getItem('productNameColor') || '#FFD700';
        const productPriceColor = localStorage.getItem('productPriceColor') || '#FFFFFF';
        const productPriceBgColor = localStorage.getItem('productPriceBgColor') || '#E52521';
        const productNameFontSize = localStorage.getItem('productNameFontSize') || '48';
        const productPriceFontSize = localStorage.getItem('productPriceFontSize') || '40';
        const productNameShadow = localStorage.getItem('productNameShadow') !== 'false';
        const productPriceBorder = localStorage.getItem('productPriceBorder') !== 'false';

        if (carouselContainer.classList.contains('fullscreen')) {
            carouselContainer.style.backgroundColor = backgroundColor;
            carouselContainer.style.backgroundImage = backgroundImage ? `url(${backgroundImage})` : 'none';
            document.querySelectorAll('.fullscreen .product-card').forEach(el => {
                el.style.backgroundColor = backgroundColor;
            });
            document.querySelectorAll('.fullscreen .product-name').forEach(el => {
                el.style.color = productNameColor;
                el.style.fontSize = `${productNameFontSize}px`;
                el.style.textShadow = productNameShadow ? '3px 3px var(--mario-black)' : 'none';
            });
            document.querySelectorAll('.fullscreen .product-price').forEach(el => {
                el.style.color = productPriceColor;
                el.style.backgroundColor = productPriceBgColor;
                el.style.fontSize = `${productPriceFontSize}px`;
                el.style.border = productPriceBorder ? '4px solid var(--mario-black)' : 'none';
            });
        }

        carouselSpeedInput.value = carouselSpeed;
        backgroundColorInput.value = backgroundColor;
        productNameColorInput.value = productNameColor;
        productPriceColorInput.value = productPriceColor;
        productPriceBgColorInput.value = productPriceBgColor;
        productNameFontSizeInput.value = productNameFontSize;
        productPriceFontSizeInput.value = productPriceFontSize;
        productNameShadowInput.checked = productNameShadow;
        productPriceBorderInput.checked = productPriceBorder;
    }

    function resetCustomization() {
        if (confirm('Tem certeza que deseja resetar todas as personalizações?')) {
            const keys = ['backgroundColor', 'backgroundImage', 'carouselSpeed', 'productNameColor', 'productPriceColor', 'productPriceBgColor', 'productNameFontSize', 'productPriceFontSize', 'productNameShadow', 'productPriceBorder'];
            keys.forEach(key => localStorage.removeItem(key));
            backgroundImageInput.value = '';
            applyCustomization();
            startCarousel();
        }
    }

    fullscreenBtn.addEventListener('click', () => {
        document.getElementById('carousel-container').requestFullscreen().catch(err => {
            alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
    });

    document.addEventListener('fullscreenchange', () => {
        const carouselContainer = document.getElementById('carousel-container');
        carouselContainer.classList.toggle('fullscreen', !!document.fullscreenElement);
        applyCustomization();
    });

    const customInputs = { 'product-name-color': 'productNameColor', 'product-price-color': 'productPriceColor', 'product-price-bg-color': 'productPriceBgColor', 'product-name-font-size': 'productNameFontSize', 'product-price-font-size': 'productPriceFontSize' };
    Object.entries(customInputs).forEach(([id, key]) => {
        document.getElementById(id).addEventListener('input', (e) => {
            localStorage.setItem(key, e.target.value);
            applyCustomization();
        });
    });
    const customCheckboxes = { 'product-name-shadow': 'productNameShadow', 'product-price-border': 'productPriceBorder' };
    Object.entries(customCheckboxes).forEach(([id, key]) => {
        document.getElementById(id).addEventListener('change', (e) => {
            localStorage.setItem(key, e.target.checked);
            applyCustomization();
        });
    });
    backgroundColorInput.addEventListener('input', (e) => {
        localStorage.setItem('backgroundColor', e.target.value);
        localStorage.removeItem('backgroundImage');
        backgroundImageInput.value = '';
        applyCustomization();
    });
    backgroundImageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            localStorage.setItem('backgroundImage', event.target.result);
            applyCustomization();
        };
        reader.readAsDataURL(file);
    });
    carouselSpeedInput.addEventListener('change', (e) => {
        localStorage.setItem('carouselSpeed', e.target.value);
        startCarousel();
    });
    resetCustomizationBtn.addEventListener('click', resetCustomization);

    // --- App Initialization ---
    try {
        await initDB();
        await refreshProducts();
    } catch (error) {
        console.error("Failed to initialize the application:", error);
    }
});