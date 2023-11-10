const productSchema = require('../modal/productSchema')
const couponSchema = require('../modal/couponSchema')


// coupon render page admin
const CouponPage = async (req, res) => {
    try {
        const coupons = await couponSchema.find();

        res.render('admin/coupon', { coupons });
    } catch (error) {
        console.error('Error fetching coupons:', error);
        res.status(500).send('Internal server error');
    }
}

// creating coupon
const CreateCoupon = async (req, res) => {
    try {
        console.log('body', req.body);
        const { couponcode, discountamount, expirationdate, minimumpurchase } = req.body;
        const currentDate = new Date();
        const selectedDate = new Date(expirationdate);

        if (selectedDate <= currentDate) {
            return res.status(400).send('Expiration date must be in the future.');
        }

        const newCoupon = new couponSchema({
            couponCode: couponcode,
            discountAmount: discountamount,
            expirationDate: expirationdate,
            minimumpurchase: minimumpurchase,
        });

        await newCoupon.save();
        res.redirect('/couponpage')

    } catch (error) {
        console.error('Error during CreateCoupon:', error);
        res.status(500).send('Internal server error');
    }
}


const RedeemCoupon = async (req, res) => {
    try {
        const { couponCode } = req.body;

        const coupon = await couponSchema.findOne({ couponCode: couponCode });
        if (coupon) {

            const discountAmount = coupon.discountAmount;
            const minimumPurchase = coupon.minimumpurchase;

            return res.json({ discountAmount, minimumPurchase });

        } else {

            return res.status(404).json({ error: 'Coupon not found' });
        }
    } catch (error) {
        console.error('Error during RedeemCoupon:', error);
        res.status(500).send('Internal server error');
    }
}

const offerPage = async (req, res) => {
    try {

        const coupons = await couponSchema.find();

        res.render('user/offer', { coupons })

    } catch (error) {
        console.error('Error during offerPage:', error);
        res.status(500).send('Internal server error');
    }
}



module.exports = {
    CouponPage, CreateCoupon,
    RedeemCoupon, offerPage,
}