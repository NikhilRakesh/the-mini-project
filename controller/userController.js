const signupSchema = require('../modal/signupSchema')
const productSchema = require('../modal/productSchema')
const orderSchema = require('../modal/orderSchema')
const bcrypt = require('bcrypt');
const uuid = require('uuid');
require('dotenv').config();



const fs = require('fs');
const PDFDocument = require('pdfkit');

const generateInvoiceWithPdfKit = (order, newOrder) => {
    console.log('order.amount', order.amount);

    console.log('generateInvoiceWithPdfKit');
    const doc = new PDFDocument();
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0];

    const outputFilename = `invoice_${order.id}.pdf`;
    const outputFilePath = `./public/invoices/${outputFilename}`;
    const writeStream = fs.createWriteStream(outputFilePath);
    doc.pipe(writeStream);

    doc.info.Title = `Invoice ${order.id}`;
    doc.info.Author = 'LuxLifeHub';

    const logoPath = 'public/uploads/LUXLIFEHUB.png';
    doc.image(logoPath, 100, -30, { width: 150 });

    doc.fontSize(20).text('Invoice', { align: 'center' }).moveDown(0.5);
    doc.fontSize(12).text(`Invoice Number: INV-${order.id}`).moveDown(0.5);
    doc.fontSize(12).text(`Invoice Date: ${formattedDate}`).moveDown(0.5);
    doc.fontSize(12).text(`Customer: ${newOrder.customerName}`).moveDown(1);

    doc.font('Helvetica-Bold');
    doc.text('Description', 100, 200, { width: 200 });
    doc.text('Quantity', 300, 200, { width: 50 });
    doc.text('Unit Price', 350, 200, { width: 100 });
    doc.text('Amount', 450, 200, { width: 100 });

    const productsData = newOrder.products;
    let y = 240;

    doc.font('Helvetica');
    productsData.forEach((product) => {
        doc.text(product.productName, 100, y, { width: 200 });
        doc.text(product.quantity.toString(), 300, y, { width: 50 });
        doc.text(product.price.toFixed(2), 350, y, { width: 100 });
        doc.text((product.quantity * product.price).toFixed(2), 450, y, { width: 100 });
        y += 20;
    });

    doc.moveTo(100, y).lineTo(550, y).stroke();

    const totalAmount = productsData.reduce(
        (total, product) => total + product.quantity * product.price,
        0
    );

    doc.fontSize(14).text(`Total: ₹${order.amount.toFixed(2)}`, 350, y + 10, { width: 100 });

    doc.end();

    console.log(`Invoice saved as ${outputFilename}`);
    return outputFilename;
};



const Razorpay = require('razorpay');
const razorpay = new Razorpay({
    key_id: process.env.razorpay_key_id,
    key_secret: process.env.razorpay_key_secret,
});


const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
    }
}); 


const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000);
};

// Function to send OTP verification email
const sendVerificationEmail = async (email, otp) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'OTP Verification',
            text: `Your OTP for verification is: ${otp}`
        };

        await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to ${email}`);
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw error;
    }
};





// home page render
const home = async (req, res) => {
    try {
        let user = null
        if (req.session.user) {
            const userId = req.session.user._id;
            user = await signupSchema.findById(userId);

        }
        const SmartPhones = await productSchema.find({ list: false, category: "SmartPhones" })
        const Laptops = await productSchema.find({ category: "Laptops" });
        let showErrorModal = req.session.showErrorModal
        let passworderror = req.session.passworderror
        req.session.showErrorModal = false
        req.session.passworderror = false
        req.session.invoiceId = null
        res.render('user/home', { SmartPhones, user, Laptops, showErrorModal, passworderror })

    }
    catch (error) {
        console.error('Error fetching user data:', error);
        // Handle errors appropriately
        res.status(500).send('Error fetching user data');
    }

}

var Datastorage = []

// user signup 
const usersignup = async (req, res) => {
    try {
        console.log(req.body);
        const { name, email, phone, password } = req.body;

        const existingUser = await signupSchema.findOne({ email: email });

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const otp = generateOTP();
        sendVerificationEmail(email, otp);

        const expirationMinutes = 5;
        const otpExpiresAt = new Date();
        otpExpiresAt.setMinutes(otpExpiresAt.getMinutes() + expirationMinutes);


        if (existingUser) {
            console.error('Username already exists');
        } else {
            const newUser = new signupSchema({
                username: name,
                email,
                phonenumber: phone,
                password: hashedPassword,
                otp: {
                    code: otp,
                    expiresAt: otpExpiresAt,
                },

            });

            console.log(otp);
            Datastorage = await newUser.save();
        }
    }
    catch (error) {
        console.error('Error during user registration:', error);
        return res.redirect('/home');
    }

}

// verifing otp 
const otpverify = async (req, res) => {
    try {
        const { otp } = req.body;
        console.log('otpverify', Datastorage);

        const user = await signupSchema.findOne({ username: Datastorage.username });
        const userId = user._id
        console.log('usersdata', user._id);

        const currentTimestamp = new Date();

        if (user && user.otp && user.otp.code === otp && user.otp.expiresAt > currentTimestamp) {
            console.log('OTP verified successfully');
            user.otp = null;
            await user.save();
            console.log('OTP verified successfully');
            return res.redirect(`/home?userId=${user._id}`);
        } else {
            await signupSchema.findByIdAndRemove(userId);

            console.error('Invalid OTP or OTP expired');
            req.session.showErrorModal = true

            return res.redirect('/home')
        }
    } catch (error) {
        console.error('Error during OTP verification:', error);

        return res.redirect('/home')
    }
};



// Function to resend OTP
const resendOTP = async () => {
    try {
        const user = await signupSchema.findOne({ username: Datastorage.username });
        const email = user.email;
        const otp = generateOTP();
        console.log('resend', otp);

        // Save the new OTP to the user's database record
        user.otp = {
            code: otp,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000), // Set OTP expiration time (5 minutes)
        };
        await user.save();

        // Resend OTP via email
        await sendVerificationEmail(email, otp);
    } catch (error) {
        console.error('Error resending OTP:', error);
    }
};




// user login
const userlogin = async (req, res) => {
    const { email, password } = req.body;

    try {

        const user = await signupSchema.findOne({ email });

        if (!user) {
            return res.render('user/login', { msg: 'Invalid username and Password' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            console.log('wrong password');
            req.session.passworderror = true
            return res.redirect('/home');
        }
        if (user.blocked) {
            return res.redirect('/home')
        }

        req.session.user = {
            _id: user._id,
            username: user.username,
            email: user.email,
        };

        console.log('loginpost', req.session.user);

        req.session.toast = false

        // Password matches, redirect to home page with user ID
        res.redirect(`/home`);
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).send('Error during login');
    }
}



// users single product page
const userssingleproduct = async (req, res) => {
    console.log('userssingleproduct', req.session.user);

    console.log('userssingleproduct');
    try {
        const productId = req.query.id;

        let user = null
        console.log('home session', req.session.user);
        if (req.session.user) {
            const userId = req.session.user._id;
            user = await signupSchema.findById(userId);

        }

        const product = await productSchema.findById(productId);
        const recommendedProducts = await productSchema.find({ brand: product.brand })
        console.log('recomentation', recommendedProducts);
        if (!recommendedProducts) {
            return res.status(404).json({ error: 'recomentation not found' });
        }

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        let count = 3
        res.render('user/userssingleproduct', {
            product, user, count,
            recommendedProducts,
        })

    } catch (error) {
        console.error('Error finding product:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}






// view all poduct page 
const viewall = async (req, res) => {
    try {
        const category = req.query.category;
        const page = parseInt(req.query.page) || 1;
        const perPage = parseInt(req.query.perPage) || 9;
        let sortOption = req.query.sort
        const selectedBrand = req.query.brand
        const selectedCamera = req.query.camera;
        const selectedStorage = req.query.storage;
        console.log('sortOptionssss', sortOption);
        if(sortOption){
            req.session.sortoption = sortOption
        }
        if(!sortOption){
            sortOption = req.session.sortoption
            console.log('req.session.sortoption', sortOption);

        }

        let query = { list: false, category: category };

        if (selectedBrand && selectedBrand !== 'all') {
            query = { list: false, category: category, brand: selectedBrand }
        }

        if (selectedCamera && selectedCamera !== 'all') {
            query.camera = selectedCamera;
        }

        if (selectedStorage && selectedStorage !== 'all') {
            query.storage = selectedStorage;
        }

        let user = null;

        if (req.session.user) {
            const userId = req.session.user._id;
            user = await signupSchema.findById(userId);
        }
        const uniqueBrands = await productSchema.distinct('brand', { list: false, category: category });
        const trimmedUniqueBrands = uniqueBrands.map(brand => brand.trim());

        const camera = await productSchema.distinct('camera', { list: false, category: category });
        const trimmedcamera = camera.map(brand => brand.trim());

        const storage = await productSchema.distinct('storage', { list: false, category: category });
        const trimmedStorage = storage.map(brand => brand.trim());

        let products;
        let totalProductsCount;

        if (sortOption === 'lowToHigh') {
            console.log('1');
            products = await productSchema.find(query)
                .sort({ price: 1 })
                .skip((page - 1) * perPage)
                .limit(perPage);

            totalProductsCount = await productSchema.countDocuments(query);
        } else if (sortOption === 'highToLow') {
            console.log('2');
            products = await productSchema.find(query)
                .sort({ price: -1 })
                .skip((page - 1) * perPage)
                .limit(perPage);

            totalProductsCount = await productSchema.countDocuments(query);
        } else {
            console.log('3');
            products = await productSchema.find(query)
                .skip((page - 1) * perPage)
                .limit(perPage);

            totalProductsCount = await productSchema.countDocuments(query);
        }

        res.render('user/viewall', {
            products,
            user,
            currentPage: page,
            totalPages: Math.ceil(totalProductsCount / perPage),
            perPage,
            trimmedUniqueBrands, trimmedcamera, trimmedStorage,
            sortOption,
        });
    } catch (error) {
        console.error('Error viewall:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};




// Define a route for handling search requests
const search = async (req, res) => {
    try {
        const userId = req.query.userId; // If you need to include user-specific data
        console.log('query', req.query);
        const { searchQuery } = req.query;

        const user = await signupSchema.findById(userId);

        // Query your database to find matching products based on searchTerm
        const products = await productSchema.find({
            $or: [
                { name: { $regex: searchQuery, $options: 'i' } }, // Case-insensitive username search
                { category: { $regex: searchQuery, $options: 'i' } } // Case-insensitive email search
            ]
        });


        res.render('user/usersearch', { products, user, searchQuery });
    } catch (error) {
        console.error('Error searching:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


// users cart
const cart = async (req, res) => {
    try {



        if (req.session.user) {
            let user = null

            const userId = req.session.user._id;

            user = await signupSchema
                .findById(userId)
                .populate({
                    path: 'shoppingCart.items.productId',
                    model: 'Product', // Replace with your product model name
                });


            let totalPrice = 0;
            user.shoppingCart.items.forEach((cartItem) => {
                totalPrice += cartItem.productId.price * cartItem.quantity; // Multiply by quantity
            });

            const discountPercentage = 12; // 10% discount
            const discount = (totalPrice * discountPercentage) / 100;
            const finalTotal = totalPrice - discount;

            const FormatedtotalPrice = new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
            }).format(totalPrice);

            const formattedDiscount = new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
            }).format(discount);

            const formattedFinalTotal = new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
            }).format(finalTotal);

            return res.render('user/cart', { user, FormatedtotalPrice, formattedDiscount, formattedFinalTotal })

        } else {

            return res.redirect('/home')

        }


    } catch (error) {

        console.error('Error cart:', error);
        res.status(500).json({ error: 'Internal server error' });

    }
}




// add to cart
const addToCart = async (req, res) => {
    try {
        const userId = req.session.user._id;

        const user = await signupSchema.findById(userId).populate('shoppingCart.items.productId');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const productId = req.params.productId;

        const product = await productSchema.findById(productId);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const existingCartItem = user.shoppingCart.items.find((item) =>
            item.productId.equals(productId)
        );

        if (existingCartItem) {
            console.log('existingCartItem');
            if (existingCartItem.quantity + 1 > product.count) {
                return res.status(400).json({ error: 'Quantity exceeds product count' });
            }
            existingCartItem.quantity += 1;
        } else {
            console.log(' not existingCartItem');
            if (1 > product.count) {
                return res.status(400).json({ error: 'Quantity exceeds product count' });
            }
            user.shoppingCart.items.push({
                productId: productId,
                quantity: 1,
            });
        }
        await user.save();
        // req.session.toast = true
        res.status(200).json({ message: 'Product added to cart' });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


// session destroy
const userlogout = (req, res) => {
    console.log('destroy');
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/home');
    });
};



// forgot password render
const forgotpassword = (req, res) => {
    res.render('user/forgotpassword')
}



// sent otp for forgot password
const forgotpasswordotp = async (req, res) => {
    try {
        const { email } = req.body;


        const otpExpiration = new Date(Date.now() + 10 * 60 * 1000);

        const otp = generateOTP();
        await sendVerificationEmail(email, otp);

        const user = await signupSchema.findOne({ email });

        if (!user) {
            return res.status(500).json({ error: 'Internal server error' });
        }

        user.otp = {
            code: otp,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000), // Set OTP expiration time (5 minutes)
        };
        await user.save();

        req.session.otp = {
            code: otp,
            expiresAt: otpExpiration,
            email: email
        };

        return res.redirect('/forgotpasswordotppage');
    } catch (error) {
        console.error('Error in sendOTP:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};



// forgot password otp eneter page
const forgotpasswordotppage = (req, res) => {
    res.render('user/enterotp')
}



//forgotpassword otp verification
const forgototpverify = async (req, res) => {

    try {
        const { otp, password, confirmpassword } = req.body;
        const email = req.session.otp.email
        const user = await signupSchema.findOne({ email });

        if (!user.otp || user.otp.code !== otp || user.otp.expiresAt < new Date()) {
            req.session.showErrorModal = true
            return res.redirect('/home')
        }

        if (password !== confirmpassword) {
            // Display an error message or take appropriate action
            alert('Passwords do not match. Please try again.');
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        user.password = hashedPassword
        console.log(user.password);
        user.otp = null;

        await user.save();
        return res.redirect("/home")
    } catch (error) {
        console.error('Error in forgototpverify:', error);
        res.redirect('/home')
    }
}



// decrease the quantity
const decreaseQuantity = async (req, res) => {
    try {

        const userId = req.params.userId;

        const user = await signupSchema.findById(userId).populate('shoppingCart.items.productId');

        const productId = req.params.productId;

        const product = await productSchema.findById(productId);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const existingCartItem = user.shoppingCart.items.find((item) =>
            item.productId.equals(productId)
        );

        if (!existingCartItem) {
            return res.status(404).json({ error: 'not an exixting product' });
        }

        existingCartItem.quantity -= 1;

        await user.save();

        res.redirect('back')


    } catch (error) {
        console.error('Error in forgototpverify:', error);
        res.redirect('back')
    }
}

// users profile page
const profile = async (req, res) => {
    try {

        let user = null

        if (req.session.user) {
            const userId = req.session.user._id;
            user = await signupSchema.findById(userId);

            res.render('user/profile', { user })
        } else {
            return res.redirect('/home')
        }


    } catch (error) {
        console.error('Error in profile:', error);
        res.redirect('back')
    }
}


// profile update post
const updateProfile = async (req, res) => {
    try {
        console.log(req.body);

        const userId = req.session.user._id;
        user = await signupSchema.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('city', user.address.city);

        const { fullName, email, phoneNumber, street, city, state, postalCode, country } = req.body

        if (req.body.fullName) {
            user.username = fullName;
        }
        if (req.body.email) {
            user.email = email;
        }
        if (req.body.phoneNumber) {
            user.phonenumber = phoneNumber;
        }


        await user.save();

        res.redirect('back')

    } catch (error) {
        console.error('Error in updateProfile:', error);
        res.redirect('back')
    }
}


// create adress post
const addAdress = async (req, res) => {

    try {
        const { street, city, state, postalCode, country } = req.body

        const userId = req.session.user._id;
        user = await signupSchema.findById(userId);

        const newAddress = {
            street,
            city,
            state,
            postalCode,
            country
        };

        user.address.push(newAddress);

        await user.save();

        return res.redirect('back')

    } catch (error) {
        console.error('Error in addAdress:', error);
        res.redirect('back')
    }

}

// edit adress page
const editAdress = async (req, res) => {
    try {
        const { addressId } = req.query;
        const userId = req.session.user._id;
        user = await signupSchema.findById(userId);

        const addressToEdit = user.address.find((address) => address._id.toString() === addressId);
        console.log('addressToEdit', addressToEdit);
        if (!addressToEdit) {
            return res.status(404).json({ message: 'Address not found' });
        }

        res.render('user/adressedit', { user, addressToEdit })

    } catch (error) {
        console.error('Error in editAdress:', error);
        res.redirect('back')
    }

}


// edit adress post
const updateadress = async (req, res) => {
    try {

        const { addressId, street, city, state, postalCode, country } = req.body

        const userId = req.session.user._id;
        const user = await signupSchema.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const addressToUpdate = user.address.id(addressId);

        if (street) {
            addressToUpdate.street = street;
        }
        if (city) {
            addressToUpdate.city = city;
        }
        if (state) {
            addressToUpdate.state = state;
        }
        if (postalCode) {
            addressToUpdate.postalCode = postalCode;
        }
        if (country) {
            addressToUpdate.country = country;
        }

        await user.save();

        res.redirect('/profile');


    } catch (error) {
        console.error('Error in editAdress:', error);
        res.redirect('back')
    }
}



// delete adress
const deleteAdress = async (req, res) => {
    try {
        const { addressId } = req.query;

        const userId = req.session.user._id;

        const user = await signupSchema.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const addressIndex = user.address.findIndex((address) => address._id == addressId);

        if (addressIndex === -1) {
            return res.status(404).json({ message: 'Address not found' });
        }

        user.address.splice(addressIndex, 1);

        await user.save();

        res.redirect('/profile')

    } catch (error) {
        console.error('Error in deleteAdress:', error);
        res.redirect('back')
    }
}


// checkout page
const checkout = async (req, res) => {
    try {




        const userId = req.session.user._id;

        const user = await signupSchema
            .findById(userId)
            .populate({
                path: 'shoppingCart.items.productId',
                model: 'Product',
            });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }


        let totalPrice = 0;
        user.shoppingCart.items.forEach((cartItem) => {
            totalPrice += cartItem.productId.price * cartItem.quantity;
        });

        const discountPercentage = 12; // 10% discount
        const discount = (totalPrice * discountPercentage) / 100;
        const finalTotal = totalPrice - discount;

        const FormatedtotalPrice = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(totalPrice);

        const formattedDiscount = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(discount);

        const formattedFinalTotal = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(finalTotal);

        res.render('user/checkout', { user, FormatedtotalPrice, formattedDiscount, formattedFinalTotal })

    } catch (error) {
        console.error('Error in deleteAdress:', error);
        res.redirect('back')
    }
}




// user can select adress for delevery
const primary = async (req, res) => {
    try {
        const { addressId } = req.body

        const userId = req.session.user._id;

        const user = await signupSchema.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.address.forEach((address) => {
            if (address._id.toString() === addressId) {
                address.primary = true;
            } else {
                address.primary = false;
            }
        });

        await user.save();
        res.redirect('back')

    } catch (error) {
        console.error('Error in primary:', error);
        res.redirect('back')
    }
}

const buyNowConfirorder = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const formattedAmount = req.query.formattedAmount;
        const productid = req.query.productid;
        const numericValue = parseFloat(formattedAmount.replace(/[^0-9.]/g, ''));

        const user = await signupSchema.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const product = await productSchema.findById(productid);
        console.log('product', product);

        const newOrder = new orderSchema({
            user: user._id,
            customerName: user.username,
            orderDate: new Date(),
            products: {
                productName: product.name,
                quantity: 1,
                price: product.price,  
                imageUrl: product.imageUrl
            },
            totalPrice: numericValue,
            shippingAddress: user.address.find((address) => address.primary),
        });
        const remainingCount = product.count - 1;
        await productSchema.findByIdAndUpdate(productid, { count: remainingCount });
        await newOrder.save();
        res.redirect('/ordersuccessfulpage')

    } catch (error) {
        console.error('Error in buyNowConfirorder:', error);
        res.redirect('back')
    }
}

// assagining data to order schema after place the order
const confirmOrder = async (req, res) => {
    try {

        if (!req.session.user) {
            return res.redirect('/home');
        }

        const userId = req.session.user._id;
        const formattedAmount = req.query.formattedAmount;
        console.log('formattedAmount', formattedAmount);
        const numericValue = parseFloat(formattedAmount.replace(/[^0-9.]/g, ''));

        const user = await signupSchema.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const cartProducts = await Promise.all(user.shoppingCart.items.map(async (cartItem) => {
            const populatedCartItem = await signupSchema.populate(cartItem, {
                path: 'productId',
                model: 'Product'
            });

            const productImages = populatedCartItem.productId.imageUrl
            const remainingCount = populatedCartItem.productId.count - cartItem.quantity;
            await productSchema.findByIdAndUpdate(populatedCartItem.productId._id, { count: remainingCount });

            return {
                product: populatedCartItem.productId,
                quantity: cartItem.quantity,
                images: productImages
            };
        }))

        const totalPrice = cartProducts.reduce((total, cartItem) => {
            return total + (cartItem.product.price * cartItem.quantity);
        }, 0);

        const newOrder = new orderSchema({
            user: user._id,
            customerName: user.username,
            orderDate: new Date(),
            products: cartProducts.map((cartItem) => ({
                productName: cartItem.product.name,
                quantity: cartItem.quantity,
                price: cartItem.product.price,
                imageUrl: cartItem.images
            })),
            totalPrice: numericValue,
            shippingAddress: user.address.find((address) => address.primary),
        });

        user.shoppingCart.items = [];


        await newOrder.save();
        await user.save();


        res.redirect('/ordersuccessfulpage')


    } catch (error) {
        console.error('Error in confirmOrder:', error);
        res.redirect('back')
    }
}



// my order page
const myOrder = async (req, res) => {
    try {

        if (!req.session.user) {
            return res.redirect('/home');
        }

        const userId = req.session.user._id;

        const user = await signupSchema
            .findById(userId)
            .populate({
                path: 'shoppingCart.items.productId',
                model: 'Product', // Replace with your product model name
            });

        const orders = await orderSchema
            .find({ customerName: user.username })
            .populate('products.productName');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.render('user/orders', { user, orders })

    } catch (error) {
        console.error('Error in myOrder page:', error);
        res.redirect('back')
    }
}


const falser = (req, res) => {
    req.session.toast = false
    res.redirect('back')
}



// buy now 
const buyNow = async (req, res) => {
    try {

        const userId = req.session.user._id;

        const user = await signupSchema
            .findById(userId)


        const productId = req.query.productId
        const product = await productSchema.findById(productId);



        res.render('user/buyNow', { product, user })
    } catch (error) {
        console.error('Error in buyNow:', error);
        res.redirect('back')
    }
}



const buyNoworder = async (req, res) => {
    try {
        console.log('buynoworder', req.body);
        const userId = req.session.user._id;

        const user = await signupSchema
            .findById(userId)

        const productId = req.query.productId
        const product = await productSchema.findById(productId);

        const newOrder = new orderSchema({
            user: user._id,
            customerName: user.username,
            orderDate: new Date(),
            products: [
                {
                    productName: product.name,
                    quantity: 1, // Assuming you want to add a quantity of 1 for a single product
                    price: product.price,
                    imageUrl: product.imageUrl, // Assuming you want to use the product's images
                },
            ],
            totalPrice: product.price,
            shippingAddress: user.address.find((address) => address.primary),
        });

        console.log('buynoworder', newOrder);

        await newOrder.save();

        res.redirect('/home')


    } catch (error) {
        console.error('Error in buyNoworder:', error);
        res.redirect('back')
    }
}

const wishlist = async (req, res) => {
    try {
        console.log('here wlist');
        const userId = req.session.user._id;

        const user = await signupSchema.findById(userId).populate('wishlist.productId');


        res.render('user/wishlist', { user })

    } catch (error) {
        console.error('Error in wishlist:', error);
        res.redirect('back')
    }
}



const createOrder = async (req, res) => {
    try {
        const currency = 'INR';
        let { amount, productid } = req.body;
        amount = amount.replace(/[^0-9.]/g, '');
        const integerValue = parseInt(amount, 10);
        const userId = req.session.user._id;
        const user = await signupSchema.findById(userId);


        const Amount = integerValue * 100

        let newOrder = null
        if (productid === null) {



            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const cartProducts = await Promise.all(user.shoppingCart.items.map(async (cartItem) => {
                const populatedCartItem = await signupSchema.populate(cartItem, {
                    path: 'productId',
                    model: 'Product'
                });

                const productImages = populatedCartItem.productId.imageUrl

                return {
                    product: populatedCartItem.productId,
                    quantity: cartItem.quantity,
                    images: productImages
                };
            }))

            const totalPrice = cartProducts.reduce((total, cartItem) => {
                return total + (cartItem.product.price * cartItem.quantity);
            }, 0);

            newOrder = new orderSchema({
                user: user._id,
                customerName: user.username,
                orderDate: new Date(),
                products: cartProducts.map((cartItem) => ({
                    productName: cartItem.product.name,
                    quantity: cartItem.quantity,
                    price: cartItem.product.price,
                    imageUrl: cartItem.images
                })),
                totalPrice: integerValue,
                shippingAddress: user.address.find((address) => address.primary),
            });
            await newOrder.save();

        } else {

            const product = await productSchema.findById(productid);

            newOrder = new orderSchema({
                user: user._id,
                customerName: user.username,
                orderDate: new Date(),
                products: [
                    {
                        productName: product.name,
                        quantity: 1,
                        price: product.price,
                        imageUrl: product.imageUrl,
                    },
                ],
                totalPrice: integerValue,
                shippingAddress: user.address.find((address) => address.primary),
            });



        }

        razorpay.orders.create({
            amount: Amount,
            currency: currency
        }, async (error, order) => {

            if (error) {
                console.error(error);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                try {
                    console.log('newOrder', order);
                    const pdfLink = await generateInvoiceWithPdfKit(order, newOrder);
                    req.session.invoiceId = pdfLink
                    res.json({ order, pdfLink });
                } catch (invoiceError) {
                    console.error('Error generating invoice:', invoiceError);
                    res.status(500).json({ error: 'Error generating invoice' });
                }
            }
        });

    } catch (error) {
        console.error('Error in wishlist:', error);
        res.redirect('back')
    }
}


const ordersuccessfulpage = async (req, res) => {
    try {
        const invoiceId = req.session.invoiceId
        console.log('invoiceId ', invoiceId);
        res.render('user/ordersuccessfull', { invoiceId })

    } catch (error) {
        console.error('Error in ordersuccessfulpage:', error);
        res.redirect('back')
    }
}

const cashondelivery = async (req, res) => {
    try {

        const { amount, productid } = req.body

        const userId = req.session.user._id;
        const user = await signupSchema.findById(userId);

        const generateUniqueID = () => {
            return uuid.v4();
        };

        const uniqueOrderID = generateUniqueID();


        const order = {
            id: uniqueOrderID,
            amount: parseFloat(amount.replace(/[^0-9.]/g, '')),
            currency: "INR"
        }

        let newOrder = null
        if (productid === null) {



            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const cartProducts = await Promise.all(user.shoppingCart.items.map(async (cartItem) => {
                const populatedCartItem = await signupSchema.populate(cartItem, {
                    path: 'productId',
                    model: 'Product'
                });

                const productImages = populatedCartItem.productId.imageUrl

                return {
                    product: populatedCartItem.productId,
                    quantity: cartItem.quantity,
                    images: productImages
                };
            }))

            const totalPrice = cartProducts.reduce((total, cartItem) => {
                return total + (cartItem.product.price * cartItem.quantity);
            }, 0);

            newOrder = new orderSchema({
                user: user._id,
                customerName: user.username,
                orderDate: new Date(),
                products: cartProducts.map((cartItem) => ({
                    productName: cartItem.product.name,
                    quantity: cartItem.quantity,
                    price: cartItem.product.price,
                    imageUrl: cartItem.images
                })),
                totalPrice: totalPrice,
                shippingAddress: user.address.find((address) => address.primary),
            });
        } else {

            const product = await productSchema.findById(productid);

            newOrder = new orderSchema({
                user: user._id,
                customerName: user.username,
                orderDate: new Date(),
                products: [
                    {
                        productName: product.name,
                        quantity: 1,
                        price: product.price,
                        imageUrl: product.imageUrl,
                    },
                ],
                totalPrice: product.price,
                shippingAddress: user.address.find((address) => address.primary),
            });



        }


        const pdfLink = await generateInvoiceWithPdfKit(order, newOrder);
        console.log(' req.session.invoiceId:', pdfLink);
        req.session.invoiceId = pdfLink

        res.json({ message: 'Cash on Delivery request received' });


    } catch (error) {
        console.error('Error in cashondelivery:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}






module.exports = {
    home, usersignup,
    otpverify, userlogin,
    resendOTP, userssingleproduct,
    viewall, search, cart,
    addToCart, userlogout, forgotpassword,
    forgotpasswordotp, forgotpasswordotppage,
    forgototpverify, decreaseQuantity, profile,
    updateProfile, addAdress, editAdress, updateadress,
    deleteAdress, checkout, primary, confirmOrder, myOrder,
    falser, buyNow, buyNoworder, wishlist, createOrder,
    ordersuccessfulpage, cashondelivery, buyNowConfirorder,
}