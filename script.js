document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.getElementById('carousel');
    const productForm = document.getElementById('product-form');
    const productIdInput = document.getElementById('product-id');
    const productNameInput = document.getElementById('product-name');
    const productPriceInput = document.getElementById('product-price');
    const productImageInput = document.getElementById('product-image');
    const productList = document.getElementById('product-list');
    const backgroundColorInput = document.getElementById('background-color');
    const backgroundImageInput = document.getElementById('background-image');
    const carouselSpeedInput = document.getElementById('carousel-speed');
    const productNameColorInput = document.getElementById('product-name-color');
    const productPriceColorInput = document.getElementById('product-price-color');
    const productPriceBgColorInput = document.getElementById('product-price-bg-color');
    const productNameFontSizeInput = document.getElementById('product-name-font-size');
    const productPriceFontSizeInput = document.getElementById('product-price-font-size');
    const fullscreenBtn = document.getElementById('fullscreen-btn');

    let products = JSON.parse(localStorage.getItem('products')) || [];
    let currentIndex = 0;
    let carouselInterval;

    const saveProducts = () => {
        localStorage.setItem('products', JSON.stringify(products));
    };

    const renderProducts = () => {
        carousel.innerHTML = '';
        productList.innerHTML = '';

        if (products.length === 0) {
            carousel.innerHTML = '<div class="product-card"><p>Nenhum produto cadastrado.</p></div>';
            stopCarousel();
            return;
        }

        products.forEach((product) => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');
            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <div class="product-card-text">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-price">R$ ${product.price.toFixed(2).replace('.', ',')}</p>
                </div>
            `;
            carousel.appendChild(productCard);

            const listItem = document.createElement('div');
            listItem.classList.add('product-list-card');
            listItem.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <div class="product-list-card-info">
                    <h4>${product.name}</h4>
                    <p>R$ ${product.price.toFixed(2).replace('.', ',')}</p>
                </div>
                <div class="product-list-card-actions">
                    <button class="edit" data-id="${product.id}">Editar</button>
                    <button class="delete" data-id="${product.id}">Excluir</button>
                </div>
            `;
            productList.appendChild(listItem);
        });

        applyCustomization();
        startCarousel();
    };

    const startCarousel = () => {
        stopCarousel();
        if (products.length > 1) {
            const speed = (parseFloat(localStorage.getItem('carouselSpeed')) || 3) * 1000;
            carouselInterval = setInterval(() => {
                currentIndex = (currentIndex + 1) % products.length;
                updateCarousel();
            }, speed);
        }
    };

    const stopCarousel = () => {
        clearInterval(carouselInterval);
    };

    const updateCarousel = () => {
        const offset = -currentIndex * 100;
        carousel.style.transform = `translateX(${offset}%)`;
    };

    const applyCustomization = () => {
        const carouselContainer = document.getElementById('carousel-container');
        const backgroundColor = localStorage.getItem('backgroundColor') || '#ffffff';
        const backgroundImage = localStorage.getItem('backgroundImage') || '';
        const carouselSpeed = localStorage.getItem('carouselSpeed') || '3';
        const productNameColor = localStorage.getItem('productNameColor') || '#ffffff';
        const productPriceColor = localStorage.getItem('productPriceColor') || '#ffffff';
        const productPriceBgColor = localStorage.getItem('productPriceBgColor') || '#1a73e8';
        const productNameFontSize = localStorage.getItem('productNameFontSize') || '28';
        const productPriceFontSize = localStorage.getItem('productPriceFontSize') || '24';

        document.querySelectorAll('.product-name').forEach(el => el.style.fontSize = `${productNameFontSize}px`);
        document.querySelectorAll('.product-price').forEach(el => el.style.fontSize = `${productPriceFontSize}px`);

        if (carouselContainer.classList.contains('fullscreen')) {
            carouselContainer.style.backgroundColor = backgroundColor;
            carouselContainer.style.backgroundImage = backgroundImage ? `url(${backgroundImage})` : 'none';
            
            document.querySelectorAll('.fullscreen .product-name').forEach(el => el.style.color = productNameColor);
            document.querySelectorAll('.fullscreen .product-price').forEach(el => {
                el.style.color = productPriceColor;
                el.style.backgroundColor = productPriceBgColor;
            });

        } else {
            carouselContainer.style.backgroundColor = '#fff';
            carouselContainer.style.backgroundImage = 'none';
            document.querySelectorAll('.product-name').forEach(el => el.style.color = '#333');
            document.querySelectorAll('.product-price').forEach(el => {
                el.style.color = '#fff';
                el.style.backgroundColor = '#1a73e8';
            });
        }

        carouselSpeedInput.value = carouselSpeed;
        backgroundColorInput.value = backgroundColor;
        backgroundImageInput.value = ''; // Clear the file input
        productNameColorInput.value = productNameColor;
        productPriceColorInput.value = productPriceColor;
        productPriceBgColorInput.value = productPriceBgColor;
        productNameFontSizeInput.value = productNameFontSize;
        productPriceFontSizeInput.value = productPriceFontSize;
    };

    fullscreenBtn.addEventListener('click', () => {
        const carouselContainer = document.getElementById('carousel-container');
        if (!document.fullscreenElement) {
            carouselContainer.requestFullscreen().catch(err => {
                alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
            carouselContainer.classList.add('fullscreen');
            applyCustomization();
        } else {
            document.exitFullscreen();
        }
    });

    document.addEventListener('fullscreenchange', () => {
        const carouselContainer = document.getElementById('carousel-container');
        if (!document.fullscreenElement) {
            carouselContainer.classList.remove('fullscreen');
            applyCustomization();
        }
    });

    productForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = productIdInput.value;
        const name = productNameInput.value;
        const price = parseFloat(productPriceInput.value);
        const imageFile = productImageInput.files[0];

        const handleImage = (imageData) => {
            if (id) {
                const product = products.find(p => p.id == id);
                product.name = name;
                product.price = price;
                if (imageData) {
                    product.image = imageData;
                }
            } else {
                const newProduct = {
                    id: Date.now(),
                    name,
                    price,
                    image: imageData
                };
                products.push(newProduct);
            }

            saveProducts();
            renderProducts();
            productForm.reset();
            productIdInput.value = '';
            productImageInput.required = true;
        };

        if (imageFile) {
            const reader = new FileReader();
            reader.onload = (event) => {
                handleImage(event.target.result);
            };
            reader.readAsDataURL(imageFile);
        } else if (id) {
            const product = products.find(p => p.id == id);
            handleImage(product.image); // Keep existing image
        } else {
            alert("Por favor, selecione uma imagem.");
        }
    });

    productList.addEventListener('click', (e) => {
        const card = e.target.closest('.product-list-card');
        if (!card) return;

        const id = card.querySelector('.edit, .delete, .save, .cancel').dataset.id;
        const product = products.find(p => p.id == id);

        if (e.target.classList.contains('edit')) {
            const nameEl = card.querySelector('h4');
            const priceEl = card.querySelector('p');

            nameEl.innerHTML = `<input type="text" class="edit-name" value="${product.name}">`;
            priceEl.innerHTML = `<input type="number" class="edit-price" value="${product.price.toFixed(2)}" step="0.01">`;

            const actions = card.querySelector('.product-list-card-actions');
            actions.innerHTML = `
                <button class="save" data-id="${product.id}">Salvar</button>
                <button class="cancel" data-id="${product.id}">Cancelar</button>
            `;
            
            const imageInstruction = document.createElement('small');
            imageInstruction.textContent = 'Para alterar a imagem, use o formulário principal.';
            card.appendChild(imageInstruction);

        } else if (e.target.classList.contains('delete')) {
            products = products.filter(p => p.id != id);
            saveProducts();
            renderProducts();

        } else if (e.target.classList.contains('save')) {
            const newName = card.querySelector('.edit-name').value;
            const newPrice = parseFloat(card.querySelector('.edit-price').value);

            product.name = newName;
            product.price = newPrice;

            saveProducts();
            renderProducts();

        } else if (e.target.classList.contains('cancel')) {
            renderProducts();
        }
    });

    backgroundColorInput.addEventListener('input', (e) => {
        localStorage.setItem('backgroundColor', e.target.value);
        localStorage.removeItem('backgroundImage');
        applyCustomization();
    });

    backgroundImageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                localStorage.setItem('backgroundImage', event.target.result);
                applyCustomization();
            };
            reader.readAsDataURL(file);
        }
    });

    carouselSpeedInput.addEventListener('change', (e) => {
        localStorage.setItem('carouselSpeed', e.target.value);
        startCarousel();
    });

    productNameColorInput.addEventListener('input', (e) => {
        localStorage.setItem('productNameColor', e.target.value);
        applyCustomization();
    });

    productPriceColorInput.addEventListener('input', (e) => {
        localStorage.setItem('productPriceColor', e.target.value);
        applyCustomization();
    });

    productPriceBgColorInput.addEventListener('input', (e) => {
        localStorage.setItem('productPriceBgColor', e.target.value);
        applyCustomization();
    });

    productNameFontSizeInput.addEventListener('input', (e) => {
        localStorage.setItem('productNameFontSize', e.target.value);
        applyCustomization();
    });

    productPriceFontSizeInput.addEventListener('input', (e) => {
        localStorage.setItem('productPriceFontSize', e.target.value);
        applyCustomization();
    });

    renderProducts();
});