import { db } from '../data/db.js';

/**
 * @desc    Get categories hierarchical tree
 * @route   GET /api/categories
 * @access  Public
 */
export const getCategories = async (req, res, next) => {
  try {
    // 1. Fetch categories, subcategories, and relationships
    const categoriesResult = await db.execute("SELECT * FROM categories ORDER BY name ASC");
    const subcategoriesResult = await db.execute("SELECT * FROM subcategories ORDER BY name ASC");
    const relationshipsResult = await db.execute("SELECT * FROM category_relationships");

    const categories = categoriesResult.rows;
    const subcategories = subcategoriesResult.rows;
    const relationships = relationshipsResult.rows;

    // 2. Build map of all nodes
    const nodes = {};
    
    categories.forEach(cat => {
      nodes[`category_${cat.id}`] = {
        id: cat.id,
        name: cat.name,
        description: cat.description,
        type: 'category',
        children: []
      };
    });

    subcategories.forEach(sub => {
      nodes[`subcategory_${sub.id}`] = {
        id: sub.id,
        name: sub.name,
        description: sub.description,
        type: 'subcategory',
        category_id: sub.category_id,
        children: []
      };
    });

    // 3. Connect nodes using relationships
    const childKeys = new Set();

    relationships.forEach(rel => {
      const parentKey = `${rel.parent_type}_${rel.parent_id}`;
      const childKey = `${rel.child_type}_${rel.child_id}`;

      if (nodes[parentKey] && nodes[childKey]) {
        nodes[parentKey].children.push(nodes[childKey]);
        childKeys.add(childKey);
      }
    });

    // 4. Extract roots (nodes that are never children)
    const tree = Object.keys(nodes)
      .filter(key => !childKeys.has(key))
      .map(key => nodes[key]);

    // 5. Add path property recursively
    const addPaths = (node, parentPath = '') => {
      const currentPath = parentPath ? `${parentPath} > ${node.name}` : node.name;
      node.path = currentPath;
      if (node.children && node.children.length > 0) {
        node.children.forEach(child => addPaths(child, currentPath));
      }
    };

    tree.forEach(root => addPaths(root, ''));

    res.json({
      success: true,
      count: tree.length,
      categories: tree
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get direct subcategories of a category
 * @route   GET /api/categories/:id/subcategories
 * @access  Public
 */
export const getCategorySubcategories = async (req, res, next) => {
  try {
    const categoryId = parseInt(req.params.id);

    // Fetch direct subcategories mapped via category_relationships or category_id
    const result = await db.execute({
      sql: `
        SELECT s.* 
        FROM subcategories s
        JOIN category_relationships r ON s.id = r.child_id
        WHERE r.parent_id = ? AND r.parent_type = 'category' AND r.child_type = 'subcategory'
        ORDER BY s.name ASC
      `,
      args: [categoryId]
    });

    res.json({
      success: true,
      count: result.rows.length,
      subcategories: result.rows
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a category
 * @route   POST /api/categories
 * @access  Private/Admin
 */
export const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      res.status(400);
      throw new Error('Please provide category name');
    }

    const checkResult = await db.execute({
      sql: "SELECT id FROM categories WHERE LOWER(name) = ?",
      args: [name.toLowerCase()]
    });

    if (checkResult.rows.length > 0) {
      res.status(400);
      throw new Error(`Category "${name}" already exists`);
    }

    const result = await db.execute({
      sql: "INSERT INTO categories (name, description) VALUES (?, ?) RETURNING *",
      args: [name, description || '']
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a category
 * @route   PUT /api/categories/:id
 * @access  Private/Admin
 */
export const updateCategory = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { name, description } = req.body;

    const checkResult = await db.execute({
      sql: "SELECT * FROM categories WHERE id = ?",
      args: [id]
    });

    if (checkResult.rows.length === 0) {
      res.status(404);
      throw new Error(`Category with ID ${id} not found`);
    }

    const currentCat = checkResult.rows[0];
    const updatedName = name !== undefined ? name : currentCat.name;
    const updatedDesc = description !== undefined ? description : currentCat.description;

    const result = await db.execute({
      sql: "UPDATE categories SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *",
      args: [updatedName, updatedDesc, id]
    });

    res.json({
      success: true,
      message: 'Category updated successfully',
      category: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a category
 * @route   DELETE /api/categories/:id
 * @access  Private/Admin
 */
export const deleteCategory = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    const checkResult = await db.execute({
      sql: "SELECT id FROM categories WHERE id = ?",
      args: [id]
    });

    if (checkResult.rows.length === 0) {
      res.status(404);
      throw new Error(`Category with ID ${id} not found`);
    }

    // SQLite Cascade/Manual deletes
    await db.execute({
      sql: "DELETE FROM category_relationships WHERE (parent_id = ? AND parent_type = 'category') OR (child_id = ? AND child_type = 'category')",
      args: [id, id]
    });

    await db.execute({
      sql: "DELETE FROM subcategories WHERE category_id = ?",
      args: [id]
    });

    await db.execute({
      sql: "DELETE FROM categories WHERE id = ?",
      args: [id]
    });

    res.json({
      success: true,
      message: `Category with ID ${id} deleted successfully`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a subcategory
 * @route   POST /api/subcategories
 * @access  Private/Admin
 */
export const createSubcategory = async (req, res, next) => {
  try {
    const { category_id, name, description, parent_id, parent_type } = req.body;

    if (!category_id || !name) {
      res.status(400);
      throw new Error('Please provide category_id and subcategory name');
    }

    // Insert subcategory row
    const result = await db.execute({
      sql: "INSERT INTO subcategories (category_id, name, description) VALUES (?, ?, ?) RETURNING *",
      args: [category_id, name, description || '']
    });

    const subId = result.rows[0].id;

    // Create the relationship entry
    let pId = parent_id !== undefined ? parseInt(parent_id) : category_id;
    let pType = parent_type || 'category';

    await db.execute({
      sql: "INSERT INTO category_relationships (parent_id, child_id, parent_type, child_type) VALUES (?, ?, ?, 'subcategory')",
      args: [pId, subId, pType]
    });

    res.status(201).json({
      success: true,
      message: 'Subcategory created successfully',
      subcategory: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a subcategory
 * @route   PUT /api/subcategories/:id
 * @access  Private/Admin
 */
export const updateSubcategory = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { name, description } = req.body;

    const checkResult = await db.execute({
      sql: "SELECT * FROM subcategories WHERE id = ?",
      args: [id]
    });

    if (checkResult.rows.length === 0) {
      res.status(404);
      throw new Error(`Subcategory with ID ${id} not found`);
    }

    const currentSub = checkResult.rows[0];
    const updatedName = name !== undefined ? name : currentSub.name;
    const updatedDesc = description !== undefined ? description : currentSub.description;

    const result = await db.execute({
      sql: "UPDATE subcategories SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *",
      args: [updatedName, updatedDesc, id]
    });

    res.json({
      success: true,
      message: 'Subcategory updated successfully',
      subcategory: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a subcategory
 * @route   DELETE /api/subcategories/:id
 * @access  Private/Admin
 */
export const deleteSubcategory = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    const checkResult = await db.execute({
      sql: "SELECT id FROM subcategories WHERE id = ?",
      args: [id]
    });

    if (checkResult.rows.length === 0) {
      res.status(404);
      throw new Error(`Subcategory with ID ${id} not found`);
    }

    // Delete relationships
    await db.execute({
      sql: "DELETE FROM category_relationships WHERE (parent_id = ? AND parent_type = 'subcategory') OR (child_id = ? AND child_type = 'subcategory')",
      args: [id, id]
    });

    // Delete subcategory
    await db.execute({
      sql: "DELETE FROM subcategories WHERE id = ?",
      args: [id]
    });

    res.json({
      success: true,
      message: `Subcategory with ID ${id} deleted successfully`
    });
  } catch (error) {
    next(error);
  }
};
