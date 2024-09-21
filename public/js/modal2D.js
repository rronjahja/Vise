export function showModal2D(userData) {
  const modal = document.getElementById('Modal2D');
  const view3DCheckbox = document.getElementById('view3DCheckbox');
  const container = document.getElementById('container');

  modal.style.display = 'block';

  const url = 'http://localhost:3000/fetch-url';
  const basicAuth = 'Basic ' + btoa('S4HC_USER2:c~cZQNMYBhegziFAmGRCKlbmZekr2GmuhokBnAHb'); // replace with actual credentials
  let data;  // Declare the variable at the top

  // Send a request to the backend
  fetch(url, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': basicAuth  // Ensure basicAuth is correctly defined
      },
      body: JSON.stringify({
          url: 'https://my403426-api.s4hana.cloud.sap/sap/opu/odata4/sap/api_whse_availablestock/srvd_a2x/sap/warehouseavailablestock/0001/WarehouseAvailableStock'
      }) // Replace with the actual URL you want to fetch
  })
  .then(response => response.json())
  .then(responseData => {
      // Store the response data in the 'data' variable
      data = responseData.value;

      // Example usage: add products to the container
      if (data.products) {
          data.products.forEach(product => {
              const { modelPath, position, scale, type } = product;
              loadProduct(modelPath, position, scale, type);  // Assuming loadProduct is a defined function
          });
      }

      // Now you can use 'data' for any further processing
      console.log('Data received and stored:', data);

      // Move all code that depends on 'data' here
      processFetchedData(data, container);
  })
  .catch(error => {
      console.error('Error fetching data:', error);
  });

  // Function to handle processing the fetched data
  function processFetchedData(data, container) {
      const createGridStyle = (count) => {
          if (count <= 3) return `repeat(${count}, 1fr)`;
          const gridSize = Math.ceil(Math.sqrt(count));
          return `repeat(${gridSize}, 1fr)`;
      };

      const addProductsToBin = (products, binElement) => {
          const productContainer = document.createElement('div');
          productContainer.classList.add('product-container');
          if (products.length > 3) {
              const gridStyle = createGridStyle(products.length);
              productContainer.style.display = 'grid';
              productContainer.style.gridTemplateColumns = gridStyle;
              productContainer.style.gap = '10px'; // Add some gap between products for better visibility
              productContainer.style.marginTop = '10px'; // Add margin to space out from the title
          } else {
              productContainer.style.display = 'block';
          }

          products.forEach(product => {
              const productDiv = document.createElement('div');
              productDiv.classList.add('product');
              productDiv.setAttribute('data-product', product.Product);
              // productDiv.innerHTML = `
              //     <p>Product: ${product.Product}</p>
              //     <p>Quantity: ${product.Quantity} ${product["AvailableEWMStockQty"]}</p>
              //     <p>Weight: ${product["Loading Weight"]} ${product["EWMStockQuantityBaseUnit"]}</p>
              // `;
              productDiv.innerHTML = `
                  <p>Product: ${product.Product}</p>
                  <p>Quantity:${product["AvailableEWMStockQty"]}</p>
                  <p>Unit:${product["EWMStockQuantityBaseUnit"]}</p>
              `;
              productContainer.appendChild(productDiv);
          });

          binElement.appendChild(productContainer);
      };

      const addBinsToStorageType = (bins, storageTypeElement) => {
          const binsContainer = document.createElement('div');
          const gridStyle = createGridStyle(bins.length);
          binsContainer.style.display = 'grid';
          binsContainer.style.gridTemplateColumns = gridStyle;
          binsContainer.style.gap = '5px';

          bins.forEach(bin => {
              const storageBinSection = document.createElement('div');
              storageBinSection.classList.add('storage-bin');
              storageBinSection.setAttribute('data-storage-bin', bin["EWMStorageBin"]);
              storageBinSection.innerHTML = `<h3>Storage Bin: ${bin["EWMStorageBin"]}</h3>`;
              addProductsToBin(bin.products, storageBinSection);
              binsContainer.appendChild(storageBinSection);
          });

          storageTypeElement.appendChild(binsContainer);
      };

      const groupedData = data.reduce((acc, item) => {
          const storageType = item["EWMStorageType"];
          const storageBin = item["EWMStorageBin"];
          if (!acc[storageType]) {
              acc[storageType] = {};
          }
          if (!acc[storageType][storageBin]) {
              acc[storageType][storageBin] = [];
          }
          acc[storageType][storageBin].push(item);
          return acc;
      }, {});

      const storageTypes = Object.keys(groupedData);

      storageTypes.forEach(storageType => {
          const storageTypeSection = document.createElement('div');
          storageTypeSection.classList.add('storage-type');
          storageTypeSection.setAttribute('data-storage-type', storageType);
          storageTypeSection.innerHTML = `<h2>Storage Type: ${storageType}</h2>`;

          const bins = Object.keys(groupedData[storageType]).map(bin => ({
              "EWMStorageBin": bin,
              products: groupedData[storageType][bin]
          }));

          addBinsToStorageType(bins, storageTypeSection);
          container.appendChild(storageTypeSection);
      });

      const scrollContainer = document.getElementById('scroll-container');
      let isDown = false;
      let startX, startY, scrollLeft, scrollTop;

      scrollContainer.addEventListener('mousedown', (e) => {
          isDown = true;
          scrollContainer.style.cursor = 'grabbing';
          startX = e.pageX - scrollContainer.offsetLeft;
          startY = e.pageY - scrollContainer.offsetTop;
          scrollLeft = scrollContainer.scrollLeft;
          scrollTop = scrollContainer.scrollTop;
      });

      scrollContainer.addEventListener('mouseleave', () => {
          isDown = false;
          scrollContainer.style.cursor = 'grab';
      });

      scrollContainer.addEventListener('mouseup', () => {
          isDown = false;
          scrollContainer.style.cursor = 'grab';
      });

      scrollContainer.addEventListener('mousemove', (e) => {
          if (!isDown) return;
          e.preventDefault();
          const x = e.pageX - scrollContainer.offsetLeft;
          const y = e.pageY - scrollContainer.offsetTop;
          const walkX = (x - startX) * 1; //scroll-fast
          const walkY = (y - startY) * 1; //scroll-fast
          scrollContainer.scrollLeft = scrollLeft - walkX;
          scrollContainer.scrollTop = scrollTop - walkY;
      });

      const highlightElements = (elements, className, searchTerm, exactMatch) => {
          let anyMatch = false;
          elements.forEach(element => {
              const content = element.getAttribute('data-storage-type') || element.getAttribute('data-storage-bin') || element.getAttribute('data-product');
              if (exactMatch ? content === searchTerm : content.includes(searchTerm)) {
                  element.classList.add(className);
                  element.style.display = 'block'; // Show the element
                  anyMatch = true;
              } else {
                  element.classList.remove(className);
                  element.style.display = 'none'; // Hide the element
              }
          });
          return anyMatch;
      };

      const resetElementVisibility = () => {
          document.querySelectorAll('.storage-type, .storage-bin, .product').forEach(element => {
              element.style.display = 'block';
          });
      };

      const hideEmptyStorageTypesAndBins = () => {
          const storageTypes = document.querySelectorAll('.storage-type');
          storageTypes.forEach(storageType => {
              const bins = storageType.querySelectorAll('.storage-bin');
              const anyBinVisible = Array.from(bins).some(bin => bin.style.display !== 'none');
              if (anyBinVisible) {
                  storageType.style.display = 'block'; // Show storage type if any bin is visible
              } else {
              
                  storageType.style.display = 'none'; // Hide storage type if no bins are visible
              }

              bins.forEach(bin => {
                  const products = bin.querySelectorAll('.product');
                  const anyProductVisible = Array.from(products).some(product => product.style.display !== 'none');
                  if (anyProductVisible) {
                      bin.style.display = 'block'; // Show bin if any product is visible
                      // Reapply grid layout to the bin element
                      const gridStyle = createGridStyle(products.length);
                      // bin.style.display = 'grid';
                      // bin.style.gridTemplateColumns = gridStyle;
                      // bin.style.gap = '10px';
                  } else {
                      bin.style.display = 'none'; // Hide bin if no products are visible

                      storageType.style.display = 'none';
                  }
              });
          });
      };

      const reapplyGridLayoutToProducts = () => {
          const bins = document.querySelectorAll('.storage-bin');
          bins.forEach(bin => {
              const products = bin.querySelectorAll('.product');
              const productContainer = bin.querySelector('.product-container');
              if (products.length > 3) {
                  const gridStyle = createGridStyle(products.length);
                  productContainer.style.display = 'grid';
                  productContainer.style.gridTemplateColumns = gridStyle;
                  productContainer.style.gap = '10px'; // Add some gap between products for better visibility
                  productContainer.style.marginTop = '10px'; // Add margin to space out from the title
              } else {
                  productContainer.style.display = 'block';
              }
          });
      };

  const searchAndHighlight = (inputId, className, selector, relatedSelectors = []) => {
    document.getElementById(inputId).addEventListener('input', function() {
        resetElementVisibility(); // Reset all elements to visible before applying the new search filter

        const searchValue = this.value.trim();
        const exactMatch = !searchValue.startsWith('*');
        const searchTerm = exactMatch ? searchValue : searchValue.slice(1).trim();

        const elements = document.querySelectorAll(selector);
        const anyMatch = highlightElements(elements, className, searchTerm, exactMatch);

        relatedSelectors.forEach(related => {
            const relatedElements = document.querySelectorAll(related.selector);
            relatedElements.forEach(element => {
                const matches = Array.from(element.querySelectorAll(related.childSelector)).some(child =>
                    exactMatch ? child.getAttribute(related.dataAttr) === searchTerm : child.getAttribute(related.dataAttr).includes(searchTerm)
                );
                if (matches || anyMatch) {
                    element.style.display = 'block'; // Show the related element
                } else {
                    element.style.display = 'none'; // Hide the related element
                }
            });
        });

        if (inputId === 'search-storage-bin' || inputId === 'search-product') {
            hideEmptyStorageTypesAndBins();
            reapplyGridLayoutToProducts(); // Ensure grid layout is reapplied to products
        }
    });
  };

  searchAndHighlight('search-storage-type', 'highlight', '.storage-type', []);
  searchAndHighlight('search-storage-bin', 'highlight-bin', '.storage-bin', [
      { selector: '.storage-type', childSelector: '.storage-bin', dataAttr: 'data-storage-bin' }
  ]);
  searchAndHighlight('search-product', 'highlight-product', '.product', [
      { selector: '.storage-bin', childSelector: '.product', dataAttr: 'data-product' },
      { selector: '.storage-type', childSelector: '.storage-bin', dataAttr: 'data-storage-bin' }
  ]);

  // Display the modal
  modal.style.display = 'block';

  // Close modal when clicking on the close button
  const closeButton = document.querySelector('.modal-close-2D');
  if (closeButton) {
      closeButton.onclick = () => {
          modal.style.display = 'none';
      };
  }

  // Close modal when clicking outside of the modal content
  window.onclick = function (event) {
      if (event.target === modal) {
          modal.style.display = 'none';
      }
  };
}
}
