import React, { useState, useEffect } from 'react';
import NumberFormat from 'react-number-format';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaravan } from '@fortawesome/free-solid-svg-icons';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';

import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from '@stripe/stripe-js';
import '../styles/checkout.css';

const moment = require('moment');

export default function ProductReserve(props) {
    // Elements
    const stripe = useStripe();
    const elements = useElements();

    // Dates and price
    const [dateAndPriceOpen, setDateAndPriceOpen] = useState(true);
    const [fromDate, setFromDate] = useState();
    const [toDate, setToDate] = useState();
    const [duration, setDuration] = useState();
    const [price, setPrice] = useState();
    const [priceFormatted, setPriceFormatted] = useState();
    const [formValid, setFormValid] = useState(false);

    // Reserve button
    const [showReserveButtons, setShowReserveButtons] = useState(true);

    // Elements
    const [customCheckoutOpen, setCustomCheckoutOpen] = useState(false);
    const [succeeded, setSucceeded] = useState(false);
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState('');
    const [disabled, setDisabled] = useState(true);
    const [clientSecret, setClientSecret] = useState('');
    const [receipt, setReceipt] = useState();

    const styles = {
        title: {
            fontWeight: 500,
            fontSize: '2em'
        },
        green: {
            backgroundColor: '#00A600',
            color: 'white',
            marginTop: 20
        },
        greenDisabled: {
            backgroundColor: '#00A600',
            opacity: 0.5,
            cursor: 'default',
            color: 'white',
            marginTop: 20
        },
        summarySection: {
            textAlign: 'right',
            fontSize: 'larger',
            padding: '20px 13px 0 13px'
        },
        success: {
            fontSize: 'larger'
        },
        receipt: {
            backgroundColor: '#425466',
            borderRadius: 4,
            padding: '2px 6px',
            color: 'white'
        },
        discounted: {
            backgroundColor: 'orange',
            width: 'fit-content',
            float: 'right',
            color: 'white',
            fontSize: 'smaller',
            padding: '0px 6px',
            borderRadius: 4
        },
        error: {
            color: 'red'
        },
        bolded: {
            fontWeight: 500
        }
    }

    const cardStyle = {
        style: {
            base: {
                color: "#32325d",
                fontFamily: 'Arial, sans-serif',
                fontSmoothing: "antialiased",
                fontSize: "16px",
                "::placeholder": {
                    color: "#32325d"
                }
            },
            invalid: {
                color: "#fa755a",
                iconColor: "#fa755a"
            }
        }
    };

    const unitPrice = props.product.price.unit_amount / 100;
    const unitPriceId = props.product.price.id;

    const handleDateChange = (e) => {
        if (e.target.id === 'From') setFromDate(e.target.value);
        if (e.target.id === 'To') setToDate(e.target.value);
    }

    const calculateDays = (from, to) => {
        var start = moment(from);
        var end = moment(to);
        return end.diff(start, "days");
    }

    // Recalculate duration and form validity whenever the dates change
    useEffect(() => {
        const formValid = fromDate !== '' && toDate !== '' && fromDate < toDate;
        setFormValid(formValid);
        setDuration(formValid ? calculateDays(fromDate, toDate) : 0);
    }, [fromDate, toDate]);

    // Recalculate price whenever duration changes
    useEffect(() => {
        const price = duration * unitPrice;
        const priceFormatted = price.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
        setPrice(price);
        setPriceFormatted(priceFormatted);
    }, [duration, unitPrice]);

    // When clicking the Reserve button, we want to hide the Reserve and Checkout buttons, and show the Customer Info section
    const goElements = (e) => {
        setShowReserveButtons(false);
        setCustomCheckoutOpen(true);
    }

    // Create PaymentIntent when the custom checkout form is opened
    useEffect(() => {
        if (customCheckoutOpen) {
            // First we get/ create the customer and add its ID to the state
            fetch("/create-payment-intent", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    item: unitPriceId,
                    quantity: duration,
                    custId: props.custId,
                    product: props.product,
                    from: fromDate,
                    to: toDate
                })
            })
                .then(res => res.json())
                .then(data => {
                    setClientSecret(data.clientSecret);
                });
        }
    }, [customCheckoutOpen]);

    // Listen for changes in the CardElement
    // and display any errors as the customer types their card details
    const handleChange = async (event) => {
        setDisabled(event.empty);
        setError(event.error ? event.error.message : "");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setProcessing(true);
        const payload = await stripe.confirmCardPayment(clientSecret, {
            receipt_email: props.email,
            payment_method: {
                card: elements.getElement(CardElement)
            }
            //}, {stripeAccount: 'acct_1IzoRlK8JPnY2LKn'});
        });

        if (payload.error) {
            setError(`Payment failed ${payload.error.message}`);
            setProcessing(false);
        } else {
            setError(null);
            setProcessing(false);
            setSucceeded(true);
            setDateAndPriceOpen(false);
            setCustomCheckoutOpen(false);
            setReceipt(payload.paymentIntent.id);
        }
    };

    const goCheckout = async (e) => {
        e.preventDefault();

        const stripe = await loadStripe(process.env.REACT_APP_PK);
        const response = await fetch("/create-checkout-session", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                customer: props.custId,
                price: props.product.price.id,
                quantity: duration,
                product: props.product,
                from: fromDate,
                to: toDate
            })
            //}, {stripeAccount: 'acct_1IzoRlK8JPnY2LKn'});
        });

        const session = await response.json();
        const result = await stripe.redirectToCheckout({
            sessionId: session.sessionId
        })
    };

    return (
        <>
            <div className="row">
                <p style={styles.title}>Reserve {props.product.name}</p>
            </div>
            {dateAndPriceOpen && <>
                <div className="row">
                    <div className="col-6">
                        <label htmlFor="From" className="form-label">From</label>
                        <input type="date" className="form-control" id="From" onChange={handleDateChange} />

                    </div>
                    <div className="col-6">
                        <label htmlFor="To" className="form-label">To</label>
                        <input type="date" className="form-control" id="To" onChange={handleDateChange} />
                    </div>
                </div>
                <div className="row">
                    <div className="col" style={styles.summarySection}>
                        <NumberFormat value={unitPrice} displayType={'text'} thousandSeparator={true} prefix={'$'} /> x {duration} day{duration > 1 ? 's' : ''} = <NumberFormat value={price} displayType={'text'} thousandSeparator={true} prefix={'$'} />
                        {props.product.price.nickname && props.product.price.nickname.toString().indexOf('WranglerPass') > -1 &&
                            <><br /><div style={styles.discounted}>WranglerPass 10% discount applied!</div></>
                        }
                    </div>
                </div>
                {showReserveButtons && <div className="row">
                    <div className="col">
                        <button disabled={!formValid} id="Reserve" className="form-control" style={!formValid ? styles.greenDisabled : styles.green} onClick={goElements}>
                            Reserve <FontAwesomeIcon icon={faCaravan} />
                        </button>
                    </div>
                    <div className="col">
                        <button disabled={!formValid} id="Checkout" className="form-control" style={!formValid ? styles.greenDisabled : styles.green} onClick={goCheckout}>
                            Checkout <FontAwesomeIcon icon={faCaravan} />
                        </button>
                    </div>
                </div>}
                <div className="row">&nbsp;</div>
            </>}
            <div className="row">
                <form id="payment-form" onSubmit={handleSubmit}>
                    {customCheckoutOpen && <>
                        <CardElement id="card-element" options={cardStyle} onChange={handleChange} />
                        <button disabled={processing || disabled || succeeded} id="submit" className="form-control">
                            <span id="button-text">
                                {processing ? <div className="spinner" id="spinner"></div> : "Pay $" + priceFormatted + " now"}
                            </span>
                        </button>
                        {error && <div className="card-error" role="alert">{error}</div>}
                        <p className={succeeded ? "result-message" : "result-message hidden"}>Payment succeeded</p>
                    </>}
                </form>
            </div>
            {succeeded && <div className="row">
                <div className="col" style={styles.success}>
                    <FontAwesomeIcon icon={faCheckCircle} /> You're all set! We'll send an email to <span style={styles.bolded}>{props.email}</span> with all the relevant details.<br /><br />
                    Your receipt number is: <span style={styles.bolded}>{receipt}</span>
                </div>
            </div>}
        </>
    );
}