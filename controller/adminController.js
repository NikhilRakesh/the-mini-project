const signupSchema = require('../modal/signupSchema')
const categorySchema = require('../modal/categorySchema')
const adminSchema = require('../modal/adminSchema')
const orderSchema = require('../modal/orderSchema')
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const uuid = require('uuid');
const ExcelJS = require('exceljs');
const moment = require('moment');
const mongoose = require('mongoose');   




const generateExcelSalesReport = async (req, res) => {
    try {
       const endDate = new Date(req.query.endDate)
       let startDate = new Date(req.query.startDate);
        const startOfMonth = moment().startOf('month');
        const endOfMonth = moment().endOf('month');
        console.log('startOfMonth',startOfMonth,endOfMonth.toDate());


        const salesData = await orderSchema.aggregate([
            {
                $match: {
                    orderDate: {
                        $gte: startDate,
                        $lte: endDate,
                    },
                },
            },
            {
                $unwind: '$products',
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'products.product',
                    foreignField: '_id',
                    as: 'productData',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'userData',
                },
            },
            {
                $project: {
                    orderId: '$_id',
                    orderedAddress: {
                        address: '$shippingAddress.street',
                        city: '$shippingAddress.city',
                        state: '$shippingAddress.state',
                        pincode: '$shippingAddress.postalCode',
                        country: '$shippingAddress.country',
                    },
                    products: {
                        productName: '$products.productName',
                        quantity: '$products.quantity',
                        price: '$products.price',
                        imageUrl: '$products.imageUrl',
                    },
                    totalPrice: 1,
                },
            }]);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Monthly Sales Report');

        worksheet.columns = [
            { header: 'Order ID', key: 'orderId' },
            { header: 'Ordered Address', key: 'orderedAddress.address' },
            { header: 'Ordered City', key: 'orderedAddress.city' },
            { header: 'Ordered State', key: 'orderedAddress.state' },
            { header: 'Ordered Pincode', key: 'orderedAddress.pincode' },
            { header: 'Ordered Country', key: 'orderedAddress.country' },
            { header: 'Product Name', key: 'productName' },
            { header: 'Order Price', key: 'orderPrice' },
        ];
        salesData.forEach(orderData => {
            worksheet.addRow({
                orderId: orderData.orderId,
                'orderedAddress.address': orderData.orderedAddress.address,
                'orderedAddress.city': orderData.orderedAddress.city,
                'orderedAddress.state': orderData.orderedAddress.state,
                'orderedAddress.pincode': orderData.orderedAddress.pincode,
                'orderedAddress.country': orderData.orderedAddress.country,
                'orderedAddress.phone': orderData.orderedAddress.phone,
                productName: orderData.products.productName,
                orderPrice: `Rs. ${orderData.totalPrice}`,
            });
        });
        
        const excelBuffer = await workbook.xlsx.writeBuffer();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=monthly_sales_report.xlsx');
        res.send(excelBuffer);

        console.log('Monthly Excel report generated successfully');

    } catch (error) {
        console.error('Error generating Monthly Excel report:', error);
        res.status(500).send('Internal Server Error');
    }
}



function getMonthName(monthIndex) {
    const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul',
        'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    return months[monthIndex];
}

function getWeekNumber(date) {
    const onejan = new Date(date.getFullYear(), 0, 1);
    const weekNumber = Math.ceil(((date - onejan) / 86400000 + onejan.getDay() + 1) / 7);
    return weekNumber;
}

const generateSalesReportWithPdfKit = (Orders) => {
    console.log('generateSalesReportWithPdfKit');
    const doc = new PDFDocument();
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0];
    const generateUniqueID = () => {
        return uuid.v4();
    };
    const uniqueOrderID = generateUniqueID();

    const outputFilename = `${uniqueOrderID}_report.pdf`;
    const outputFilePath = `./public/sales_reports/${outputFilename}`;
    const writeStream = fs.createWriteStream(outputFilePath);
    doc.pipe(writeStream);

    doc.info.Title = 'Sales Report';
    doc.info.Author = 'Your Company Name';

    doc.fontSize(20).text('Sales Report', { align: 'center' }).moveDown(0.5);
    doc.fontSize(12).text(`Report Date: ${formattedDate}`).moveDown(1);

    doc.font('Helvetica-Bold');
    doc.text('Order Date', 100, 200, { width: 150 });
    doc.text('Customer Name', 250, 200, { width: 150 });
    doc.text('Total Price', 400, 200, { width: 100 });

    let y = 240;

    doc.font('Helvetica');
    Orders.forEach((order) => {
        doc.text(order.orderDate.toISOString().split('T')[0], 100, y, { width: 150 });
        doc.text(order.customerName, 250, y, { width: 150 });
        doc.text(`₹${order.totalPrice.toFixed(2)}`, 400, y, { width: 100 });
        y += 20;
    });

    doc.moveTo(100, y).lineTo(500, y).stroke();

    const totalSales = Orders.reduce((total, order) => total + order.totalPrice, 0);

    doc.fontSize(14).text(`Total Sales: ₹${totalSales.toFixed(2)}`, 350, y + 10, { width: 100 });

    doc.end();

    console.log(`Sales report saved as ${outputFilename}`);
    return outputFilename;
};




// admin home page
const adminhome = async (req, res) => {
    try {



        const orders = await orderSchema.find({}, 'orderDate totalPrice').exec();

        const labels = [];
        const data = [];

        orders.forEach((order) => {
            const orderMonth = order.orderDate.getMonth();
            if (!labels.includes(orderMonth)) {
                labels.push(orderMonth);
                data.push(order.totalPrice);
            } else {
                const index = labels.indexOf(orderMonth);
                data[index] += order.totalPrice;
            }
        });

        const revenuedata = {
            labels: labels.map((month) => getMonthName(month)),
            datasets: [{
                label: 'Revenue',
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            }],
        };


        const weeklyLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const weeklyData = [0, 0, 0, 0, 0, 0, 0];

        orders.forEach((order) => {
            const orderDay = order.orderDate.getDay();
            weeklyData[orderDay] += order.totalPrice;
        });

        const ordersData = {
            labels: weeklyLabels,
            datasets: [{
                label: 'Weekly Orders',
                data: weeklyData,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        };


        // Calculate monthly earnings
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();
        const monthlyEarnings = orders.reduce((total, order) => {
            const orderYear = order.orderDate.getFullYear();
            const orderMonth = order.orderDate.getMonth();
            if (orderYear === currentYear && orderMonth === currentMonth) {
                total += order.totalPrice;
            }
            return total;
        }, 0);

        // Calculate yearly earnings
        const yearlyEarnings = orders.reduce((total, order) => {
            const orderYear = order.orderDate.getFullYear();
            if (orderYear === currentYear) {
                total += order.totalPrice;
            }
            return total;
        }, 0);

        const weeklyHitRateData = [0, 0, 0, 0, 0];

        // Calculate the hit rate data based on your order schema
        orders.forEach((order) => {

            const orderDate = new Date(order.orderDate);
            const weekNumber = getWeekNumber(orderDate);
            weeklyHitRateData[weekNumber - 1]++;
        });

        const hitRateData = {
            labels: weeklyLabels,
            datasets: [{
                label: 'Hit Rate',
                data: weeklyHitRateData,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        };



        res.render('admin/adminhome', { revenuedata, ordersData, monthlyEarnings, yearlyEarnings, hitRateData })
    } catch (error) {
        console.error('Error during adminhome:', error);
        return res.redirect('/admin');
    }


}


const generateSalesReport = async (req, res) => {
    try {
        const Orders = await orderSchema.find({}, 'orderDate customerName totalPrice').exec();

        const reportFilename = await generateSalesReportWithPdfKit(Orders);

        res.status(200).json({ filename: reportFilename });

    } catch (error) {
        console.error('Error during sales report generation:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}


const downloadSalesreport = async (req, res) => {
    try {
        const filename = req.params.filename;
        console.log('filename', filename);
        const filePath = `public/sales_reports/${filename}`
        console.log('filePath', filePath);

        if (!fs.existsSync(filePath)) {
            console.log('File not found');
            return res.status(404).json({ error: 'File not found' });
        }

        res.setHeader('Content-disposition', `attachment; filename=${filename}`);
        res.setHeader('Content-type', 'application/pdf');

        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    } catch (error) {
        console.error('Error during sales report download:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}




// admin user list page
const adminusers = async (req, res) => {
    try {

        const users = await signupSchema.find();

        res.render('admin/adminusers', { users })

    }
    catch (error) {
        console.error('Error during adminusers:', error);
        return res.redirect('/home');
    }
}


//  admin dashbord
const adminlogin = (req, res) => {
    if (req.session.admin) {
        res.redirect('/admindashbord')
    }
    res.render('admin/adminlogin')
}

// adim login post
const adminloginpost = async (req, res) => {
    try {
        console.log(req.body);

        const { username, password } = req.body;
        const user = await adminSchema.findOne({ username });
        console.log(user);
        if (!user) {
            console.log(`Admin not found for username: ${username}`);
            return res.status(401).send('Invalid username or password');
        }
        if (user.password !== password) {
            return res.status(401).send('Invalid password');
        }
        req.session.admin = username;

        res.redirect('/admindashbord')

    } catch (error) {
        console.error('Error in admin:', error);
        res.redirect('/admin');
    }

}

// admin logout
const adminlogout = (req, res) => {
    console.log('destroy');
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/admin');
    });
};






// user block
const userblock = async (req, res) => {

    const userId = req.params.userId;

    try {
        const user = await signupSchema.findById(userId);

        if (!user) {
            return res.status(404).send('User not found');
        }


        user.blocked = true;
        await user.save();
        return res.redirect('back');

    } catch (error) {
        console.error('Error blocking user:', error);
        res.status(500).send('Internal Server Error');
    }

}



// user unblock
const userunblock = async (req, res) => {

    const userId = req.params.userId;

    try {
        const user = await signupSchema.findById(userId);

        if (!user) {
            return res.status(404).send('User not found');
        }


        user.blocked = false;
        await user.save();
        return res.redirect('back');

    } catch (error) {
        console.error('Error blocking user:', error);
        res.status(500).send('Internal Server Error');
    }


}


const adminCatageory = async (req, res) => {
    try {
        const categories = await categorySchema.find()
        console.log('adminCatageory', categories);
        res.render('admin/adminCatageory', { categories })

    } catch (error) {
        console.error('Error adminCatageory:', error);
        res.status(500).send('adminCatageory Error');
    }
}



const catageoryedit = async (req, res) => {
    try {

        const catageoryId = req.params.catageoryId

        const categories = await categorySchema.findById(catageoryId)

        res.render('admin/catageoryedit', { categories })

    } catch (error) {
        console.error('Error catageoryedit:', error);
        res.status(500).send('catageoryedit Error');
    }
}



const updatecatageory = async (req, res) => {
    try {

        const catageoryId = req.params.catageoryId

        const { categoryName } = req.body

        const categories = await categorySchema.findById(catageoryId)

        categories.name = categoryName

        await categories.save()

        res.redirect('/adminCatageory')

    } catch (error) {
        console.error('Error updatecatageory:', error);
        res.status(500).send('updatecatageory Error');
    }
}


const deleteCatageory = async (req, res) => {
    try {

        const catageoryId = req.params.catageoryId

        const deletecatageory = await categorySchema.findByIdAndRemove(catageoryId);

        if (!deletecatageory) {
            return res.status(404).send('catageory not found');
        }

        res.redirect('back')

    } catch (error) {
        console.error('Error deleteCatageory:', error);
        res.status(500).send('deleteCatageory Error');
    }
}


const orders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; 
        console.log('pageee',page);
        const itemsPerPage = 10; 
        console.log('(page - 1) * itemsPerPage',(page - 1) * itemsPerPage);


        const totalOrders = await orderSchema.countDocuments({});
        const totalPages = Math.ceil(totalOrders / itemsPerPage);

        const orders = await orderSchema
            .find({})
            .sort({ orderDate: -1 })
            .skip((page - 1) * itemsPerPage) 
            .limit(itemsPerPage);

        if (!orders) {
            return res.status(404).json({ message: 'orders not found' });
        }

        res.render('admin/orders', { orders,page, totalPages  })

    } catch (error) {
        console.error('Error orders:', error);
        res.status(500).send('orders Error');
    }
}





module.exports = {
    adminhome, adminusers,
    adminlogin, adminloginpost,
    adminlogout, userblock, userunblock,
    adminCatageory, catageoryedit,
    updatecatageory, deleteCatageory,
    orders, generateSalesReport,
    downloadSalesreport, generateExcelSalesReport,

}