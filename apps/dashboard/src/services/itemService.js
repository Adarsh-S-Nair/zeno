import { supabase } from '../supabaseClient'

class ItemService {
  /**
   * Fetches all items for a business
   * @param {string} businessId - The ID of the business
   * @returns {Promise<Array>} Array of items
   */
  async fetchItems(businessId) {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching items:', error)
      throw error
    }

    return data
  }

  /**
   * Adds a single item to the database
   * @param {Object} itemData - The item data to add
   * @param {string} businessId - The ID of the business
   * @returns {Promise<Object>} The created item
   */
  async addItem(itemData, businessId) {
    const { data, error } = await supabase
      .from('items')
      .insert([{
        name: itemData.name,
        category: itemData.category,
        quantity: parseInt(itemData.quantity) || 0,
        purchase_price: parseFloat(itemData.purchase_price) || 0,
        sell_price: parseFloat(itemData.sell_price) || 0,
        low_stock_threshold: parseInt(itemData.low_stock_threshold) || 0,
        business_id: businessId,
      }])
      .select()
      .single()

    if (error) {
      console.error('Failed to insert item:', error)
      throw error
    }

    return data
  }

  /**
   * Updates an existing item
   * @param {string} itemId - The ID of the item to update
   * @param {Object} itemData - The updated item data
   * @returns {Promise<Object>} The updated item
   */
  async updateItem(itemId, itemData) {
    const { data, error } = await supabase
      .from('items')
      .update({
        name: itemData.name,
        category: itemData.category,
        quantity: parseInt(itemData.quantity) || 0,
        purchase_price: parseFloat(itemData.purchase_price) || 0,
        sell_price: parseFloat(itemData.sell_price) || 0,
        low_stock_threshold: parseInt(itemData.low_stock_threshold) || 0,
      })
      .eq('id', itemId)
      .select()
      .single()

    if (error) {
      console.error('Error updating item:', error)
      throw error
    }

    return data
  }

  /**
   * Deletes an item
   * @param {string} itemId - The ID of the item to delete
   * @returns {Promise<void>}
   */
  async deleteItem(itemId) {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', itemId)

    if (error) {
      console.error('Failed to delete item:', error)
      throw error
    }
  }

  /**
   * Adds multiple items in bulk
   * @param {Array} items - Array of items to add
   * @param {string} businessId - The ID of the business
   * @returns {Promise<Array>} Array of created items
   */
  async addItemsBulk(items, businessId) {
    const itemsWithBusinessId = items.map(item => ({
      ...item,
      business_id: businessId
    }))

    const { data, error } = await supabase
      .from('items')
      .insert(itemsWithBusinessId)
      .select()

    if (error) {
      console.error('Failed to insert items:', error)
      throw error
    }

    return data
  }
}

export default new ItemService() 