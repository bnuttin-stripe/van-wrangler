import React, { useState, useEffect } from 'react';

export default function ProfileInfo(props) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [processing, setProcessing] = useState(false);

    const styles = {
    }

    useEffect(() => {
        fetch('/customer/' + props.custId)
            .then(res => res.json())
            .then(customer => {
                setName(customer.name);
                setEmail(customer.email);
                setPhone(customer.phone)
            })
    }, []);

    const updateCustomer = (e) => {
        e.preventDefault();
        setProcessing(true);
        fetch("/customer/" + props.custId, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name,
                phone: phone
            })
        })
            .then(res => res.json())
            .then(customer => {
                setProcessing(false);
                setName(customer.name);
                setPhone(customer.phone)
            });
    }

    return (
        <form onSubmit={updateCustomer}>
            <div><h2>Your Information</h2></div>
            <div className="mb-3">
                <label htmlFor="name" className="form-label">Name</label>
                <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input disabled type="text" className="form-control" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="mb-3">
                <label htmlFor="phone" className="form-label">Phone</label>
                <input type="text" className="form-control" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input className="form-control" type="password" />
                <small className="form-text">Password is not functional in demo app</small>
            </div>
            <button className=" btn btn-primary" type="submit">
                <span id="button-text">
                    {processing ? <div className="spinner" id="spinner"></div> : "Update"}
                </span>
            </button>
        </form>

    )
}
