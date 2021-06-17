const express = require('express');
const cors = require('cors');
const fs = require('fs');
const moment = require('moment');
const path = require('path');
require('dotenv').config({ path: '../.env' })

const app = express();
app.use(express.static('.'));
app.use(express.json());
app.use(cors());

const STRIPE_KEY = process.env.REACT_APP_SK;
const PASSID = 'price_1IzlfHGhEIci709rezgvELDE';
const PASSNAME = 'WranglerPass';

const stripe = require('stripe')(STRIPE_KEY);

app.get('/products', async (req, res) => {
    const products = await stripe.products.list({
        limit: 30,
    });
    res.send(products);
});

app.get('/productdetails/:id', async (req, res) => {
    const id = req.params.id;
    const product = await stripe.products.retrieve(id);
    const prices = await stripe.prices.list({
        product: req.params.id
    });
    const price = prices.data.find(x => x.nickname === PASSNAME) || prices.data[0];
    product.price = price;
    res.send({
        product
    });
});

app.get('/prices', async (req, res) => {
    const prices = await stripe.prices.list({
        limit: 30,
    });
    res.send(prices);
});

app.post('/create-checkout-session', async (req, res) => {
    const customer = req.body.customer;
    const quantity = req.body.quantity;
    const price = req.body.price;
    const product = req.body.product;
    const from = req.body.from;
    const to = req.body.to;
    
    try {
        const mode = price === PASSID ? 'subscription' : 'payment';
        const payload = {
            mode: mode,
            payment_method_types: ['card'],
            line_items: [
                {
                    price: price,
                    quantity: quantity
                },
            ],
            customer: customer,
            success_url: mode === 'payment' 
                ? 'http://localhost:3000/confirm/{CHECKOUT_SESSION_ID}'
                : 'http://localhost:3000/profile',
            cancel_url: 'http://localhost:3000'
        };
        const session = await stripe.checkout.sessions.create(payload);

        // Copy metadata if passed
        if (mode === 'payment'){
            const pi = await stripe.paymentIntents.update(
                session.payment_intent,
                {
                    metadata: {
                        productId: product.id,
                        productName: product.name,
                        from: from,
                        to: to
                    }
                }
            );
        }
        
        res.send({
            sessionId: session.id,
        });
    } catch (e) {
        res.status(400);
        return res.send({
            error: {
                message: e.message,
            }
        });
    }
});

// Create a payment intent and return the client secret to the browswer
app.post("/create-payment-intent", async (req, res) => {
    const item = req.body.item;
    const quantity = req.body.quantity;
    const description = req.body.description;
    const custId = req.body.custId;
    const product = req.body.product;
    const from = req.body.from;
    const to = req.body.to;

    const price = await stripe.prices.retrieve(item);

    const paymentIntent = await stripe.paymentIntents.create({
        description: description,
        amount: quantity * price.unit_amount,
        currency: "usd",
        statement_descriptor: description,
        setup_future_usage: 'off_session',
        //capture_method: 'manual',
        customer: custId,
        //application_fee_amount: 150,
        //transfer_data: {
        //    destination: 'acct_1IzoRlK8JPnY2LKn',
        //},
        //on_behalf_of: 'acct_1IzoRlK8JPnY2LKn',
        metadata: {
            productId: product.id,
            productName: product.name,
            from: from,
            to: to
        },
        transfer_group: 'ABCDEF_1034'
        //}, {stripeAccount: 'acct_1IzoRlK8JPnY2LKn'});
    });

    res.send({
        clientSecret: paymentIntent.client_secret
    });
});

// Get customer's information
app.get('/customer/:id', async (req, res) => {
    const id = req.params.id;
    const customer = await stripe.customers.retrieve(id);
    res.send({
        custId: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone
    });
});

// Get customer's payments
app.get('/payments/:id', async (req, res) => {
    const id = req.params.id;
    const payments = await stripe.paymentIntents.list({ customer: id });
    res.send(payments.data);
});

// Update a customer
app.post("/customer/:id", async (req, res) => {
    const id = req.params.id;
    const name = req.body.name;
    const phone = req.body.phone;
    const customer = await stripe.customers.update(
        id,
        {
            name: name,
            phone: phone
        }
    );
    res.send({
        custId: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone
    });
});

// Find or create customer based on their email
app.post("/customer", async (req, res) => {
    const mode = req.body.mode;
    const email = req.body.email;
    const name = req.body.name;
    const phone = req.body.phone;

    const existingCustomer = await stripe.customers.list({ email: email });

    if (existingCustomer.data.length > 0) {
        res.send({
            custId: existingCustomer.data[0].id,
            name: existingCustomer.data[0].name,
            email: existingCustomer.data[0].email,
            phone: existingCustomer.data[0].phone
        });
    }
    else if (mode === 'create') {
        const newCustomer = await stripe.customers.create({
            name: name,
            email: email,
            phone: phone
        });
        res.send({
            custId: newCustomer.id,
            name: name,
            email: email,
            phone: phone
        });
    }
    else {
        res.send({
            custId: ''
        });
    }
});

// Is customer subscribed to WranglerPass
app.get('/subscription/:id', async (req, res) => {
    const id = req.params.id;
    const subscriptions = await stripe.subscriptions.list({
        customer: id,
        price: PASSID,
        status: 'active'
    });
    if (subscriptions.data.length > 0 && !subscriptions.data[0].pause_collection) {
        res.send({
            count: subscriptions.data.length,
            startdate: moment.unix(subscriptions.data[0].current_period_start).format('dddd, MMMM Do, YYYY'),
            enddate: moment.unix(subscriptions.data[0].current_period_end).format('dddd, MMMM Do, YYYY')
        });
    }
    else {
        res.send({
            count: 0
        });
    }
});

// Webhook handling
app.post("/webhooks", async (req, res) => {
    const event = req.body;
    console.log("Got event: " + event.type)

    switch (event['type']) {
        case 'payment_intent.succeeded':
            const pi = event.data.object;
            const client = pi.receipt_email || pi.charges.data[0].billing_details.email;
            const content = client + "|" + pi.amount_received / 100 + "|" + pi.metadata.productId + "|" + pi.metadata.productName + "|" + pi.metadata.from + "|" + pi.metadata.to + "\r\n";
            fs.appendFile('./reservations/paid.log', content, err => {
                if (err) {
                    console.error(err)
                    return
                }
            })


            // Create a Transfer to the connected account (later):
            const transfer = await stripe.transfers.create({
                amount: 2100,
                currency: 'usd',
                destination: 'acct_1IzoRlK8JPnY2LKn',
                transfer_group: 'ABCDEF_1034',
            });

            // Create a second Transfer to another connected account (later):
            const secondTransfer = await stripe.transfers.create({
                amount: 3000,
                currency: 'usd',
                destination: 'acct_1IzlLK2c84Rn6XLf',
                transfer_group: 'ABCDEF_1034',
            });


            break;
        default:
        // Unhandled events
    }
    // Send basic 200
    res.send();
});

// Get checkout session details for Checkout success page
app.get('/session/:id', async (req, res) => {
    const id = req.params.id;
    console.log("retrieving checkout session " + id);
    const session = await stripe.checkout.sessions.retrieve(id);
    console.log(session);
    const pi = await stripe.paymentIntents.retrieve(session.payment_intent);

    res.send({
        productId: pi.metadata.productId,
        productName: pi.metadata.productName,
        receipt: pi.id,
        email: pi.charges.data[0].billing_details.email
    });
});

// Customer portal
app.post('/create-customer-portal-session', async (req, res) => {
    const custId = req.body.custId;
    const session = await stripe.billingPortal.sessions.create({
        customer: custId,
        return_url: 'http://localhost:3000/profile',
    });
    res.send({
        url: session.url
    });
});

app.listen(8081);