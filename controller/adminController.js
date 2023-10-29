const signupSchema = require('../modal/signupSchema')
const categorySchema = require('../modal/categorySchema')
const adminSchema = require('../modal/adminSchema')
const orderSchema = require('../modal/orderSchema')

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


        res.render('admin/adminhome', { revenuedata, ordersData, monthlyEarnings, yearlyEarnings ,hitRateData })
    } catch (error) {
        console.error('Error during adminhome:', error);
        return res.redirect('/admin');
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

        const orders = await orderSchema
            .find({})

        if (!orders) {
            return res.status(404).json({ message: 'orders not found' });
        }

        res.render('admin/orders', { orders })

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
    orders,

}