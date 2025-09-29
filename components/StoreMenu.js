// Store Menu Component for DoGoods Stores
function StoreMenu({ storeId, onClose }) {
  const [menu, setMenu] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [store, setStore] = React.useState(null);

  React.useEffect(() => {
    loadStoreMenu();
  }, [storeId]);

  const loadStoreMenu = async () => {
    try {
      setLoading(true);
      
      // Load store information
      try {
        const storeData = await trickleGetObject('dogoods_store', storeId);
        setStore(storeData);
      } catch (error) {
        // Use default store info if not found
        setStore({
          objectData: {
            name: 'DoGoods Webster Street Hub',
            address: '1000 Webster St, Alameda, CA 94501'
          }
        });
      }

      // Load menu items
      const menuResponse = await trickleListObjects(`store_menu:${storeId}`, 50, true);
      let menuItems = menuResponse.items || [];
      
      // If no menu items in database, use sample data
      if (menuItems.length === 0 && window.getSampleStoreMenu) {
        const sampleItems = window.getSampleStoreMenu(storeId);
        menuItems = sampleItems.map(item => ({
          objectId: item.id,
          objectData: item
        }));
      }
      
      setMenu(menuItems);
    } catch (error) {
      console.error('Error loading store menu:', error);
      // Fallback to sample menu
      if (window.getSampleStoreMenu) {
        const sampleItems = window.getSampleStoreMenu(storeId);
        setMenu(sampleItems.map(item => ({
          objectId: item.id,
          objectData: item
        })));
      } else {
        setMenu([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const claimMenuItem = async (itemId) => {
    try {
      const item = menu.find(m => m.objectId === itemId);
      if (item && item.objectData.quantity > 0) {
        // Update quantity
        const newQuantity = item.objectData.quantity - 1;
        await trickleUpdateObject(`store_menu:${storeId}`, itemId, {
          ...item.objectData,
          quantity: newQuantity
        });
        
        // Refresh menu
        loadStoreMenu();
        
        alert('Item claimed successfully! Please visit the store to pick up your item.');
      }
    } catch (error) {
      console.error('Error claiming item:', error);
      alert('Error claiming item. Please try again.');
    }
  };

  if (!storeId) return null;

  return React.createElement('div', {
    className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4',
    onClick: onClose
  },
    React.createElement('div', {
      className: 'bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl',
      onClick: (e) => e.stopPropagation()
    },
      // Header
      React.createElement('div', {
        className: 'flex items-center justify-between p-6 border-b border-gray-200 bg-green-50'
      },
        React.createElement('div', { className: 'flex items-center' },
          React.createElement('div', { className: 'icon-store text-3xl text-green-600 mr-3' }),
          React.createElement('div', {},
            React.createElement('h2', { className: 'font-bold text-xl text-gray-900' }, 
              store ? store.objectData.name : 'Distribution Center'
            ),
            React.createElement('p', { className: 'text-green-600 font-medium' }, 'Food Inventory - Available Now')
          )
        ),
        React.createElement('button', {
          onClick: onClose,
          className: 'p-2 hover:bg-gray-100 rounded-full transition-colors'
        },
          React.createElement('div', { className: 'icon-x text-xl text-gray-500' })
        )
      ),

      // Menu Content
      React.createElement('div', { className: 'overflow-y-auto max-h-[calc(90vh-120px)]' },
        loading ? (
          React.createElement('div', { className: 'flex items-center justify-center py-12' },
            React.createElement('div', { className: 'text-gray-500' }, 'Loading menu...')
          )
        ) : menu.length === 0 ? (
          React.createElement('div', { className: 'p-6' },
            React.createElement('div', { className: 'text-center py-8' },
              React.createElement('div', { className: 'icon-package text-6xl text-gray-300 mb-4' }),
              React.createElement('p', { className: 'text-gray-500 text-lg mb-4' }, 'Loading menu from DoGoods API...'),
              React.createElement('div', { className: 'bg-gray-50 rounded-xl p-6' },
                React.createElement('p', { className: 'text-gray-600 text-sm mb-4' }, 'Sample Available Items:'),
                React.createElement('div', { className: 'space-y-3 text-left' },
                  React.createElement('div', { className: 'flex justify-between items-center p-3 bg-white rounded-lg border' },
                    React.createElement('div', {},
                      React.createElement('h4', { className: 'font-medium' }, 'Fresh Produce Box'),
                      React.createElement('p', { className: 'text-sm text-gray-500' }, 'Mixed vegetables and fruits')
                    ),
                    React.createElement('span', { className: 'bg-green-100 text-green-800 px-2 py-1 rounded text-xs' }, '15 available')
                  ),
                  React.createElement('div', { className: 'flex justify-between items-center p-3 bg-white rounded-lg border' },
                    React.createElement('div', {},
                      React.createElement('h4', { className: 'font-medium' }, 'Prepared Meals'),
                      React.createElement('p', { className: 'text-sm text-gray-500' }, 'Ready-to-eat hot meals')
                    ),
                    React.createElement('span', { className: 'bg-green-100 text-green-800 px-2 py-1 rounded text-xs' }, '8 available')
                  ),
                  React.createElement('div', { className: 'flex justify-between items-center p-3 bg-white rounded-lg border' },
                    React.createElement('div', {},
                      React.createElement('h4', { className: 'font-medium' }, 'Emergency Food Kit'),
                      React.createElement('p', { className: 'text-sm text-gray-500' }, 'Non-perishable essentials')
                    ),
                    React.createElement('span', { className: 'bg-green-100 text-green-800 px-2 py-1 rounded text-xs' }, '12 available')
                  )
                )
              )
            )
          )
        ) : (
          React.createElement('div', { className: 'p-6' },
            React.createElement('div', { className: 'grid gap-4' },
              menu.map(item => {
                const itemData = item.objectData;
                const isAvailable = itemData.quantity > 0;
                
                return React.createElement('div', {
                  key: item.objectId,
                  className: `border border-gray-200 rounded-xl p-5 ${isAvailable ? 'bg-white hover:shadow-md' : 'bg-gray-50'} transition-shadow`
                },
                  React.createElement('div', { className: 'flex justify-between items-start mb-3' },
                    React.createElement('div', { className: 'flex-1' },
                      React.createElement('h3', { 
                        className: `font-bold text-lg mb-1 ${isAvailable ? 'text-gray-900' : 'text-gray-500'}` 
                      }, itemData.name),
                      React.createElement('div', { className: 'flex items-center gap-2 mb-1' },
                        React.createElement('span', { className: 'text-sm text-gray-500 capitalize' }, itemData.category),
                        React.createElement('span', {
                          className: `px-2 py-1 rounded-full text-xs font-medium ${
                            isAvailable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                          }`
                        }, isAvailable ? 'Available Now' : 'Out of Stock')
                      ),
                      itemData.donated_by && React.createElement('div', { className: 'text-xs text-blue-600' },
                        `Donated by: ${itemData.donated_by}`
                      )
                    ),
                    React.createElement('div', { className: 'text-right' },
                      React.createElement('div', { className: 'text-lg font-bold text-green-600' }, itemData.quantity),
                      React.createElement('div', { className: 'text-xs text-gray-500' }, 'available')
                    )
                  ),
                  
                  itemData.description && React.createElement('p', { 
                    className: `text-gray-600 mb-4 text-sm leading-relaxed ${!isAvailable ? 'text-gray-400' : ''}` 
                  }, itemData.description),
                  
                  React.createElement('div', { className: 'flex justify-between items-center' },
                    React.createElement('div', { className: 'text-sm text-gray-500' },
                      'Ready for immediate pickup'
                    ),
                    isAvailable && React.createElement('button', {
                      onClick: () => claimMenuItem(item.objectId),
                      className: 'bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm'
                    }, 'Reserve Item')
                  )
                );
              })
            )
          )
        )
      )
    )
  );
}

window.StoreMenu = StoreMenu;