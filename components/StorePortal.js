// Store Portal Component for DoGoods Store Management
function StorePortal({ user, onClose }) {
  const [activeTab, setActiveTab] = React.useState('menu');
  const [menuItems, setMenuItems] = React.useState([]);
  const [storeInfo, setStoreInfo] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadStoreData();
  }, []);

  const loadStoreData = async () => {
    try {
      setLoading(true);
      
      // Load store information
      const storeData = await trickleGetObject('dogoods_store', user.storeId);
      setStoreInfo(storeData);

      // Load menu items
      const menuResponse = await trickleListObjects(`store_menu:${user.storeId}`, 50, true);
      setMenuItems(menuResponse.items || []);
    } catch (error) {
      console.error('Error loading store data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addMenuItem = async (itemData) => {
    try {
      await trickleCreateObject(`store_menu:${user.storeId}`, {
        name: itemData.name,
        description: itemData.description,
        quantity: parseInt(itemData.quantity),
        category: itemData.category,
        created_at: new Date().toISOString()
      });
      
      loadStoreData();
      alert('Menu item added successfully!');
    } catch (error) {
      console.error('Error adding menu item:', error);
      alert('Error adding menu item. Please try again.');
    }
  };

  const updateMenuItem = async (itemId, updates) => {
    try {
      const item = menuItems.find(m => m.objectId === itemId);
      await trickleUpdateObject(`store_menu:${user.storeId}`, itemId, {
        ...item.objectData,
        ...updates
      });
      
      loadStoreData();
    } catch (error) {
      console.error('Error updating menu item:', error);
    }
  };

  if (!user || user.role !== 'store_owner') {
    return React.createElement('div', { className: 'text-center py-8' },
      React.createElement('p', { className: 'text-red-600' }, 'Access denied. Store owner privileges required.')
    );
  }

  return React.createElement('div', {
    className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4',
    onClick: onClose
  },
    React.createElement('div', {
      className: 'bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl',
      onClick: (e) => e.stopPropagation()
    },
      // Header
      React.createElement('div', {
        className: 'flex items-center justify-between p-6 border-b border-gray-200 bg-green-50'
      },
        React.createElement('div', {},
          React.createElement('h2', { className: 'font-bold text-xl text-gray-900' }, 'Store Management Portal'),
          React.createElement('p', { className: 'text-green-600' }, 
            storeInfo ? storeInfo.objectData.name : 'Loading store...'
          )
        ),
        React.createElement('button', {
          onClick: onClose,
          className: 'p-2 hover:bg-gray-100 rounded-full transition-colors'
        },
          React.createElement('div', { className: 'icon-x text-xl text-gray-500' })
        )
      ),

      // Tabs
      React.createElement('div', { className: 'border-b border-gray-200' },
        React.createElement('div', { className: 'flex' },
          React.createElement('button', {
            onClick: () => setActiveTab('menu'),
            className: `px-6 py-3 font-medium ${activeTab === 'menu' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-600 hover:text-gray-900'}`
          }, 'Menu Management'),
          React.createElement('button', {
            onClick: () => setActiveTab('analytics'),
            className: `px-6 py-3 font-medium ${activeTab === 'analytics' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-600 hover:text-gray-900'}`
          }, 'Analytics')
        )
      ),

      // Content
      React.createElement('div', { className: 'overflow-y-auto max-h-[calc(90vh-200px)] p-6' },
        activeTab === 'menu' ? (
          React.createElement(MenuManagement, { 
            menuItems, 
            onAddItem: addMenuItem, 
            onUpdateItem: updateMenuItem 
          })
        ) : (
          React.createElement('div', { className: 'text-center py-12' },
            React.createElement('p', { className: 'text-gray-500' }, 'Analytics coming soon!')
          )
        )
      )
    )
  );
}

// Menu Management Sub-component
function MenuManagement({ menuItems, onAddItem, onUpdateItem }) {
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [newItem, setNewItem] = React.useState({
    name: '',
    description: '',
    quantity: '',
    category: 'produce'
  });

  const handleAddItem = (e) => {
    e.preventDefault();
    if (newItem.name && newItem.quantity) {
      onAddItem(newItem);
      setNewItem({ name: '', description: '', quantity: '', category: 'produce' });
      setShowAddForm(false);
    }
  };

  return React.createElement('div', {},
    // Add Item Button
    React.createElement('div', { className: 'flex justify-between items-center mb-6' },
      React.createElement('h3', { className: 'font-bold text-lg' }, 'Menu Items'),
      React.createElement('button', {
        onClick: () => setShowAddForm(true),
        className: 'bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors'
      }, 'Add New Item')
    ),

    // Add Item Form
    showAddForm && React.createElement('div', { className: 'bg-gray-50 rounded-xl p-6 mb-6' },
      React.createElement('form', { onSubmit: handleAddItem },
        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4 mb-4' },
          React.createElement('input', {
            type: 'text',
            placeholder: 'Item Name',
            value: newItem.name,
            onChange: (e) => setNewItem({ ...newItem, name: e.target.value }),
            className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500',
            required: true
          }),
          React.createElement('input', {
            type: 'number',
            placeholder: 'Quantity',
            value: newItem.quantity,
            onChange: (e) => setNewItem({ ...newItem, quantity: e.target.value }),
            className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500',
            required: true
          })
        ),
        React.createElement('textarea', {
          placeholder: 'Description (optional)',
          value: newItem.description,
          onChange: (e) => setNewItem({ ...newItem, description: e.target.value }),
          className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 mb-4',
          rows: 3
        }),
        React.createElement('div', { className: 'flex gap-3' },
          React.createElement('button', {
            type: 'submit',
            className: 'bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors'
          }, 'Add Item'),
          React.createElement('button', {
            type: 'button',
            onClick: () => setShowAddForm(false),
            className: 'bg-gray-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors'
          }, 'Cancel')
        )
      )
    ),

    // Menu Items List
    React.createElement('div', { className: 'space-y-4' },
      menuItems.length === 0 ? (
        React.createElement('div', { className: 'text-center py-8 text-gray-500' },
          React.createElement('p', {}, 'No menu items yet. Add your first item to get started!')
        )
      ) : (
        menuItems.map(item => {
          const itemData = item.objectData;
          return React.createElement('div', {
            key: item.objectId,
            className: 'border border-gray-200 rounded-lg p-4 flex justify-between items-center'
          },
            React.createElement('div', {},
              React.createElement('h4', { className: 'font-medium text-lg' }, itemData.name),
              itemData.description && React.createElement('p', { className: 'text-gray-600 text-sm' }, itemData.description),
              React.createElement('p', { className: 'text-sm text-gray-500 mt-1' }, 
                `Quantity: ${itemData.quantity} | Category: ${itemData.category}`
              )
            ),
            React.createElement('div', { className: 'flex gap-2' },
              React.createElement('button', {
                onClick: () => {
                  const newQuantity = prompt('Enter new quantity:', itemData.quantity);
                  if (newQuantity !== null && !isNaN(newQuantity)) {
                    onUpdateItem(item.objectId, { quantity: parseInt(newQuantity) });
                  }
                },
                className: 'bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors'
              }, 'Update Qty')
            )
          );
        })
      )
    )
  );
}

window.StorePortal = StorePortal;