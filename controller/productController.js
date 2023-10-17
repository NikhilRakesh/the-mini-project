const productSchema = require('../modal/productSchema')
const categorySchema = require('../modal/categorySchema')
const signupSchema = require('../modal/signupSchema')
const path = require('path')



// admin product list page
const adminproducts = async (req, res) => {
    const products = await productSchema.find();
    const categories = await categorySchema.find()

    res.render('admin/adminproducts', { products, categories })
}



// adding products
const addProduct = async (req, res) => {
    try {
        const { name, description, price, category, color, rating } = req.body;
        console.log('category', category);



           if (!req.files || req.files.length === 0) {
      return res.status(400).send('No files uploaded.');
    }

    const imagePaths = req.files.map(file => {
      let imagePath = file.path;

      if (imagePath.includes('public\\')) {
        imagePath = imagePath.replace('public\\', '');
      } else if (imagePath.includes('public/')) {
        imagePath = imagePath.replace('public/', '');
      }
      return imagePath;
    });

        // Create a new product instance
        const newProduct = new productSchema({
            name,
            description,
            price,
            category,
            color,
            imageUrl: imagePaths,
        });

        await newProduct.save();

        res.redirect('/adminproducts');
    } catch (error) {
        console.error('Error adding product:', error);
        res.redirect('/adminproducts');
    }
};


// add category
const addCategory = async (req, res) => {

    try {

        const { name } = req.body

        const existingCategory = await categorySchema.findOne({ name });

        if (existingCategory) {
            // Category already exists, send an error message
            console.log('Category already exists');
            return res.redirect('back')
        }

        const newCategory = new categorySchema({
            name: name,
        });

        await newCategory.save();
        res.redirect('/adminCatageory')
    }
    catch (error) {

        console.error('Error creating category:', error);
    }

}

// edit products
const productedit = async (req, res) => {
    try {
        const productId = req.query.id
        const product = await productSchema.findById(productId)
        const categories = await categorySchema.find()
        res.render('admin/productedit', { product, categories })

    } catch (error) {
        console.error('Error productedit:', error);
    }
}


//update product and save
const updateProduct = async (req, res) => {
    try {
        const productId = req.params.productId;
        // Find the product by ID
        const product = await productSchema.findById(productId);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Update product details based on the request body
        product.name = req.body.Productname;
        product.category = req.body.category;
        product.price = req.body.price;
        product.color = req.body.color;

        // Save the updated product
        await product.save();


        res.redirect('/adminproducts')
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// delete product
const productdelete = async (req, res) => {
    console.log('userdelete');

    try {
        const productId = req.query.id
        // find the user with userid and delete from database
        const deleteproduct = await productSchema.findByIdAndRemove(productId);

        if (!deleteproduct) {
            return res.status(404).send('User not found');
        }
        res.redirect('/adminproducts');

    }

    catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).send('Internal Server Error');
    }
}


// delete product from user cart
const deleteProductCart = async (req, res) => {

    try {

        const userId = req.params.userId;
        const productId = req.params.productId;

        const user = await signupSchema.findById(userId);
        console.log('deleteProductCart', user.shoppingCart.items);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const product = await productSchema.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        user.shoppingCart.items = user.shoppingCart.items.filter(cartItem => cartItem.productId.toString() !== productId);
        console.log('deleteProductCart2', user.shoppingCart.items);

        await user.save();

        return res.redirect('back')

    } catch (error) {
        console.error('Error deleting product:', error);
        return res.redirect('back')
    }
}




const productImageEdit = async (req,res) => {
    try{

        const imageurll = req.query.imageUrl
        const imageurl = imageurll
        console.log('productImageEdit',imageurl);
        res.render('admin/imageedit', { imageurl });

    } catch (error) {
        console.error('Error productImageEdit:', error);
        return res.redirect('back')
    }
}






module.exports = {
    addProduct, adminproducts,
    addCategory, productedit,
    updateProduct, productdelete,
    deleteProductCart,productImageEdit,
}