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
    const productNameShadowInput = document.getElementById('product-name-shadow');
    const resetCustomizationBtn = document.getElementById('reset-customization');
    const productPriceBorderInput = document.getElementById('product-price-border');

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
            listItem.dataset.id = product.id; // Adiciona o ID ao card
            listItem.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                
                <!-- Display View -->
                <div class="product-list-card-info view">
                    <h4>${product.name}</h4>
                    <p>R$ ${product.price.toFixed(2).replace('.', ',')}</p>
                </div>

                <!-- Edit View -->
                <div class="product-list-card-info edit-view">
                    <input type="text" class="edit-name" value="${product.name}">
                    <input type="number" class="edit-price" value="${product.price.toFixed(2)}" step="0.01">
                </div>

                <!-- Action Buttons -->
                <div class="product-list-card-actions">
                    <button class="edit view" data-id="${product.id}">Editar</button>
                    <button class="delete view" data-id="${product.id}">Excluir</button>
                    <button class="save edit-view" data-id="${product.id}">Salvar</button>
                    <button class="cancel edit-view" data-id="${product.id}">Cancelar</button>
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
        
        // Carrega os valores do localStorage ou usa os padrões
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

        // Atualiza os inputs com os valores carregados
        carouselSpeedInput.value = carouselSpeed;
        backgroundColorInput.value = backgroundColor;
        productNameColorInput.value = productNameColor;
        productPriceColorInput.value = productPriceColor;
        productPriceBgColorInput.value = productPriceBgColor;
        productNameFontSizeInput.value = productNameFontSize;
        productPriceFontSizeInput.value = productPriceFontSize;
        productNameShadowInput.checked = productNameShadow;
        productPriceBorderInput.checked = productPriceBorder;
    };

    const resetCustomization = () => {
        if (confirm('Tem certeza que deseja resetar todas as personalizações?')) {
            localStorage.removeItem('backgroundColor');
            localStorage.removeItem('backgroundImage');
            localStorage.removeItem('carouselSpeed');
            localStorage.removeItem('productNameColor');
            localStorage.removeItem('productPriceColor');
            localStorage.removeItem('productPriceBgColor');
            localStorage.removeItem('productNameFontSize');
            localStorage.removeItem('productPriceFontSize');
            localStorage.removeItem('productNameShadow');
            localStorage.removeItem('productPriceBorder');
            
            // Limpa o input de arquivo de imagem de fundo
            backgroundImageInput.value = '';

            applyCustomization();
            startCarousel(); // Reinicia o carrossel com a velocidade padrão
        }
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
            // Não é necessário chamar applyCustomization aqui, pois o estilo é condicional
        } else {
            applyCustomization(); // Garante que a customização seja aplicada ao entrar em tela cheia
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
            productImageInput.required = true; // Re-enable requirement for new products
            productForm.querySelector('button').textContent = 'Salvar Produto';
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
            alert("Por favor, selecione uma imagem para o novo produto.");
        }
    });

    productList.addEventListener('click', (e) => {
        const card = e.target.closest('.product-list-card');
        if (!card) return;

        const id = card.dataset.id;

        // Botão EDITAR
        if (e.target.classList.contains('edit')) {
            // Desativa a edição em outros cards
            document.querySelectorAll('.product-list-card.editing').forEach(c => {
                c.classList.remove('editing');
            });
            // Ativa a edição neste card
            card.classList.add('editing');
            
            // Desabilita o formulário principal para evitar confusão
            productForm.style.opacity = '0.5';
            productForm.style.pointerEvents = 'none';
        }

        // Botão CANCELAR
        if (e.target.classList.contains('cancel')) {
            card.classList.remove('editing');
            // Reabilita o formulário principal
            productForm.style.opacity = '1';
            productForm.style.pointerEvents = 'auto';
        }

        // Botão SALVAR
        if (e.target.classList.contains('save')) {
            const product = products.find(p => p.id == id);
            const newName = card.querySelector('.edit-name').value;
            const newPrice = parseFloat(card.querySelector('.edit-price').value);

            if (product && newName && !isNaN(newPrice)) {
                product.name = newName;
                product.price = newPrice;
                saveProducts();
                renderProducts(); // Re-renderiza para sair do modo de edição e atualizar
            } else {
                alert('Por favor, preencha os campos corretamente.');
            }
            // Reabilita o formulário principal
            productForm.style.opacity = '1';
            productForm.style.pointerEvents = 'auto';
        }

        // Botão EXCLUIR
        if (e.target.classList.contains('delete')) {
            if (confirm('Tem certeza que deseja excluir este produto?')) {
                products = products.filter(p => p.id != id);
                saveProducts();
                renderProducts();
            }
        }
    });

    backgroundColorInput.addEventListener('input', (e) => {
        localStorage.setItem('backgroundColor', e.target.value);
        localStorage.removeItem('backgroundImage');
        backgroundImageInput.value = ''; // Limpa o campo de arquivo
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

    productNameShadowInput.addEventListener('change', (e) => {
        localStorage.setItem('productNameShadow', e.target.checked);
        applyCustomization();
    });

    productPriceBorderInput.addEventListener('change', (e) => {
        localStorage.setItem('productPriceBorder', e.target.checked);
        applyCustomization();
    });

    resetCustomizationBtn.addEventListener('click', resetCustomization);

    renderProducts();
});