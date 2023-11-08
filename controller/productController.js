const productSchema = require('../modal/productSchema')
const categorySchema = require('../modal/categorySchema')
const signupSchema = require('../modal/signupSchema')
const orderSchema = require('../modal/orderSchema')
const walletSchema = require('../modal/walletSchema')


const path = require('path')



// admin product list page
const productsPerPage = 10; // Set the number of products to display per page


const adminproducts = async (req, res) => {
    const page = req.query.page || 1; // Get the current page from the query parameters (default to page 1)
    const skip = (page - 1) * productsPerPage;

    const totalProducts = await productSchema.countDocuments();

    // Retrieve a slice of products based on pagination
    const products = await productSchema
        .find({ list: false })
        .skip(skip)
        .limit(productsPerPage);

    const totalPages = Math.ceil(totalProducts / productsPerPage);

    const categories = await categorySchema.find();

    res.render('admin/adminproducts', { products, categories, currentPage: parseInt(page), totalPages });
};



// adding products
const addProduct = async (req, res) => {
    try {
        const { name, description, price, category, color, Storage, Ram, Camera, Brand } = req.body;
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
            Ram: Ram,
            camera: Camera,
            brand: Brand,
            storage: Storage,
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
        console.log('req.body', req.body.name);

        const { name } = req.body;
        console.log('name', name);


        const existingCategory = await categorySchema.findOne({
            name: { $regex: new RegExp('^' + name + '$', 'i') }
        });

        if (existingCategory) {
            console.log('Category already exists');
            return res.status(500).json({ error: 'Category already exists' });
        } else {

            const newCategory = new categorySchema({
                name: name,
            });

            await newCategory.save();
            return res.status(200).json({ success: true, message: 'Category created successfully' })
        }


        // res.redirect('/adminCatageory')
    }
    catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ error: 'Internal server error' });
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
        const product = await productSchema.findById(productId);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        product.name = req.body.Productname;
        product.category = req.body.category;
        product.price = req.body.price;
        product.color = req.body.color;
        product.description = req.body.description;
        product.Ram = req.body.Ram;
        product.brand = req.body.brand;
        product.camera = req.body.camera;
        product.storage = req.body.storage;


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




const productImageEdit = async (req, res) => {
    try {

        const imageurll = req.query.imageUrl
        const imageurl = imageurll
        console.log('productImageEdit', imageurl);
        res.render('admin/imageedit', { imageurl });

    } catch (error) {
        console.error('Error productImageEdit:', error);
        return res.redirect('back')
    }
}

const stockPage = async (req, res) => {
    try {

        const product = await productSchema.find({});

        res.render('admin/stock', { product })

    } catch (error) {
        console.error('Error stockPage:', error);
        return res.redirect('back')
    }
}

const listProduct = async (req, res) => {
    try {
        const productId = req.query.productId
        console.log('list product');
        const product = await productSchema.findById(productId);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        product.list = false;
        await product.save();

        res.redirect('back')
    } catch (error) {
        console.error('Error list:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}


const unlistproduct = async (req, res) => {
    try {
        const productId = req.query.productId;
        console.log('Unlist product');

        const product = await productSchema.findById(productId);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        product.list = true;
        await product.save();

        res.redirect('back')
    } catch (error) {
        console.error('Error unlisting product:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}



const count = async (req, res) => {
    try {
        const productId = req.query.productId
        const count = req.query.newQuantity
        console.log('count', count);
        const product = await productSchema.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        console.log('product.count', product.count);
        product.count = count
        await product.save()

        return res.status(200).json({ success: true, message: 'Product count updated' });

    } catch (error) {
        console.error('Error updating product count:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}


const cancelOrder = async (req, res) => {
    try {
        console.log('cancel order ');
        const orderId = req.query.orderId
        const status = req.query.status
        const order = await orderSchema.findById(orderId)
        console.log('status',status,'order', order);
        if (status == 'Canceled'||status == 'Order return') {
            for (const product of order.products) {
                const productname = product.productName;
               
                const updatedProduct = await productSchema.findOne({ name: productname });
                if (updatedProduct) {
                    console.log('product:', product);
                    console.log('Updated product:', updatedProduct);
                    const quantity = product.quantity;
                    updatedProduct.count += quantity;
                    await updatedProduct.save();
                } else {
                    console.log('Product not found for name:', productname);
                }
            }
            const refundAmount = order.totalPrice;
            const userId = order.user;
            const user = await signupSchema.findById(userId);
            const wallet = await walletSchema.findOne({ userId: userId });

            if (!wallet) {
                const newWallet = await walletSchema.create({ userId });
                user.wallet = newWallet;
                await user.save();

                newWallet.balance += refundAmount;
                newWallet.transactions.push({
                    type: 'credit',
                    amount: refundAmount,
                });
                await newWallet.save();
            } else {
                wallet.transactions.push({
                    type: 'credit',
                    amount: refundAmount,
                });
                wallet.balance += refundAmount;
                await wallet.save();
            }
        }

            order.status = status;
            await order.save();
        
        
        res.redirect('back')
    } catch (error) {
        console.log('catchhhhh');
        console.error('Error updating cancelOrder:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

// addwishlist
const addwishlist = async (req, res) => {
    try {

        const { productId } = req.body;

        const userId = req.session.user._id;

        const user = await signupSchema.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const product = await productSchema.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const isProductInWishlist = user.wishlist.some(item => item.productId.equals(productId));
        if (isProductInWishlist) {
            const user = await signupSchema.findByIdAndUpdate(
                userId,
                { $pull: { wishlist: { productId: productId } } },
                { new: true }
            );
            await user.save();
            return res.status(409).json({ success: false, message: 'Product already in wishlist' });
        }

        user.wishlist.push({ productId });

        await user.save();

        return res.status(200).json({ success: true, message: 'Product added to wishlist' });

    } catch (error) {
        console.error('Error updating addwishlist:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}


//  deleteFromWishlist
const deleteFromWishlist = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const productId = req.params.productId;

        const user = await signupSchema.findByIdAndUpdate(
            userId,
            { $pull: { wishlist: { productId: productId } } },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'Product removed from wishlist' });
    } catch (error) {
        console.error('Error in deleteFromWishlist:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};







module.exports = {
    addProduct, adminproducts,
    addCategory, productedit,
    updateProduct, productdelete,
    deleteProductCart, productImageEdit,
    stockPage, listProduct, unlistproduct,
    count, cancelOrder, addwishlist, deleteFromWishlist,
}