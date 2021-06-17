import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { faFileInvoiceDollar } from '@fortawesome/free-solid-svg-icons';

export default function ProfileSubscribe(props) {
    const [processing, setProcessing] = useState(true);
    const [subs, setSubs] = useState(0);

    const styles = {
        spacer: {
            marginTop: 50
        }
    }

    useEffect(() => {
        setProcessing(true);
        fetch('/subscription/' + props.custId)
            .then(res => res.json())
            .then(data => {
                setSubs(data);
                setProcessing(false);
            })
    }, []);

    const createCustPortalSession = (e) => {
        e.preventDefault();
        fetch("/create-customer-portal-session", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                custId: props.custId
            })
        })
            .then(res => res.json())
            .then(res => {
                window.open(res.url);
            })
    }

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
                price: 'price_1IzlfHGhEIci709rezgvELDE',
                quantity: 1
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
            <h2>WranglerPass</h2>
            {processing && <div><div className="spinner-border spinner-border-sm" style={{ margin: 10 }} role="status">
            </div></div>}
            {!processing && subs.count == 1 &&
                <>
                    <div>Thanks for being a valued WranglerPass member! Your current subscription is valid until <strong>{subs.enddate}</strong>. </div>
                    <form style={{paddingTop: 20}} onSubmit={createCustPortalSession}>
                        <button className="btn btn-primary" type="submit">
                            Manage billing &nbsp;&nbsp; <FontAwesomeIcon icon={faFileInvoiceDollar} />
                        </button>
                    </form>
                </>
            }
            {!processing && subs.count == 0 && 
                <>
                    <div>You are not currently a WranglerPass member. If you go on a lot of adventures, this is a great way to save on rentals!</div>
                    <form style={{paddingTop: 20}} onSubmit={goCheckout}>
                        <button className="btn btn-primary" type="submit">
                            Subscribe Now! &nbsp;&nbsp; <FontAwesomeIcon icon={faStar} />
                        </button>
                    </form>
                </>
            }  
        </>        
     )
}
