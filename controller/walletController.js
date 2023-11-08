const walletSchema = require('../modal/walletSchema')
const signupSchema = require('../modal/signupSchema')
const productSchema = require('../modal/productSchema')
const uuid = require('uuid');
const orderSchema = require('../modal/orderSchema')


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



const walletPage = async (req,res) => {
    try {
        const userId = req.session.user._id; 
        const wallet = await walletSchema.findOne({userId: userId });

        if (wallet) {
            const walletBalance = wallet.balance;

            const transactions = wallet.transactions;

            res.render('user/wallet', { walletBalance, transactions });
        } else {
            res.render('user/wallet', { walletBalance: 0, transactions: [] }); 
        }
    } catch (error) {
        console.error('Error while fetching wallet balance and transactions:', error);
        res.status(500).send('Internal server error');
    }
}


// wallet payment 
const walletpayment = async (req,res) => {
    try{
        let { amount, productid } = req.body
        amount = amount.replace(/[^0-9.]/g, '');
        const integerValue = parseInt(amount, 10);
        const userId = req.session.user._id;
        const wallet = await walletSchema.findOne({userId: userId });
        const user = await signupSchema.findById(userId);
        console.log('integerValue',integerValue);
        if (wallet.balance < integerValue) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }
        console.log('wallet productid',productid);

        wallet.balance -= integerValue

        wallet.transactions.push({
            type: 'debit', 
            amount: integerValue, 
        });

        const generateUniqueID = () => {
            return uuid.v4();
        };

        const uniqueOrderID = generateUniqueID();


        const order = {
            id: uniqueOrderID,
            amount: parseFloat(amount.replace(/[^0-9.]/g, '')),
            currency: "INR"
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
        let newOrder = null

        if(productid == null){

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
        }else {
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


        const pdfLink = await generateInvoiceWithPdfKit(order, newOrder);
                    req.session.invoiceId = pdfLink
       
        await wallet.save();

        res.status(200).json({ message: 'Payment from wallet successful' });
    } catch (error) {
        console.error('Error while processing walletpayment:', error);
        res.status(500).send('Internal server error');
    }
}



module.exports= {
    walletPage,walletpayment,
}